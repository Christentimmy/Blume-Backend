import express from "express";
import { uploadMultipleImages, convertFileToMedia, getChatList, getUnreadMessageCount, sendMessage, getMessageHistory, markMessageAsRead } from "../controllers/message_controller";
import tokenValidationMiddleware from "../middlewares/token_validator";
import {statusChecker} from "../middlewares/status_middleware";
import { uploadMessageMedia } from "../middlewares/upload";
const router = express.Router();



router.use(tokenValidationMiddleware);
router.use(statusChecker);

router.post("/send", sendMessage);
router.get("/history/:otherUserId", getMessageHistory);
router.patch("/:messageId/read", markMessageAsRead);
router.get("/unread-count/:chatWith", getUnreadMessageCount);
router.get("/get-chat-list", getChatList);
router.post("/upload", uploadMessageMedia.single("file"), convertFileToMedia);
router.post("/upload-multiple-images", uploadMessageMedia.array("mul-images", 10), uploadMultipleImages);



export default router;
