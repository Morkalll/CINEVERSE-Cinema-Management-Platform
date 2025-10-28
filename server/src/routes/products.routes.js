
import { Router } from "express";
import { verifyToken } from "../services/token.services.js";
import { authorize } from "../services/auth.services.js";
import { findAllProducts, findOneProduct, createProduct, updateProduct, deleteProduct } from "../services/products.services.js";


const router = Router();


router.get("/candy", findAllProducts);

router.get("/candy/:id", findOneProduct);

router.post("/candy", verifyToken, authorize(["admin", "sysadmin"]), createProduct);

router.put("/candy/:id", verifyToken, authorize(["admin", "sysadmin"]), updateProduct);

router.delete("/candy/:id", verifyToken, authorize(["admin", "sysadmin"]), deleteProduct);


export default router;