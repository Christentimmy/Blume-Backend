import { Request, Response } from "express";
import UserModel from "../models/user_model";
import generateToken from "../utils/token_generator";
import bcryptjs from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { sendOTP } from "../services/email_service";
import { redisController } from "./redis_controller";

const isValidObjectId = mongoose.Types.ObjectId.isValid;
dotenv.config();
const token_secret = process.env.JWT_SECRET;

if (!token_secret) {
  throw new Error("TOKEN_SECRET is missing in .env");
}

interface DecodedToken extends JwtPayload {
  id: string;
  role: string;
}

export const authController = {
  loginUser: async (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        res.status(400).send({
          message: "Identifier and password are required",
        });
        return;
      }

      const user = await UserModel.findOne({
        $or: [{ email: identifier }, { phone_number: identifier }],
      }).select("+password");

      if (!user) {
        res.status(404).send({ message: "Invalid Credentials" });
        return;
      }

      // Validate password
      const validatePassword = await bcryptjs.compare(password, user.password);
      if (!validatePassword) {
        res.status(404).send({ message: "Invalid Credentials" });
        return;
      }

      // Check if user is banned
      if (user.status !== "active") {
        res.status(403).send({ message: `Account ${user.status}`});
        return;
      }

      // Generate token
      const token = generateToken(user);

      // Handle verification
      if (!user.is_email_verified) {
        res.status(401).json({ message: "User Not Verified", token: token });
        return;
      }

      // Check if user profile is completed
      if (!user.profile_completed) {
        res.status(400).json({ message: "User Not Complete", token: token });
        return;
      }

      res.status(200).json({
        message: "Login Successful",
        token: token,
        userId: user._id.toString(),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { email, phone, password } = req.body;
      if (!email || !phone || !password) {
        res.status(400).json({
          message: "Email, phone, and password are required",
        });
        return;
      }

      const existingUser = await UserModel.findOne({ email: email });
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      const user = new UserModel({
        email: email,
        phone_number: phone,
        password: hashedPassword,
      });

      const otp = Math.floor(100000 + Math.random() * 900000);
      const response = await sendOTP(email, otp.toString());
      if (!response.success) {
        res.status(500).json({ message: response.message });
        return;
      }
      await redisController.saveOtpToStore(email, otp.toString());

      await user.save();
      const token = generateToken(user);

      res.status(201).json({
        message: "User registered successfully",
        token: token,
        email: user.email,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  sendOtp: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      await redisController.saveOtpToStore(email, otp);
      await sendOTP(email, otp);

      res.status(200).json({ message: "OTP sent" });
    } catch (error) {
      console.error("❌ Error in sendSignUpOtp:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  verifyOtp: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { email, otp } = req.body;
      if (!email || !otp) {
        res.status(400).json({ message: "Email and OTP are required" });
        return;
      }
      const savedOtp = await redisController.getOtpFromStore(email);
      if (!savedOtp || savedOtp !== otp) {
        res.status(400).json({ message: "Invalid or expired OTP" });
        return;
      }
      const user = await UserModel.findOne({ email });
      if (user && user.is_email_verified === false) {
        user.is_email_verified = true;
        await user.save();
      }
      await redisController.removeOtp(email);
      res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
      console.error("❌ Error in verifyOtp:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
