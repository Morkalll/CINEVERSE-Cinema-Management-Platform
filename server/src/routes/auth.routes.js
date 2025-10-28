
import { Router } from "express";
import { registerUser, loginUser, getUser } from "../services/user.services.js";
import { registerAdmin } from "../services/admin.services.js";
import { registerSysAdmin } from "../services/sysadmin.services.js";



const router = Router();


router.post("/login", loginUser);

router.get("/profile", getUser);

router.post("/register", registerUser);

router.post("/register-admin", registerAdmin);

router.post("/register-sysadmin", registerSysAdmin);



export default router;
