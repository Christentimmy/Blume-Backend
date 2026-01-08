import express from "express";
import { authController } from "../controllers/auth_controller";
import tokenValidationMiddleware from "../middlewares/token_validator";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.loginUser);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);


router.post("/reset-password", authController.resetPassword);

router.use(tokenValidationMiddleware);
router.post("/logout", authController.logoutUser);
router.post("/change-password", authController.changePassword);

export default router;
