import express from "express";
import { userController } from "../controllers/user_controller";
import tokenValidationMiddleware from "../middlewares/token_validator";
import uploadDatingPhotos from "../middlewares/upload";
import { statusChecker } from "../middlewares/status_middleware";

const router = express.Router();

router.use(tokenValidationMiddleware);

router.post("/update-name", userController.updateName);
router.patch("/update-dob", userController.updateDob);
router.patch("/update-gender", userController.updateGender);
router.patch("/update-preference", userController.updatePreference);
router.patch("/update-distance-preference", userController.distancePreference);
router.patch("/update-education", userController.updateEducation);
router.patch("/update-lifestyle", userController.updateLifestyle);
router.patch("/update-basic", userController.updateBasic);
router.post("/upload-dating-photos", uploadDatingPhotos.array("photos", 6),userController.uploadDatingPhotos);
router.patch("/update-location", userController.updateLocation);

router.use(statusChecker);
router.get("/get-potential-matches", userController.getPotentialMatches);
router.post("/swipe-user", userController.swipeUser);
router.post("/save-one-signal", userController.saveOneSignal);


export default router;
