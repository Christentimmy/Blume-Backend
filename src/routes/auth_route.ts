

import express from "express";
import { authController } from "../controllers/auth_controller";

const router = express.Router();

router.post("/login", authController.loginUser);
router.post("/register-with-number", authController.registerWithNumber);

export default router;
