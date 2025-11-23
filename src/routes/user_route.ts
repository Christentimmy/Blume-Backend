import express from "express";
import { userController } from "../controllers/user_controller";
import tokenValidationMiddleware from "../middlewares/token_validator";
import { uploadDatingPhotos } from "../middlewares/upload";
import { statusChecker } from "../middlewares/status_middleware";

const router = express.Router();

router.use(tokenValidationMiddleware);

router.get("/get-user-details", userController.getUserDetails);
router.post("/update-name", userController.updateName);
router.patch("/update-dob", userController.updateDob);
router.patch("/update-gender", userController.updateGender);
router.patch("/update-preference", userController.updatePreference);
router.patch("/update-distance-preference", userController.distancePreference);
router.patch("/update-bio", userController.updateBio);
router.patch("/update-lifestyle", userController.updateLifestyle);
router.patch("/update-basic", userController.updateBasic);
router.patch("/update-basic-2", userController.updateBasic2);
router.post(
  "/upload-dating-photos",
  uploadDatingPhotos.array("photos", 6),
  userController.uploadDatingPhotos
);
router.patch("/update-location", userController.updateLocation);

router.use(statusChecker);
router.get("/get-potential-matches", userController.newGetPotentialMatches);
router.post("/swipe-user", userController.swipeUser);
router.post("/save-one-signal", userController.saveOneSignal);
router.get("/get-matches", userController.getMatches);
router.get("/get-users-who-liked-me", userController.getUsersWhoLikedMe);
router.get("/get-user-notifications", userController.getUserNotifications);
router.patch("/mark-notifications-read", userController.markNotificationsRead);
router.get("/get-profile-stats", userController.getProfileStats);
router.get("/get-user-with-id/:userId", userController.getUserWithId);
router.get("/search-user", userController.searchUser);

export default router;
