import { Movie } from "../models/Movie.js";
import { MovieShowing } from "../models/MovieShowing.js";
import { Seat } from "../models/Seats.js";
import { sequelize } from "../db.js";


export const findAllMovies = async (req, res) => 
{
    try 
    {
        const movies = await Movie.findAll();
        return res.json(movies);

    } 
    
    catch (error) 
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
        const oneMovie = await Movie.findOne({ where: { id }, include: [{ model: MovieShowing, as: "movieShowings" }] });

        if (!oneMovie) {
            return res.status(404).send({ message: "Película no encontrada" });
        }

        return res.json(oneMovie);

    } 
    
    catch (error) 
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

        if (!title || !genre || !director || rating == null || !duration || !synopsis || !releaseDate) 
        {
            return res.status(400).json({ message: "Los campos título, género, director, rating, duración, sinopsis y fecha de estreno son requeridos" });
        }

        const parsedRating = parseFloat(rating);
        if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 10) 
        {
            return res.status(400).json({ message: "El rating debe ser un número entre 0 y 10" });
        }

        const parsedDuration = parseInt(duration, 10);
        if (isNaN(parsedDuration) || parsedDuration <= 0) 
        {
            return res.status(400).json({ message: "La duración debe ser un número entero mayor a 0" });
        }

        const existingMovie = await Movie.findOne({
            where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('title')),
                sequelize.fn('LOWER', title)
            )
        });

        if (existingMovie) 
        {
            return res.status(409).json({ 
                message: `La película "${title}" ya existe en la base de datos` 
            });
        }

        const newMovie = await Movie.create(
        {
            title,
            genre,
            director,
            rating: parsedRating,
            duration: parsedDuration,
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
        if (!movieToUpdate) return res.status(404).json({ message: "Película no encontrada" });

        
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (genre !== undefined) updateData.genre = genre;
        if (director !== undefined) updateData.director = director;
        if (rating !== undefined) updateData.rating = rating;
        if (duration !== undefined) updateData.duration = duration;
        if (synopsis !== undefined) updateData.synopsis = synopsis;
        if (poster !== undefined) updateData.poster = poster;
        if (posterCarousel !== undefined) updateData.posterCarousel = posterCarousel;
        if (releaseDate !== undefined) updateData.releaseDate = releaseDate;

        await movieToUpdate.update(updateData);

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

        if (!movieToDelete) {
            return res.status(404).json({ message: "Película no encontrada" });
        }

        const showingsCount = await MovieShowing.count({ where: { movieId: id } });
        if (showingsCount > 0) {
            return res.status(400).json({ message: "No se puede eliminar la película porque tiene funciones programadas" });
        }

        await movieToDelete.destroy();
        return res.status(200).json({ message: `Película con id: ${id} eliminada correctamente` });
    }
    catch (error) 
    {
        console.error("Error deleting movie:", error);
        return res.status(500).json({ message: error.message || "Error interno" });
    }
};