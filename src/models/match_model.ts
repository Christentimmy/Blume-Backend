import { Schema, model, Document } from "mongoose";

export interface IMatch extends Document {
  users: Schema.Types.ObjectId[];  // exactly 2 users in the match
  createdAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    users: {
      type: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
      validate: [(val: Schema.Types.ObjectId[]) => val.length === 2, "Match must have exactly 2 users"],
    },
  },
  { timestamps: true }
);

// prevent duplicate matches regardless of order
matchSchema.index({ users: 1 }, { unique: true });

export const MatchModel = model<IMatch>("Match", matchSchema);
