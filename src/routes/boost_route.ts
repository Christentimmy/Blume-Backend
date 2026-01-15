import express from "express";
import { boostController } from "../controllers/boost_controller";
import tokenValidationMiddleware from "../middlewares/token_validator";
import { statusChecker } from "../middlewares/status_middleware";

const router = express.Router();

router.use(tokenValidationMiddleware, statusChecker);
router.post("/purchase", boostController.initialBoostPayment);
router.get("/status", boostController.getBoostStatus);

export default router;
