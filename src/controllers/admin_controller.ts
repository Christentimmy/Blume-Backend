import { Request, Response } from "express";
import UserModel from "../models/user_model";
import bcrypt from "bcryptjs";
import { generateToken, validateToken } from "../utils/token_generator";
import { Match } from "../models/match_model";
import { SupportTicket } from "../models/support_ticket_model";
import VerificationSchema from "../models/verification_model";
import { IUser } from "../types/user_type";
import tokenBlacklistSchema from "../models/token_blacklist_model";
import { JwtPayload } from "jsonwebtoken";
import VerificationModel, { IVerification } from "../models/verification_model";

export const adminController = {
  createAdmin: async (req: Request, res: Response) => {
    try {
      if (!req.body) {
        res.status(400).json({ message: "Bad request" });
        return;
      }
      const { full_name, email, password } = req.body;
      if (!full_name || !email || !password) {
        res.status(400).json({ message: "Bad request" });
        return;
      }

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const admin = await UserModel.create({
        full_name,
        email,
        password: hashedPassword,
        role: "super_admin",
      });

      const token = generateToken(admin);

      res.status(200).json({
        message: "Admin created successfully",
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.log(error);
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      if (!req.body) {
        res.status(400).json({ message: "Bad request" });
        return;
      }

      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ message: "Bad request" });
        return;
      }

      const user = await UserModel.findOne({ email }).select("+password");
      if (!user) {
        res.status(400).json({ message: "User not found" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({ message: "Invalid password" });
        return;
      }
      const token = generateToken(user);
      res.status(200).json({
        message: "User logged in successfully",
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.log(error);
    }
  },

  dashboardStats: async (req: Request, res: Response) => {
    try {
      const users = await UserModel.countDocuments({ role: "user" });
      const matches = await Match.countDocuments();
      const supportTicket = await SupportTicket.countDocuments({
        status: "open",
      });
      const verification = await VerificationSchema.countDocuments({
        status: "pending",
      });

      const data = {
        users,
        matches,
        supportTicket,
        verification,
      };

      res.status(200).json({
        message: "Dashboard stats retrieved successfully",
        data,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getWeeklyActivities: async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const weeklyData = [];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(startOfWeek);
        dayStart.setDate(startOfWeek.getDate() + i);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        // Count new users registered on this day
        const users = await UserModel.countDocuments({
          createdAt: { $gte: dayStart, $lte: dayEnd },
        });

        // Count matches created on this day
        const matches = await Match.countDocuments({
          createdAt: { $gte: dayStart, $lte: dayEnd },
        });

        weeklyData.push({
          name: days[i],
          users: users,
          matches: matches,
        });
      }

      res.status(200).json({
        message: "Weekly activities retrieved successfully",
        data: weeklyData,
      });
    } catch (error) {
      console.error("Error fetching weekly activities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  recentUsers: async (req: Request, res: Response) => {
    try {
      const users: IUser[] = await UserModel.find()
        .sort({ createdAt: -1 })
        .limit(4);

      const mappedUsers = users.map((user) => ({
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        createdAt: user.createdAt,
      }));
      res.status(200).json({
        message: "Recent users retrieved successfully",
        data: mappedUsers,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  validateToken: async (req: Request, res: Response) => {
    try {
      const authHeader = req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Access denied. No token provided." });
        return;
      }

      const token = authHeader.split(" ")[1];
      if (!token || token.split(".").length !== 3) {
        res.status(400).json({ message: "Invalid token format." });
        return;
      }

      const decoded = validateToken(token) as JwtPayload;
      const isBlacklisted = await tokenBlacklistSchema.findOne({ token });
      if (isBlacklisted) {
        res.status(401).json({
          message: "Token is invalid. Please log in again.",
        });
        return;
      }

      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        res.status(401).json({ message: "Token has expired." });
        return;
      }

      res.status(200).json({ message: "Token is valid" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.error("Error validating token:", error);
    }
  },

  getAllUsers: async (req: Request, res: Response) => {
    try {
      const users = await UserModel.find({ role: "user" });
      res.status(200).json({
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateUserStatus: async (req: Request, res: Response) => {
    try {
      const { id, status } = req.body;
      if (!id || !status) {
        res.status(400).json({ message: "User ID and status are required" });
        return;
      }

      const user = await UserModel.findById(id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (
        !["active", "inactive", "banned", "blocked", "deleted"].includes(status)
      ) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }

      user.status = status;
      await user.save();

      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.error("Error updating user status:", error);
    }
  },

  getAllMatches: async (req: Request, res: Response) => {
    try {
      const matches = await Match.find()
        .populate("users", "full_name email photos avatar")
        .sort({ createdAt: -1 });

      const data = matches.map((match) => ({
        _id: match._id,
        avatar1: (match.users[0] as IUser)?.avatar,
        avatar2: (match.users[1] as IUser)?.avatar,
        full_name1: (match.users[0] as IUser)?.full_name,
        full_name2: (match.users[1] as IUser)?.full_name,
        createdAt: match.createdAt,
      }));

      res.status(200).json({
        message: "Matches retrieved successfully",
        data: data,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getAllPendingVerification: async (req: Request, res: Response) => {
    try {
      const users: IVerification[] = await VerificationModel.find({
        status: "pending",
      })
        .populate("user", "full_name email photos avatar")
        .sort({ createdAt: -1 });

      const data = users.map((user: IVerification & { user: IUser }) => ({
        _id: user._id,
        document: user.document,
        status: user.status,
        reason: user.reason,
        userId: user.user._id,
        full_name: user.user.full_name,
        email: user.user.email,
        avatar: user.user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
      
      res.status(200).json({
        message: "Users retrieved successfully",
        data: data,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateVerification: async (req: Request, res: Response) => {
    try {
      const { id, status, reason } = req.body;
      if (!id || !status) {
        res.status(400).json({ message: "User ID and status are required" });
        return;
      }

      const verification = await VerificationModel.findById(id);
      if (!verification) {
        res.status(404).json({ message: "Verification not found" });
        return;
      }

      if (!["approved", "rejected"].includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }

      verification.status = status;
      verification.reason = reason;
      await verification.save();

      res.status(200).json({ message: "Verification updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.error("Error updating verification:", error);
    }
  },
};
