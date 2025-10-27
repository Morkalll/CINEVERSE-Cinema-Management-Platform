
import { MovieShowing } from "../models/MovieShowing.js";
import { Movie } from "../models/Movie.js";
import { Seat } from "../models/Seats.js";


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
            return res.status(404).json({ message: "MovieShowing no encontrada" });
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
        const { movieId, showtime, screenId, ticketPrice } = req.body;
        
        const showing = await MovieShowing.create(
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
                    showingId: showing.id
                });
            }
        }
        
        await Seat.bulkCreate(seats);
        
        console.log(`Función ${showing.id} creada con ${seats.length} asientos`);
        
        res.status(201).json(showing);
        
    } 

    catch (error) 
    {
        console.error(error);
        res.status(500).json({ message: "Error al crear función" });
    }
};


export const updateMovieShowings = async (req, res) => 
{
    try 
    {
        const { id } = req.params;
        const { movieId, showtime, screen, availableSeats } = req.body;

        const showingToUpdate = await MovieShowing.findByPk(id);
        if (!showingToUpdate) return res.status(404).json({ message: "MovieShowing no encontrado" });

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
    try 
    {
        const { id } = req.params;
        const showingToDelete = await MovieShowing.findByPk(id);

        if (!showingToDelete) return res.status(404).json({ message: "MovieShowing no encontrado" });

        await showingToDelete.destroy();
        return res.send(`MovieShowing con id: ${id} ha sido borrado`);

    } 
    
    catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }

};

