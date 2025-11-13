import axios from "axios";
import dotenv from "dotenv";
import Notification from "../models/notification_model";

dotenv.config();

const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
const oneSignalApiKey = process.env.ONESIGNAL_API_KEY;

if (!oneSignalAppId || !oneSignalApiKey) {
  console.error("Missing OneSignal credentials in environment variables.");
  process.exit(1);
}

enum NotificationType {
  LIKE = "like",
  SUPERLIKE = "superlike",
  MESSAGE = "message",
  MATCH = "match",
  INVITE = "invite",
  SYSTEM = "system",
}


const sendPushNotification = async (
  userId: string, 
  playerId: string, 
  type: NotificationType,
  message: string,
  link?: string
) => {
  try {
    const notification = new Notification({
      userId,
      type,
      message,
      link,
    });
    await notification.save();
  } catch (dbError) {
    console.error("Error saving notification to DB:", dbError);
    return;
  }

  if (!playerId) {
    console.warn(`User ${userId} has no OneSignal Player ID, skipping push notification.`);
    return;
  }

  const payload = {
    app_id: oneSignalAppId,
    include_player_ids: [playerId],
    headings: { en: "New Notification" },
    contents: { en: message },
    url: link,
  };

  try {
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      payload,
      {
        headers: {
          Authorization: `Basic ${oneSignalApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending push notification:", error.response?.data || error.message);  
  }
};

export { sendPushNotification, NotificationType };