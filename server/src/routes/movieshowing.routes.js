
import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js";
import { findAllMovieShowings, findOneMovieShowings, createMovieShowings, updateMovieShowings, deleteMovieShowings } from "../services/movieshowing.services.js";


const router = Router();


router.get("/movieshowings", findAllMovieShowings);

router.get("/movieshowings/:id", findOneMovieShowings);

router.post("/movieshowings", verifyToken, authorize(["admin", "sysAdmin"]), createMovieShowings);

router.put("/movieshowings/:id", verifyToken, authorize(["admin", "sysAdmin"]), updateMovieShowings);

router.delete("/movieshowings/:id", verifyToken, authorize(["admin", "sysAdmin"]), deleteMovieShowings);


export default router;

