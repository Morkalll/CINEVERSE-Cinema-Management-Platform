
import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js";
import { findAllMovieShowings, findOneMovieShowings, createMovieShowings, updateMovieShowings, deleteMovieShowings } from "../services/movieshowing.services.js";

const router = Router();

/* GET (listado) */
router.get("/movieshowings", findAllMovieShowings);

/* GET (ID) */
router.get("/movieshowings/:id", findOneMovieShowings);

/* POST */
router.post("/movieshowings", verifyToken, authorize(["admin", "sysAdmin"]), createMovieShowings);

/* PUT */
router.put("/movieshowings/:id", verifyToken, authorize(["admin", "sysAdmin"]), updateMovieShowings);

/* DELETE */
router.delete("/movieshowings/:id", verifyToken, authorize(["admin", "sysAdmin"]), deleteMovieShowings);

export default router;

