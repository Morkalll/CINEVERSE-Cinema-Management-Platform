import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js";
import { findAllProducts, findOneProduct, createProduct, updateProduct, deleteProduct } from "../services/products.services.js";

const router = Router();

/* GET (listado) */
router.get("/candy", findAllProducts);

/* GET (ID) */
router.get("/candy/:id", findOneProduct);

/* POST */
router.post("/candy", verifyToken, authorize(["admin", "sysAdmin"]), createProduct);

/* PUT */
router.put("/candy/:id", verifyToken, authorize(["admin", "sysAdmin"]), updateProduct);

/* DELETE */
router.delete("/candy/:id", verifyToken, authorize(["admin", "sysAdmin"]), deleteProduct);

export default router;