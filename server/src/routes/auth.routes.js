
import { Router } from "express";
import { registerUser, loginUser, getUser, forgotPassword, resetPassword, changePassword } from "../services/user.services.js";
import { registerAdmin } from "../services/admin.services.js";
import { registerSysAdmin } from "../services/sysadmin.services.js";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js";



const router = Router();


router.post("/login", loginUser);

router.get("/profile/:id", verifyToken, getUser);

router.post("/register", registerUser);

router.post("/register-admin", verifyToken, authorize(["sysadmin"]), registerAdmin);

router.post("/register-sysadmin", verifyToken, authorize(["sysadmin"]), registerSysAdmin);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/change-password", verifyToken, changePassword);



export default router;
