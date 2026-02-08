import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  avatar?: string;
  education: string;
  bio?: string;
  stripeCustomerId: string;
  basics: {
    smoking: string;
    drinking: string;
    workout: string;
    occupation: string;
    religion: string;
    education: string;
    height: string;
    sexOrientation: string;
    languages: string[];

    //part2
    lifestyleAndValues: string[];
    hobbies: string[];
    artsAndCreativity: string[];
    sportsAndFitness: string[];
    travelAndAdventure: string[];
    entertainment: string[];
    music: string[];
    foodAndDrink: string[];
  };
  showGender: boolean;
  gender: "male" | "female" | "others";
  interested_in: "male" | "female" | "both" | "others";
  date_of_birth: Date;
  location: {
    type: string;
    address: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
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
  role: "user" | "super_admin" | "admin" | "staff";
  status: "active" | "inactive" | "banned" | "blocked" | "deleted";
  last_active: Date;
  created_at: Date;
  updated_at: Date;
  one_signal_id: string;
  relationship_preference:
    | "long term partner"
    | "short term partner"
    | "both"
    | "new friends"
    | "short term fun"
    | "not sure yet";
  plan: "free" | "subscribed";
  boost: {
    isActive: boolean;
    expiresAt: Date;
    boostType: "boost1" | "boost5" | "boost10";
    boostMultiplier: { type: Number; default: 1.0 };
  };
  daily_swipes: number;
  daily_messages: number;
  subscription: {
    planId: string;
    status:
      | "active"
      | "canceled"
      | "past_due"
      | "unpaid"
      | "incomplete"
      | "none";
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  };
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
