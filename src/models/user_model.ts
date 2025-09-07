import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../types/user_type";

const UserSchema = new Schema<IUser>(
    {
        full_name: { type: String, default: "" },
        email: { type: String, required: true, unique: true, lowercase: true },
        phone_number: { type: String, default: "" },
        password: { type: String, required: true },
        avatar: { type: String, default: "" },
        bio: { type: String, default: "" },
        education: { type: String, default: "" },
        lifestyle: {
            smoking: { type: String, default: "" },
            drinking: { type: String, default: "" },
            workout: { type: String, default: "" },
        },
        basics: {
            occupation: { type: String, default: "" },
            religion: { type: String, default: "" },
        },
        gender: { type: String, enum: ["male", "female", "others"] },
        interested_in: {
            type: String,
            enum: ["male", "female", "both"],
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
        role: { type: String, enum: ["user", "super_admin","sub_admin","staff"], default: "user" },
        status: {
            type: String,
            default: "active",
            enum: ["active", "inactive", "banned", "blocked"],
        },
        profile_completed: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        is_email_verified: { type: Boolean, default: false },
        is_phone_number_verified: { type: Boolean, default: false },
        is_premium: { type: Boolean, default: false },
        last_active: { type: Date, default: Date.now },
        one_signal_id: {
            type: String,
            default: "",
        },
        relationship_preference: {
            type: String,
            enum: ["Long-Term", "Marriage", "Short-Term", "Short term Fun", "Not sure yet", "Both", "New friends", "Other"],
            default: "Not sure yet"
        },
        echocoins_balance: { type: Number, default: 0 },
        plan: {
            type: String,
            enum: ["free", "basic", "budget", "premium"],
            default: "free",
        },
        daily_swipes: { type: Number, default: 0 },
        daily_messages: { type: Number, default: 0 },
        subscriptionStatus: {
            type: String,
            enum: ['none', 'active', 'expired', 'cancelled'],
            default: 'none'
        },
        subscriptionEndDate: {
            type: Date,
            default: null
        },
        linked_bank_accounts: [
            {
                recipient_code: { type: String },
                account_number: { type: String },
                account_name: { type: String },
                bank_code: { type: String },
                bank_name: { type: String },
                currency: { type: String, default: "NGN" },
                metadata: { type: Schema.Types.Mixed },
            }
        ],
    },
    { timestamps: true }
);

UserSchema.index({ location: "2dsphere" });

export default mongoose.model<IUser>("User", UserSchema);

