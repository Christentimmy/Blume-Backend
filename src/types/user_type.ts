import { Document } from "mongoose";

export interface IUser extends Document {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  avatar?: string;
  bio?: string;
  gender: "male" | "female" | "others";
  interested_in: "male" | "female" | "both" | "others";
  date_of_birth: Date;
  location: {
    type: string;
    address: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  echocoins_balance: number;
  photos: string[];
  hobbies: string[];
  preferences: {
    ageRange: [number, number];
    maxDistance: number;
  };
  is_email_verified: boolean;
  is_phone_number_verified: boolean;
  is_premium: boolean;
  profile_completed: boolean;
  role: "user" | "super_admin" | "sub_admin" | "staff";
  status: "active" | "inactive" | "banned" | "blocked";
  last_active: Date;
  created_at: Date;
  updated_at: Date;
  one_signal_id: string;
  relationship_preference:
    | "Long-Term"
    | "Marriage"
    | "Short-Term"
    | "Friends"
    | "Other";
  plan: "free" | "basic" | "budget" | "premium";
  daily_swipes: number;
  daily_messages: number;
  subscriptionStatus: "none" | "active" | "expired" | "cancelled";
  subscriptionEndDate: Date | null;
  isVerified: boolean;
  linked_bank_accounts: [
    {
      recipient_code: string;
      account_number: string;
      account_name: string;
      bank_code: string;
      bank_name: string;
      currency: string;
      metadata?: any;
    }
  ];
}
