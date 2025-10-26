
import { Router } from "express";
import { registerUser, loginUser, getUser } from "../services/user.services.js";
import { registerAdmin } from "../services/admin.services.js";


const router = Router();


router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", getUser);


router.post("/register-admin", registerAdmin);


export default router;
