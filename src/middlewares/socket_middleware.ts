import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import userSchema from "../models/user_model";
import planLimits from "./plan_limit";
import { Match } from "../models/match_model";
import Message from "../models/message_model";

const authenticateSocket = async (
  socket: Socket,
  next: (err?: any) => void
) => {
  try {
    const token = socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      next(new Error("Authentication error: No token provided"));
      return;
    }

    // Verify the token
    const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET as string);

    const user = await userSchema.findById(decoded.id);

    if (!user) {
      next(new Error("Authentication error: User not found"));
      return;
    }

    socket.data.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
};

/**
 * Check if a user has reached their daily message limit
 * @param socket The Socket.io socket instance
 * @param receiverId The ID of the message receiver
 * @returns true if limit is reached, false otherwise
 */
export const checkMessageLimitSocket = async (
  socket: Socket,
  receiverId: string
): Promise<boolean> => {
  try {
    const sender = socket.data.user;
    if (!sender) return true; // Block if sender not found

    const user = await userSchema.findById(sender._id);
    if (!user) return true; // Block if user not found

    // Premium users bypass limits
    if (user.plan === "premium") return false;

    // ✅ Check if sender and receiver are matched
    const isMatch = await Match.exists({
      users: { $all: [sender._id, receiverId] },
    });

    // Check existing messages between users
    const existingMessages = await Message.countDocuments({
      $or: [
        { senderId: sender._id, receiverId },
        { senderId: receiverId, receiverId: sender._id },
      ],
    });

    // If not a match and no previous messages, enforce daily limit
    if (!isMatch && existingMessages === 0) {
      if (user.daily_messages >= planLimits[user.plan].messages) {
        return true; // Limit reached
      }

      // Increment daily message count
      user.daily_messages += 1;
      await user.save();
    }

    return false; // Allow message
  } catch (err) {
    console.error("Error in checkMessageLimitSocket:", err);
    return true; // Block on error
  }
};

export default authenticateSocket;
