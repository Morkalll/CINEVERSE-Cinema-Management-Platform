
import { MovieShowing } from "../models/MovieShowing.js";
import { Movie } from "../models/Movie.js";
import { Seat } from "../models/Seats.js";
import { sequelize } from "../db.js"; 

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
    const transaction = await sequelize.transaction();
    try 
    {
        const movieId = req.body.movieId
        const showtime = req.body.showtime
        const screenId = req.body.screenId
        const ticketPrice = req.body.price

        if (!movieId || !showtime) 
        {
            return res.status(400).json({ message: "MovieID y Showtime son requeridos" });
        }



        const newShowing = await MovieShowing.create(
        {
            movieId,
            showtime,
            screenId,
            ticketPrice
        });

    const seats = [];
            const rows = 5;
            const seatsPerRow = 8;
        
            for (let row = 1; row <= rows; row++) 
            {
                for (let seat = 1; seat <= seatsPerRow; seat++) 
                {
                    seats.push({
                        label: `${row}-${seat}`,
                        reserved: false,
                        showingId: newShowing.id
                    });
                }
        }
        
        await Seat.bulkCreate(seats);
        await transaction.commit();

        return res.status(201).json(newShowing);
       
    } 
    
    catch (error) 
    {
        await transaction.rollback()
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }

};


export const updateMovieShowings = async (req, res) => 
{
    try 
    {
        const { id } = req.params;
        const { movieId, showtime, screen, availableSeats } = req.body;

        const showingToUpdate = await MovieShowing.findByPk(id);
        if (!showingToUpdate) return res.status(404).json({ message: "Función no encontrada" });

        await showingToUpdate.update({ movieId, showtime, screen, availableSeats });
        await showingToUpdate.save();

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
    const transaction = await sequelize.transaction();
    
    try 
    {
        const { id } = req.params;
        const showingToDelete = await MovieShowing.findByPk(id, { transaction });

        if (!showingToDelete) {
            await transaction.rollback();
            return res.status(404).json({ message: "MovieShowing no encontrado" });
        }

        // Delete all seats for this showing first
        await Seat.destroy({ 
            where: { showingId: id },
            transaction 
        });

        // Then delete the showing
        await showingToDelete.destroy({ transaction });
        
        await transaction.commit();
        return res.status(200).json({ message: `Función con id: ${id} eliminada correctamente` });

    } 
    catch (error) 
    {
        await transaction.rollback();
        console.error("Error deleting showing:", error);
        return res.status(500).json({ message: error.message || "Error interno" });
    }
};

