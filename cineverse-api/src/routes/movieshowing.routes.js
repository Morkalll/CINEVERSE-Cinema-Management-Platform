
import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js";
import { findAllMovieShowings, findOneMovieShowings, createMovieShowing, updateMovieShowing, deleteMovieShowing } from "../services/movieshowing.services.js";

const router = Router();

/* GET (listado) */
router.get("/movieshowings", findAllMovieShowings);

/* GET (ID) */
router.get("/movieshowings/:id", findOneMovieShowings);

/* POST */
router.post("/movieshowings", verifyToken, authorize(["admin", "sysAdmin"]), createMovieShowing);

/* PUT */
router.put("/movieshowings/:id", verifyToken, authorize(["admin", "sysAdmin"]), updateMovieShowing);

/* DELETE */
router.delete("/movieshowings/:id", verifyToken, authorize(["admin", "sysAdmin"]), deleteMovieShowing);

export default router;

