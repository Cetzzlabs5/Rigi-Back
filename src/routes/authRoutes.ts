import { Router } from "express";
import AuthController, { register } from "../controllers/AuthController.js";

const router = Router();

// Ruta de registro (la que acabamos de crear)
router.post("/register", register);

// Ruta de login (el método estático de tu clase)
router.post("/login", AuthController.login);

export default router as Router;