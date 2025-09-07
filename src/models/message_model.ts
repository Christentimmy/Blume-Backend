import mongoose, { Schema, Document } from "mongoose";

// Define the message schema
const messageSchema = new Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    replyToMessage: { type: Object, required: false },
    replyToMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
    avater: { type: String, required: false },
    iv: { type: String, required: false },
    mediaIv: { type: String, required: false },
    messageType: {
      type: String, // 'text', 'image', 'video', etc.
      default: "text",
    },
    mediaUrl: { type: String, required: false },
    multipleImages: [
      {
        mimetype: { type: String, required: true },
        mediaUrl: { type: String, required: true },
        mediaIv: { type: String, required: true },
      },
    ],
    clientGeneratedId: { type: String, required: false },
    isDeleted: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    status: {
      type: String, // 'sent', 'delivered', 'read'
      default: "sent",
    },
    storyMediaUrl: { type: String, required: false },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create a model for messages
const Message = mongoose.model<MessageDocument>("Message", messageSchema);

// Export the model
export default Message;

// Define the TypeScript interface for Message
export interface MessageDocument extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message?: string | null;
  messageType: string;
  mediaUrl?: string | null;
  status: string;
  iv?: string | null;
  mediaIv?: string | null;
  timestamp: Date;
  clientGeneratedId?: string;
  isDeleted?: boolean;
  isEdited?: boolean;
  avater?: string;
  replyToMessage?: MessageDocument | null;
  replyToMessageId?: mongoose.Types.ObjectId | null;
  multipleImages: {
    mimetype: string;
    mediaUrl: string;
    mediaIv: string;
    filename: string;
  }[];
}
