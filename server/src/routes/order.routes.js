
import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js"
import { createOrder, getUserOrders, getAllOrders, deleteOrder, cancelOrder} from "../services/order.services.js";


const router = Router();


router.post("/", verifyToken, createOrder);

router.get("/mine", verifyToken, getUserOrders);

router.delete("/:id", verifyToken, deleteOrder);

router.get("/all", verifyToken, authorize(["admin", "sysadmin"]), getAllOrders);

router.patch("/:id/cancel", verifyToken, cancelOrder)

export default router;
