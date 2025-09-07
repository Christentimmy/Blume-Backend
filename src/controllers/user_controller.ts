import { Request, Response } from "express";
import UserModel from "../models/user_model";
import SwipeModel from "../models/swipe_model";
import mongoose from "mongoose";
import { MatchModel } from "../models/match_model";
import Notification from "../models/notification_model";
import { IUser } from "../types/user_type";

const isValidObjectId = mongoose.Types.ObjectId.isValid;

export const userController = {
  updateName: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }

      const { full_name } = req.body;

      if (!full_name) {
        res.status(400).json({ message: "Full name is required" });
        return;
      }

      const user = await UserModel.findById(userId);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      user.full_name = full_name;
      await user.save();

      res.status(200).json({ message: "Name updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateDob: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { date_of_birth } = req.body;
      let date: Date;
      try {
        date = new Date(date_of_birth);
      } catch (error) {
        res.status(400).json({ message: "Invalid date of birth" });
        return;
      }

      if (!date_of_birth) {
        res.status(400).json({ message: "Date of birth is required" });
        return;
      }
      const user = await UserModel.findById(res.locals.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      user.date_of_birth = date;
      await user.save();
      res.status(200).json({ message: "Date of birth updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateGender: async (req: Request, res: Response) => {
    try {
      if (!req.body) {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { gender } = req.body;
      if (!gender) {
        res.status(400).json({ message: "Gender is required" });
        return;
      }
      const user = await UserModel.findById(res.locals.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      user.gender = gender;
      await user.save();
      res.status(200).json({ message: "Gender updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updatePreference: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { relationship_preference } = req.body;
      if (!relationship_preference) {
        res
          .status(400)
          .json({ message: "Relationship preference is required" });
        return;
      }
      const list = [
        "Long-Term",
        "Marriage",
        "Short-Term",
        "Short term Fun",
        "Not sure yet",
        "Both",
        "New friends",
        "Other",
      ];
      if (!list.includes(relationship_preference)) {
        res.status(400).json({ message: "Invalid relationship preference" });
        return;
      }
      const user = await UserModel.findById(res.locals.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      user.relationship_preference = relationship_preference;
      await user.save();
      res
        .status(200)
        .json({ message: "Relationship preference updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  distancePreference: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { distance } = req.body;
      if (distance) {
        const user = await UserModel.findById(res.locals.userId);
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }
        user.preferences.maxDistance = distance;
        await user.save();
        res
          .status(200)
          .json({ message: "Distance preference updated successfully" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateEducation: async (req: Request, res: Response) => {
    try {
      if (!req.body) {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { education } = req.body;
      if (!education) {
        res.status(400).json({ message: "Education is required" });
        return;
      }
      const user = await UserModel.findById(res.locals.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      user.education = education;
      await user.save();
      res.status(200).json({ message: "Education updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateLifestyle: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }

      const { smoking, drinking, workout } = req.body;
      if (!smoking || !drinking || !workout) {
        res.status(400).json({ message: "Missing lifestyle details" });
        return;
      }
      const user = await UserModel.findById(res.locals.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      user.lifestyle.smoking = smoking.toLowerCase();
      user.lifestyle.drinking = drinking.toLowerCase();
      user.lifestyle.workout = workout.toLowerCase();
      await user.save();
      res.status(200).json({ message: "Lifestyle updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateBasic: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }

      const { occupation, religion } = req.body;
      if (!occupation || !religion) {
        res.status(400).json({ message: "Missing basic details" });
        return;
      }

      const user = await UserModel.findById(res.locals.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      user.basics.occupation = occupation.toLowerCase();
      user.basics.religion = religion.toLowerCase();
      await user.save();
      res.status(200).json({ message: "Basic details updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  uploadDatingPhotos: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const uploadedPhotos = req.files as Express.Multer.File[];
      const { index } = req.body;

      if (!uploadedPhotos || uploadedPhotos.length === 0) {
        res.status(400).json({ message: "No photos uploaded" });
        return;
      }

      if (index !== undefined) {
        const parsedIndex = parseInt(index);
        if (isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex > 5) {
          res
            .status(400)
            .json({ message: "Invalid index. Must be between 0 and 5." });
          return;
        }

        // Replace existing photo at the specified index
        user.photos[parsedIndex] = uploadedPhotos[0].path;
      } else {
        // Append new photos, but keep max 5
        user.photos = [
          ...user.photos,
          ...uploadedPhotos.map((file) => file.path),
        ].slice(0, 6);
      }

      user.avatar = user.photos[0];
      await user.save();

      res.status(200).json({
        message:
          index !== undefined
            ? "Photo replaced successfully"
            : "Photos uploaded successfully",
        photos: user.photos,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  updateLocation: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { longitude, latitude, address } = req.body;

      const userId = res.locals.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      // Validate input
      if (
        !longitude ||
        !latitude ||
        !address ||
        !userId ||
        isNaN(longitude) ||
        isNaN(latitude)
      ) {
        res.status(400).json({
          error: " {lat,lng,address required} or Invalid longitude or latitude",
        });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ error: "user not found" });
        return;
      }
      user.location = {
        type: "Point",
        address: address.split(" ")[0],
        coordinates: [longitude, latitude],
      };
      if (user.profile_completed === false) {
        user.profile_completed = true;
      }
      await user.save();

      res.status(200).json({
        message: "Location updated successfully",
        data: { location: user.location },
      });
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getPotentialMatches: async (req: Request, res: Response) => {
    try {
      let { page = 1, limit = 20 } = req.query;
      page = Number(page);
      limit = Number(limit);
      const skip = (page - 1) * limit;

      const user = res.locals.user;
      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const { preferences, location } = user;
      const maxDistance = preferences.maxDistance ?? 10000.0;

      const swipedUserIds = await SwipeModel.find({
        swiper: user._id,
      }).distinct("swiped");

      const matchCriteria: any = {
        _id: { $ne: user._id, $nin: swipedUserIds },
        status: "active",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [location.coordinates[0], location.coordinates[1]],
            },
            $maxDistance: maxDistance,
          },
        },
      };
      const potentialMatches = await UserModel.find(matchCriteria)
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        message: "Potential matches fetched successfully",
        data: potentialMatches,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  swipeUser: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { swipedUserId, action } = req.body;
      if (!swipedUserId || !action || !isValidObjectId(swipedUserId)) {
        return res.status(400).json({ message: "Missing user ID or action" });
      }
      if (!["like", "dislike"].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }

      const swipedUser = await UserModel.findById(swipedUserId);
      if (!swipedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user already swiped this person
      let swipe = await SwipeModel.findOne({
        swiper: user._id,
        swiped: swipedUser._id,
      });
      if (swipe) {
        swipe.direction = action;
        await swipe.save();
      } else {
        swipe = new SwipeModel({
          swiper: user._id,
          swiped: swipedUser._id,
          direction: action,
        });
        await swipe.save();
      }

      // 🔥 If it's a like, check if swiped user also liked back
      if (action === "like") {
        const oppositeSwipe = await SwipeModel.findOne({
          swiper: swipedUser._id,
          swiped: user._id,
          direction: "like",
        });

        if (oppositeSwipe) {
          // Check if match already exists
          const existingMatch = await MatchModel.findOne({
            users: { $all: [user._id, swipedUser._id] },
          });

          if (!existingMatch) {
            const match = new MatchModel({
              users: [user._id, swipedUser._id],
            });
            await match.save();
          }

          return res.status(200).json({
            message: "It's a match! 🎉",
            match: true,
          });
        }
      }

      return res.status(200).json({ message: "Swipe saved", match: false });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  saveOneSignal: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { oneSignalId } = req.body;
      if (!oneSignalId) {
        res.status(400).json({ message: "One Signal ID is required" });
        return;
      }
      const userId = res.locals.userId;

      if (!userId) {
        res.status(400).json({ message: "user id required" });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      user.one_signal_id = oneSignalId;
      await user.save();

      res.status(200).json({ message: "User One Signal Saved Successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  getMatches: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;
      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const matches = await MatchModel.find({ users: user._id }).populate(
        "users",
        "full_name avatar"
      );
      res
        .status(200)
        .json({ message: "Matches fetched successfully", data: matches });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getUsersWhoLikedMe: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const swipes = await SwipeModel.find({
        swiped: user._id,
        direction: "like",
      }).populate("swiper", "full_name avatar");

      // Format response
      const users = swipes.map((swipe) => swipe.swiper);

      return res.status(200).json({
        message: "Users who liked you fetched successfully",
        data: users,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getUserNotifications: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.userId;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const unread = req.query.unread === "true";

      const filter: any = { userId };
      if (unread) filter.isRead = false;

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const totalNotifications = await Notification.countDocuments(filter);

      res.status(200).json({
        notifications,
        page,
        limit,
        totalNotifications,
        totalPages: Math.ceil(totalNotifications / limit),
        hasNextPage: page * limit < totalNotifications,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  },

  markNotificationsRead: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.userId;
      const { notificationIds } = req.body; // Expecting an array of notification IDs

      if (
        !notificationIds ||
        !Array.isArray(notificationIds) ||
        notificationIds.length === 0
      ) {
        res.status(400).json({ message: "Invalid notification IDs" });
        return;
      }

      await Notification.updateMany(
        { _id: { $in: notificationIds }, userId },
        { $set: { isRead: true } }
      );

      res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  },

  getUserDetails: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.userId;
      if (!userId) {
        res.status(400).json({ message: "user id required" });
        return;
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ message: "user not found" });
        return;
      }
      const customUser = user.toObject();
      delete customUser.password;
      delete customUser.role;
      delete customUser.__v;

      res.status(200).json({
        message: "user retrieved successfully",
        data: customUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getProfileStats: async (req: Request, res: Response) => {
    try {
      const user: IUser = res.locals.user;
      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const matchesCount = await MatchModel.countDocuments({ users: user._id });
      const likeCounts = await SwipeModel.countDocuments({ swiper: user._id , direction: "like" });
      const dislikeCounts = await SwipeModel.countDocuments({ swiper: user._id , direction: "dislike" });
      
      res.status(200).json({
        message: "Profile stats retrieved successfully",
        data: {
          matchesCount,
          likeCounts,
          dislikeCounts,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
