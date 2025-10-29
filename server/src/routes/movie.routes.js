import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js";
import { findAllMovies, findOneMovie, createMovie, updateMovie, deleteMovie } from "../services/movie.services.js";


const router = Router();


router.get("/movielistings", findAllMovies);

router.get("/movielistings/:id", findOneMovie);

router.post("/movielistings", verifyToken, authorize(["admin", "sysadmin"]), createMovie);

router.patch("/movielistings/:id", verifyToken, authorize(["admin", "sysadmin"]), updateMovie);

router.delete("/movielistings/:id", verifyToken, authorize(["admin", "sysadmin"]), deleteMovie);


export default router;