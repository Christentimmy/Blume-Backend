import mongoose, { Document, Schema } from "mongoose";

export interface IVerification extends Document {
  user: mongoose.Types.ObjectId;
  type: "government_id" | "passport";
  document: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["government_id", "passport"]
    },
    document: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IVerification>("Verification", VerificationSchema);
