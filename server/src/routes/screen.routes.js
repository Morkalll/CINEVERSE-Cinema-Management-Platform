import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js";
import { findAllScreens, findOneScreen, createScreen, deleteScreen} from "../services/screen.services.js";


const router = Router();


router.get("/screens", findAllScreens);

router.get("/screens/:id", findOneScreen);

router.post("/screens", verifyToken, authorize(["admin", "sysadmin"]), createScreen);

router.delete("/screens/:id", verifyToken, authorize(["admin", "sysadmin"]), deleteScreen);


export default router;