import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js";
import { findAllScreens, findOneScreen, createScreen, updateScreen, deleteScreen} from "../services/screen.services.js";

const router = Router();

/* GET (listado) */
router.get("/screens", findAllScreens);


/* GET (ID) */
router.get("/screens/:id", findOneScreen);

/* POST */
router.post("/screens", verifyToken, authorize(["admin", "sysAdmin"]), createScreen);

/* PUT */
router.put("/screens/:id", verifyToken, authorize(["admin", "sysAdmin"]), updateScreen);

/* DELETE */
router.delete("/screens/:id", verifyToken, authorize(["admin", "sysAdmin"]), deleteScreen);


export default router;

