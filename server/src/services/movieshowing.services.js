import { MovieShowing } from "../models/MovieShowing.js";
import { Movie } from "../models/Movie.js";
import { Seat } from "../models/Seats.js";
import { sequelize } from "../db.js";
import { OrderItem } from "../models/OrderItem.js";
import Order from "../models/Order.js"; 

export const findAllMovieShowings = async (req, res) => 
{
    try 
    {
        const showings = await MovieShowing.findAll(
        {
            include: [{ model: Movie, as: "movie" }]
        });
        
        return res.json(showings);

    } 
    
    catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }

};


export const findOneMovieShowings = async (req, res) => 
{
    try 
    {
        const { id } = req.params;
        const oneShowing = await MovieShowing.findOne(
        {
            where: { id },
            include: [{ model: Movie, as: "movie" }]
        });

        if (!oneShowing) 
        {
            return res.status(404).json({ message: "Función no encontrada" });
        }

        return res.json(oneShowing);

    } 
    
    catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }

};


export const createMovieShowings = async (req, res) => 
{
    try 
    {
        const movieId = req.body.movieId;
        const showtime = req.body.showtime;
        const screenId = req.body.screenId;
        const ticketPrice = req.body.price;

        if (!movieId || !showtime || !screenId || ticketPrice == null) 
        {
            return res.status(400).json({ message: "MovieID, Showtime, ScreenID y Price son requeridos" });
        }

        const parsedPrice = parseFloat(ticketPrice);
        if (isNaN(parsedPrice) || parsedPrice <= 0)
        {
            return res.status(400).json({ message: "El precio debe ser mayor a 0" });
        }

        const showtimeDate = new Date(showtime);
        if (isNaN(showtimeDate.getTime()) || showtimeDate < new Date()) 
        {
            return res.status(400).json({ message: "La fecha y hora de la función no pueden estar en el pasado" });
        }

        const movie = await Movie.findByPk(movieId);
        if (!movie)
        {
            return res.status(404).json({ message: "Película no encontrada" });
        }

        const newStart = showtimeDate.getTime();
        const newEnd = newStart + movie.duration * 60000;

        const screenShowings = await MovieShowing.findAll({
            where: { screenId },
            include: [{ model: Movie, as: "movie" }]
        });

        for (const showing of screenShowings) 
        {
            const existingStart = new Date(showing.showtime).getTime();
            const existingEnd = existingStart + (showing.movie ? showing.movie.duration : 0) * 60000;

            if (newStart < existingEnd && newEnd > existingStart) 
            {
                return res.status(409).json({ 
                    message: `Conflicto de horario: la sala ya está ocupada por la función de '${showing.movie ? showing.movie.title : 'otra película'}' desde las ${new Date(existingStart).toLocaleTimeString()} hasta las ${new Date(existingEnd).toLocaleTimeString()}`
                });
            }
        }

        const transaction = await sequelize.transaction();
        try 
        {
            const newShowing = await MovieShowing.create(
            {
                movieId,
                showtime,
                screenId,
                ticketPrice: parsedPrice
            }, { transaction });

            const seats = [];
            const rows = 5;
            const seatsPerRow = 8;
        
            for (let row = 1; row <= rows; row++) 
            {
                for (let seat = 1; seat <= seatsPerRow; seat++) 
                {
                    seats.push({
                        label: `${row}-${seat}`,
                        status: 'Libre',
                        showingId: newShowing.id
                    });
                }
            }
            
            await Seat.bulkCreate(seats, { transaction });
            await transaction.commit();

            return res.status(201).json(newShowing);
        }
        catch (error)
        {
            await transaction.rollback();
            throw error;
        }
    } 
    catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const updateMovieShowings = async (req, res) => 
{
    try 
    {
        const { id } = req.params;
        const { movieId, showtime, screenId, price } = req.body;

        const showingToUpdate = await MovieShowing.findByPk(id);
        if (!showingToUpdate) return res.status(404).json({ message: "Función no encontrada" });

        
        const updateData = {};
        if (movieId !== undefined) updateData.movieId = movieId;
        if (showtime !== undefined) updateData.showtime = showtime;
        if (screenId !== undefined) updateData.screenId = screenId;
        if (price !== undefined) updateData.ticketPrice = price;

        await showingToUpdate.update(updateData);

        return res.json(showingToUpdate);

    } 
    
    catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }

};


export const deleteMovieShowings = async (req, res) => 
{
    try 
    {
        const { id } = req.params;
        const showingToDelete = await MovieShowing.findByPk(id);

        if (!showingToDelete) {
            return res.status(404).json({ message: "MovieShowing no encontrado" });
        }

        const activeOrdersCount = await OrderItem.count({
            where: {
                type: "ticket",
                refId: id
            },
            include: [{
                model: Order,
                where: {
                    status: ["created", "pending", "paid"]
                }
            }]
        });

        if (activeOrdersCount > 0) {
            return res.status(400).json({ message: "No se puede eliminar la función porque tiene reservas activas o pagadas" });
        }

        const transaction = await sequelize.transaction();
        try 
        {
            await Seat.destroy({ 
                where: { showingId: id },
                transaction 
            });

            await showingToDelete.destroy({ transaction });
            await transaction.commit();
            return res.status(200).json({ message: `Función con id: ${id} eliminada correctamente` });
        } 
        catch (error) 
        {
            await transaction.rollback();
            throw error;
        }
    } 
    catch (error) 
    {
        console.error("Error deleting showing:", error);
        return res.status(500).json({ message: error.message || "Error interno" });
    }
};