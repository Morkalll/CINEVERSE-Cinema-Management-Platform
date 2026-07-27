
import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { createPreference, handleWebhook, refundPayment, getPaymentStatus, verifyPayment } from "../services/payment.services.js";


const router = Router();


router.post("/create-preference", verifyToken, createPreference);

router.post("/webhook", handleWebhook);

router.post("/verify", verifyToken, verifyPayment);

router.post("/refund/:orderId", verifyToken, refundPayment);

router.get("/status/:orderId", verifyToken, getPaymentStatus);


export default router;
