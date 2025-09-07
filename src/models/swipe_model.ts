import { Schema, model, Document } from "mongoose";
import { ISwipe } from "../types/swipe_type";



const swipeSchema = new Schema<ISwipe>(
  {
    swiper: { type: Schema.Types.ObjectId, ref: "User", required: true },
    swiped: { type: Schema.Types.ObjectId, ref: "User", required: true },
    direction: { type: String, enum: ["left", "right"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<ISwipe>("Swipe", swipeSchema);
