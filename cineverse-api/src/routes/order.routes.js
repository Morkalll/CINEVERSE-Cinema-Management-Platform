
import { Router } from "express";
import { createOrder, getUserOrders } from "../controllers/orderController.js";
import { verifyToken } from "../services/token.services.js";

const router = Router();

router.post("/", verifyToken, createOrder);
router.get("/mine", verifyToken, getUserOrders);

export default router;
