
import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js"
import { createOrder, getUserOrders, getAllOrders, deleteOrder } from "../services/order.services.js";


const router = Router();


router.post("/", verifyToken, createOrder);

router.get("/mine", verifyToken, getUserOrders);

router.delete("/:id", verifyToken, deleteOrder);

router.get("/all", verifyToken, authorize(["sysadmin"]), getAllOrders);


export default router;
