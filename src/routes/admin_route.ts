import { Router } from "express";
import { adminController } from "../controllers/admin_controller";
import tokenValidationMiddleware from "../middlewares/token_validator";
import { adminStatusChecker } from "../middlewares/status_middleware";

const router = Router();

router.post("/create", adminController.createAdmin);
router.post("/login", adminController.login);
router.get("/validate", adminController.validateToken);

router.use(tokenValidationMiddleware, adminStatusChecker);

router.get("/dashboard-stats", adminController.dashboardStats);
router.get("/weekly-activities", adminController.getWeeklyActivities);

router.get("/recent-users", adminController.recentUsers);
router.get("/get-all-users", adminController.getAllUsers);
router.patch("/update-user-status", adminController.updateUserStatus);


export default router;
