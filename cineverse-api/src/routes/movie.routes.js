
import { Router } from "express"
import { verifyToken } from "../services/token.services.js"
import { findAllMovies, findOneMovie, createMovie, updateMovie, deleteMovie } from "../services/movie.services.js"


const router = Router()
 

/* GET */
router.get("/movielistings", verifyToken, findAllMovies)


/* GET (ID) */
router.get("/movielistings/:id", verifyToken, findOneMovie)


/* POST */
router.post("/movielistings", verifyToken, createMovie)


/* PUT */
router.put("/movielistings/:id", verifyToken, updateMovie)


/* DELETE */
router.delete("/movielistings/:id", verifyToken, deleteMovie)

export default router


