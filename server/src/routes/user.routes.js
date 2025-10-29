import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js";
import { findAllUsers, deleteUser, updateUser } from "../services/user.services.js";

const router = Router();

router.get("/users", verifyToken, authorize(["admin", "sysadmin"]), findAllUsers);
router.put("/users/:id", verifyToken, authorize(["sysadmin"]), updateUser);
router.delete("/users/:id", verifyToken, authorize(["sysadmin"]), deleteUser);

export default router;