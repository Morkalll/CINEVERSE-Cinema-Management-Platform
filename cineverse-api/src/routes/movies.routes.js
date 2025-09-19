
import { Router } from "express"
import { findAllMovies, findOneMovie, createMovie, updateMovie, deleteMovie } from "../services/movie.services.js"


const router = Router()
 

/* GET */
router.get("/movielistings", findAllMovies)


/* GET (ID) */
router.get("/movielistings/:id", findOneMovie)


/* POST */
router.post("/movielistings", createMovie)


/* PUT */
router.put("/movielistings/:id", updateMovie)


/* DELETE */
router.delete("/movielistings/:id", deleteMovie)

export default router


