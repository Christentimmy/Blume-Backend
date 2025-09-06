import { Request, Response } from "express";
import UserModel from "../models/user_model";
import generateToken from "../utils/token_generator";
import bcryptjs from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";

const isValidObjectId = mongoose.Types.ObjectId.isValid;
dotenv.config();
const token_secret = process.env.TOKEN_SECRET;

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
        res
          .status(400)
          .send({ message: "Identifier and password are required" });
        return;
      }

      const user = await UserModel.findOne({
        $or: [{ email: identifier }, { phone_number: identifier }],
      });

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
      if (user.status === "banned") {
        res.status(403).send({ message: "Account banned" });
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

  registerWithNumber: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { phone } = req.body;
      if (!phone) {
        res.status(400).json({ message: "Phone number is required" });
        return;
      }

      //   const response = await checkNumberValidity(phone);
      //   if (response === false) {
      //     res.status(400).json({ message: "Number is not valid" });
      //     return;
      //   }

      const existingUser = await UserModel.findOne({ phone_number: phone });
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      const user = new UserModel({
        phone_number: phone,
        role: "user",
      });

      await user.save();

      const jwtToken = generateToken(user);

      res.status(201).json({
        message: "User registered successfully",
        token: jwtToken,
        email: user.email,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
