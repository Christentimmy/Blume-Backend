import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../types/user_type";

const UserSchema = new Schema<IUser>(
  {
    full_name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone_number: { type: String, default: "" },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    education: { type: String, default: "" },
    stripeCustomerId: {
      type: String,
      default: "",
    },
    // lifestyle: {
    //   smoking: { type: String, default: "" },
    //   drinking: { type: String, default: "" },
    //   workout: { type: String, default: "" },
    // },
    basics: {
      smoking: { type: String, default: "" },
      drinking: { type: String, default: "" },
      workout: { type: String, default: "" },
      occupation: { type: String, default: "" },
      religion: { type: String, default: "" },
      education: { type: String, default: "" },
      height: { type: String, default: "" },
      sexOrientation: { type: String, default: "" },
      languages: { type: [String], default: [] },

      //part2
      lifestyleAndValues: { type: [String], default: [] },
      hobbies: { type: [String], default: [] },
      artsAndCreativity: { type: [String], default: [] },
      sportsAndFitness: { type: [String], default: [] },
      travelAndAdventure: { type: [String], default: [] },
      entertainment: { type: [String], default: [] },
      music: { type: [String], default: [] },
      foodAndDrink: { type: [String], default: [] },
    },
    gender: {
      type: String,
      enum: [
        "male",
        "female",
        "others",
        "gay",
        "lesbian",
        "transgender",
        "queer",
      ],
    },
    showGender: { type: Boolean, default: true },
    interested_in: {
      type: String,
      enum: [
        "male",
        "female",
        "both",
        "gay",
        "lesbian",
        "transgender",
        "queer",
      ],
    },
    date_of_birth: { type: Date },
    location: {
      type: { type: String, default: "Point" },
      address: { type: String, default: "" },
      coordinates: { type: [Number], default: [0.0, 0.0] },
    },
    photos: [{ type: String }],
    hobbies: [{ type: String }],
    preferences: {
      ageRange: { type: [Number], default: [18, 50] },
      maxDistance: { type: Number, default: 50 },
    },
    role: {
      type: String,
      enum: ["user", "super_admin", "sub_admin", "staff"],
      default: "user",
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "banned", "blocked", "deleted"],
    },
    profile_completed: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    is_email_verified: { type: Boolean, default: false },
    is_phone_number_verified: { type: Boolean, default: false },
    last_active: { type: Date, default: Date.now },
    one_signal_id: {
      type: String,
      default: "",
    },
    relationship_preference: {
      type: String,
      enum: [
        "long term partner",
        "short term partner",
        "both",
        "new friends",
        "short term fun",
        "not sure yet",
      ],
      default: "not sure yet",
    },
    daily_swipes: { type: Number, default: 0 },
    daily_messages: { type: Number, default: 0 },
    plan: { type: String, enum: ["free", "subscribed"], default: "free" },
    boost: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date },
      boostType: {
        type: String,
        enum: ["boost1", "boost5", "boost10"],
        default: null,
      },
      boostMultiplier: { type: Number, default: 1.0 },
    },
    subscription: {
      planId: { type: String },
      status: {
        type: String,
        enum: [
          "active",
          "canceled",
          "past_due",
          "unpaid",
          "incomplete",
          "none",
        ],
        default: "none",
      },
      currentPeriodEnd: { type: Date },
      cancelAtPeriodEnd: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

UserSchema.index({ location: "2dsphere" });

export default mongoose.model<IUser>("User", UserSchema);
