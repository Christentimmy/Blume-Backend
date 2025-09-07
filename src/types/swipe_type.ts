
import { Schema, Document } from "mongoose";

export interface ISwipe extends Document {
  swiper: Schema.Types.ObjectId; // the user doing the swipe
  swiped: Schema.Types.ObjectId; // the user being swiped
  direction: "left" | "right";   // left = dislike, right = like
  createdAt: Date;
}