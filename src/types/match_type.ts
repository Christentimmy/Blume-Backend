import { Document, Types } from "mongoose";
import { IUser } from "./user_type";

export interface IMatch extends Document {
  users: Types.ObjectId[] | IUser[]; // always exactly 2 users
  createdAt: Date;
  lastMessage?: string; // optional - for chat preview
  isActive: boolean; // in case one unmatched
}
