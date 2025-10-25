
import { Router } from "express";
import { getSeats } from "../services/seat.services";


const router = Router();


router.get("/showtimes/:id/seats", getSeats)


export default router;