
import { Router } from "express";
import { registerUser, loginUser, getUser } from "../services/user.services.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", getUser);

export default router;
