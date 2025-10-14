
import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js";
import { findAllMovies, findOneMovie, createMovie, updateMovie, deleteMovie } from "../services/movie.services.js";

const router = Router();

/* GET (listado) */
router.get("/movielistings", findAllMovies);

/* GET (ID) */
router.get("/movielistings/:id", findOneMovie);

/* POST */
router.post("/movielistings", verifyToken, authorize(["admin", "sysAdmin"]), createMovie);

/* PUT */
router.put("/movielistings/:id", verifyToken, authorize(["admin", "sysAdmin"]), updateMovie);

/* DELETE */
router.delete("/movielistings/:id", verifyToken, authorize(["admin", "sysAdmin"]), deleteMovie);

export default router;

