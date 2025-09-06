import express from "express";
import { userController } from "../controllers/user_controller";
import tokenValidationMiddleware from "../middlewares/token_validator";

const router = express.Router();

router.use(tokenValidationMiddleware);

router.post("/update-name", userController.updateName);
router.patch("/update-dob", userController.updateDob);

export default router;
