
import { Router } from "express";
import { createOrder, getUserOrders, deleteOrder } from "../controllers/orderController.js";
import { verifyToken } from "../services/token.services.js";

const router = Router();

router.post("/", verifyToken, createOrder);
router.get("/mine", verifyToken, getUserOrders);
router.delete("/:id", verifyToken, deleteOrder);

export default router;
