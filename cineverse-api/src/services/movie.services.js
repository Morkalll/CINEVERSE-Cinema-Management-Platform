
import { Movie } from "../models/Movie.js";


export const findAllMovies = async (req, res) => 
{
    try 
    {
        const movies = await Movie.findAll();
        return res.json(movies);

    } catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const findOneMovie = async (req, res) => 
{
    try 
    {
        const { id } = req.params;
        const oneMovie = await Movie.findOne({ where: { id } });

        if (!oneMovie) 
        {
            return res.status(404).send({ message: "Movie not found" });
        }

        return res.json(oneMovie);

    } catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const createMovie = async (req, res) => 
{
    try 
    {
        const { title, genre, director, rating, duration, synopsis, poster, posterCarousel, releaseDate } = req.body;

        if (!title || !genre) 
        {
            return res.status(400).send({ message: "Title and genre fields are required" });
        }

        const newMovie = await Movie.create(
        {
            title,
            genre,
            director,
            rating,
            duration,
            synopsis,
            poster,
            posterCarousel,
            releaseDate
        });

        return res.status(201).json(newMovie);

    } 
    
    catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const updateMovie = async (req, res) => 
{
    try 
    {
        const { id } = req.params;
        const { title, genre, director, rating, duration, synopsis, poster, posterCarousel, releaseDate } = req.body;

        const movieToUpdate = await Movie.findByPk(id);
        if (!movieToUpdate) return res.status(404).json({ message: "Movie not found" });

        await movieToUpdate.update({ title, genre, director, rating, duration, synopsis, poster, posterCarousel, releaseDate });
        await movieToUpdate.save();

        return res.json(movieToUpdate);

    } 
    
    catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const deleteMovie = async (req, res) => 
{
    try 
    {
        const { id } = req.params;
        const movieToDelete = await Movie.findByPk(id);
    
        if (!movieToDelete) return res.status(404).json({ message: "Movie not found" });

        await movieToDelete.destroy();
        return res.send(`Movie with id: ${id} deleted`);

    } 
    
    catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};

