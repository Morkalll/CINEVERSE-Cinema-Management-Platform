
import { Router } from "express";
import { getSeats, getOccupiedSeats, reserveSeats, releaseSeats } from "../services/seat.services.js";
import { verifyToken } from "../services/token.services.js";


const router = Router();

router.get("/showtimes/:id/seats", getSeats);

router.get("/seats/occupied", getOccupiedSeats);

router.post("/seats/reserve", verifyToken, reserveSeats);

router.post("/seats/release", verifyToken, releaseSeats);


export default router;