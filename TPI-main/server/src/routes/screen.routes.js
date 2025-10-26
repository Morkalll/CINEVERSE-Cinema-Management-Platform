
import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js";
import { findAllScreens, findOneScreen, createScreen, updateScreen, deleteScreen} from "../services/screen.services.js";


const router = Router();


router.get("/screens", findAllScreens);

router.get("/screens/:id", findOneScreen);

router.post("/screens", verifyToken, authorize(["admin", "sysAdmin"]), createScreen);

router.put("/screens/:id", verifyToken, authorize(["admin", "sysAdmin"]), updateScreen);

router.delete("/screens/:id", verifyToken, authorize(["admin", "sysAdmin"]), deleteScreen);


export default router;

