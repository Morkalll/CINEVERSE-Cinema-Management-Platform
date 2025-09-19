
import { Movie } from "../models/Movie.js"


export const findAllMovies = async (req, res) =>
{
    const movies = await Movie.findAll()

    res.json(movies)

}


export const findOneMovie = async (req, res) =>
{
    const { id } = req.params

    const oneMovie = await Movie.findOne({ where: {  id: id } })

    if (!oneMovie)
    {
        res.status(404).send({ message: "Movie not found" })
    }

    res.json(oneMovie)

}


export const createMovie = async (req, res) =>
{
    const { title, genre, director, rating, duration, synopsis, poster, posterCarousel, releaseDate, isAvailable } = req.body

    // PONEMOS TÍTULO Y GÉNERO COMO OBLIGATORIOS
    if (!title || !genre)
    {
        res.status(400).send({ message: "Title and genre fields are required" })
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
        releaseDate,
        isAvailable
    })

    res.json(newMovie)

}


export const updateMovie = async (req, res) =>
{
    const { id } = req.params

    const { title, genre, director, rating, duration, synopsis, poster, posterCarousel, releaseDate, isAvailable } = req.body

    const movieToUpdate = await Movie.findByPk(id)

    await movieToUpdate.update(
    {
        title,
        genre,
        director,
        rating,
        duration,
        synopsis,
        poster,
        posterCarousel,
        releaseDate,
        isAvailable
    })

    await movieToUpdate.save()

    res.json(movieToUpdate)

}


export const deleteMovie = async (req, res) =>
{
    const { id } = req.params

    const movieToDelete = await Movie.findByPk(id)

    await movieToDelete.destroy()

    res.send(`Book with id: ${id} deleted`)

}

