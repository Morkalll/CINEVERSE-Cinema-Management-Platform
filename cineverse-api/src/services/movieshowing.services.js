import { MovieShowing } from "../models/MovieShowing.js";
import { Movie } from "../models/Movie.js";


export const findAllMovieShowings = async (req, res) => {
    try {
        const showings = await MovieShowing.findAll({
            include: [{ model: Movie, as: "movie" }]
        });
        return res.json(showings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const findOneMovieShowings = async (req, res) => {
    try {
        const { id } = req.params;
        const oneShowing = await MovieShowing.findOne({
            where: { id },
            include: [{ model: Movie, as: "movie" }]
        });

        if (!oneShowing) {
            return res.status(404).json({ message: "MovieShowing not found" });
        }

        return res.json(oneShowing);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const createMovieShowings = async (req, res) => {
    try {
        const movieId = req.body.movieId
        const showtime = req.body.showtime
        const screenId = req.body.screenId
        const ticketPrice = req.body.price
        if (!movieId || !showtime) {
            return res.status(400).json({ message: "movieId and showtime are required" });
        }

        const newShowing = await MovieShowing.create({
            movieId,
            showtime,
            screenId,
            ticketPrice
        });

        return res.status(201).json(newShowing);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const updateMovieShowings = async (req, res) => {
    try {
        const { id } = req.params;
        const { movieId, showtime, screen, availableSeats } = req.body;

        const showingToUpdate = await MovieShowing.findByPk(id);
        if (!showingToUpdate) return res.status(404).json({ message: "MovieShowing not found" });

        await showingToUpdate.update({ movieId, showtime, screen, availableSeats });
        await showingToUpdate.save();

        return res.json(showingToUpdate);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const deleteMovieShowings = async (req, res) => {
    try {
        const { id } = req.params;
        const showingToDelete = await MovieShowing.findByPk(id);

        if (!showingToDelete) return res.status(404).json({ message: "MovieShowing not found" });

        await showingToDelete.destroy();
        return res.send(`MovieShowing with id: ${id} deleted`);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};
