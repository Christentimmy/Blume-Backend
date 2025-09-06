

import express from "express";
import { authController } from "../controllers/auth_controller";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.loginUser);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);

export default router;
