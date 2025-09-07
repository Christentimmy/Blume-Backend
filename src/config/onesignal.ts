import axios from "axios";
import dotenv from "dotenv";
import Notification from "../models/notification_model";

dotenv.config();



const sendPushNotification = async (
  userId: string, 
  playerId: string, 
  type: "match" | "message" | "like" | "super_like" | "system",
  message: string,
  link?: string
) => {
  const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
  const oneSignalApiKey = process.env.ONESIGNAL_API_KEY;

  // Save notification in MongoDB
  try {
    const notification = new Notification({
      userId, // MongoDB User ID
      type,
      message,
      link,
    });
    await notification.save();
  } catch (dbError) {
    console.error("Error saving notification to DB:", dbError);
    return; // Prevent push notification if DB save fails
  }

  // Send push notification via OneSignal (only if playerId exists)
  if (!playerId) {
    console.warn(`User ${userId} has no OneSignal Player ID, skipping push notification.`);
    return;
  }

  const payload = {
    app_id: oneSignalAppId,
    include_player_ids: [playerId], // OneSignal Player ID
    headings: { en: "New Notification" },
    contents: { en: message },
    url: link, // Optional deep link
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

export default sendPushNotification;