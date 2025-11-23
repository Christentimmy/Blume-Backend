import { Request, Response } from "express";
import UserModel from "../models/user_model";
import { Swipe } from "../models/swipe_model";
import mongoose from "mongoose";
import { Match } from "../models/match_model";
import Notification from "../models/notification_model";
import { IUser } from "../types/user_type";
import { sendPushNotification, NotificationType } from "../config/onesignal";

// const isValidObjectId = mongoose.Types.ObjectId.isValid;

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
      if (!date_of_birth) {
        res.status(400).json({ message: "Date of birth is required" });
        return;
      }

      let date: Date;
      try {
        date = new Date(date_of_birth);
      } catch (error) {
        res.status(400).json({ message: "Invalid date of birth" });
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
      const { gender, showGender } = req.body;
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
      if (showGender) {
        user.showGender = showGender;
      }
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
      let { relationship_preference } = req.body;
      relationship_preference = relationship_preference.toLowerCase();
      if (!relationship_preference) {
        res.status(400).json({
          message: "Relationship preference is required",
        });
        return;
      }
      const list = [
        "long term partner",
        "short term partner",
        "both",
        "new friends",
        "short term fun",
        "not sure yet",
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
      if (!distance) {
        res.status(400).json({ message: "Distance is required" });
        return;
      }

      const user = await UserModel.findById(res.locals.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      user.preferences.maxDistance = Number(distance);
      await user.save();

      res.status(200).json({
        message: "Distance preference updated successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateBio: async (req: Request, res: Response) => {
    try {
      if (!req.body) {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { bio } = req.body;
      if (!bio) {
        res.status(400).json({ message: "Bio is required" });
        return;
      }
      const user = await UserModel.findById(res.locals.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      user.bio = bio;
      await user.save();
      res.status(200).json({ message: "Bio updated successfully" });
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
      user.basics.smoking = smoking.toLowerCase();
      user.basics.drinking = drinking.toLowerCase();
      user.basics.workout = workout.toLowerCase();
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

      const {
        occupation,
        religion,
        education,
        height,
        sexOrientation,
        languages,
      } = req.body;

      if (!occupation || !religion) {
        res
          .status(400)
          .json({ message: "Occupation and religion are required" });
        return;
      }

      const user = await UserModel.findById(res.locals.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      user.basics.occupation = occupation.toLowerCase();
      user.basics.religion = religion.toLowerCase();
      if (education) {
        user.basics.education = education.toLowerCase();
      }
      if (height) {
        user.basics.height = height.toLowerCase();
      }
      if (sexOrientation) {
        user.basics.sexOrientation = sexOrientation.toLowerCase();
      }
      if (languages && languages.length > 0) {
        const lowerCaseLanguages = languages.map((lang: string) =>
          lang.toLowerCase()
        );
        user.basics.languages = lowerCaseLanguages;
      }
      await user.save();
      res.status(200).json({ message: "Basic details updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateBasic2: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const {
        lifestyleAndValues,
        hobbies,
        artsAndCreativity,
        sportsAndFitness,
        travelAndAdventure,
        entertainment,
        music,
        foodAndDrink,
      } = req.body;

      const user = await UserModel.findById(res.locals.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      if (lifestyleAndValues) {
        const lowerCaseLifestyleAndValues = lifestyleAndValues.map(
          (value: string) => value.toLowerCase()
        );
        user.basics.lifestyleAndValues = lowerCaseLifestyleAndValues;
      }
      if (hobbies) {
        const lowerCaseHobbies = hobbies.map((hobby: string) =>
          hobby.toLowerCase()
        );
        user.basics.hobbies = lowerCaseHobbies;
      }
      if (artsAndCreativity) {
        const lowerCaseArtsAndCreativity = artsAndCreativity.map(
          (value: string) => value.toLowerCase()
        );
        user.basics.artsAndCreativity = lowerCaseArtsAndCreativity;
      }
      if (sportsAndFitness) {
        const lowerCaseSportsAndFitness = sportsAndFitness.map(
          (value: string) => value.toLowerCase()
        );
        user.basics.sportsAndFitness = lowerCaseSportsAndFitness;
      }
      if (travelAndAdventure) {
        const lowerCaseTravelAndAdventure = travelAndAdventure.map(
          (value: string) => value.toLowerCase()
        );
        user.basics.travelAndAdventure = lowerCaseTravelAndAdventure;
      }
      if (entertainment) {
        const lowerCaseEntertainment = entertainment.map((value: string) =>
          value.toLowerCase()
        );
        user.basics.entertainment = lowerCaseEntertainment;
      }
      if (music) {
        const lowerCaseMusic = music.map((value: string) =>
          value.toLowerCase()
        );
        user.basics.music = lowerCaseMusic;
      }
      if (foodAndDrink) {
        const lowerCaseFoodAndDrink = foodAndDrink.map((value: string) =>
          value.toLowerCase()
        );
        user.basics.foodAndDrink = lowerCaseFoodAndDrink;
      }

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

      const swipedUserIds = await Swipe.find({
        userId: user._id,
      }).distinct("targetUserId");

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
      const userId = res.locals.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const { targetUserId, type } = req.body;

      if (!targetUserId || !type) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }
      if (type !== "like" && type !== "pass" && type !== "superlike") {
        res.status(400).json({ message: "Invalid swipe type" });
        return;
      }

      const targetUser = await UserModel.findById(targetUserId);
      if (!targetUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // 3. Prevent duplicate swipe (update if exists)
      await Swipe.findOneAndUpdate(
        { userId, targetUserId },
        { type },
        { new: true, upsert: true }
      );

      if (type === "like" || type === "superlike") {
        const reverseSwipe = await Swipe.findOne({
          userId: targetUserId,
          targetUserId: userId,
          type: { $in: ["like", "superlike"] },
        });

        if (reverseSwipe) {
          const sortedUsers = [userId, targetUserId].sort();
          await Match.create({ users: sortedUsers });
          await sendPushNotification(
            targetUserId,
            targetUser.one_signal_id,
            NotificationType.MATCH,
            "It's a match! 🎉"
          );

          return res.status(200).json({
            message: "It's a match! 🎉",
            match: { userId, targetUserId },
          });
        }
      }

      res.status(200).json({ message: "User liked successfully!" });
    } catch (error) {
      console.error("Error liking user:", error);
      res.status(500).json({ message: "Something went wrong" });
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
      const userId = new mongoose.Types.ObjectId(res.locals.userId);
      const user: IUser = res.locals.user;
      const status = (req.query.status as string)?.toLowerCase();

      // Build the query for user fields
      const userQuery: any = { "user.status": "active" };

      // Add status-based filtering
      if (status) {
        switch (status) {
          case "verified profile":
            userQuery["user.is_email_verified"] = true;
            userQuery["user.isVerified"] = true;
            break;
          case "aligned interests":
            userQuery["user.relationship_preference"] =
              user.relationship_preference;
            break;
          case "education":
            if (user.basics?.education) {
              userQuery["user.basics.education"] = {
                $regex: user.basics.education.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                ),
                $options: "i",
              };
            }
            break;
          case "lifestyle":
            if (user.basics?.lifestyleAndValues?.length) {
              userQuery["user.basics.lifestyleAndValues"] = {
                $in: user.basics.lifestyleAndValues,
              };
            }
            break;
          case "religion":
            if (user.basics?.religion) {
              userQuery["user.basics.religion"] = {
                $regex: user.basics.religion.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                ),
                $options: "i",
              };
            }
            break;
          case "work":
            if (user.basics?.occupation) {
              userQuery["user.basics.occupation"] = {
                $regex: user.basics.occupation.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                ),
                $options: "i",
              };
            }
            break;
        }
      }

      const matches = await Match.aggregate([
        // Match documents where the current user is in the users array
        {
          $match: {
            users: userId,
            isActive: true,
          },
        },
        // Lookup to get user details
        {
          $lookup: {
            from: "users",
            localField: "users",
            foreignField: "_id",
            as: "user",
          },
        },
        // Unwind the user array to work with individual users
        { $unwind: "$user" },
        // Exclude the current user and apply status filters
        {
          $match: {
            "user._id": { $ne: userId },
            ...userQuery,
          },
        },
        // Project only the needed fields
        {
          $project: {
            _id: "$user._id",
            full_name: "$user.full_name",
            avatar: "$user.avatar",
            gender: "$user.gender",
            location: "$user.location",
            bio: "$user.bio",
            date_of_birth: "$user.date_of_birth",
            basics: "$user.basics",
            lastMessage: 1,
            updatedAt: 1,
          },
        },
        // Sort by last interaction
        { $sort: { updatedAt: -1 } },
      ]);

      res.status(200).json({
        message: "Matches retrieved successfully",
        data: matches,
      });
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  },

  newGetPotentialMatches: async (req: Request, res: Response) => {
    try {
      const user: IUser = res.locals.user;

      const [minAge, maxAge] = user.preferences.ageRange ?? [18, 150];
      const maxDistance = user.preferences.maxDistance ?? 50.0;

      // Pagination variables
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = 20;
      const skip = (page - 1) * limit;

      // Calculate min & max birth years for age range filtering
      const currentYear = new Date().getFullYear();
      const minBirthYear = new Date(currentYear - maxAge, 0, 1);
      const maxBirthYear = new Date(currentYear - minAge, 11, 31);

      const aggregatePipeline: any[] = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: user.location.coordinates },
            distanceField: "distance",
            maxDistance: maxDistance * 1000, // Convert km to meters
            spherical: true,
          },
        },
        {
          $lookup: {
            from: "swipes", // collection name in MongoDB
            let: { candidateId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$targetUserId", "$$candidateId"] },
                      { $eq: ["$userId", user._id] }, // only swipes by current user
                    ],
                  },
                },
              },
            ],
            as: "swipeInfo",
          },
        },
        {
          $match: {
            date_of_birth: { $gte: minBirthYear, $lte: maxBirthYear },
            status: "active",
            role: "user",
            // hobbies: { $in: user.hobbies },
            // profile_completed: true,
            _id: { $ne: user._id },
            swipeInfo: { $eq: [] },
            relationship_preference: user.relationship_preference,
          },
        },
        { $sort: { matchPercentage: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            full_name: 1,
            avatar: 1,
            date_of_birth: 1,
            location: 1,
            basics: 1,
            hobbies: 1,
            preferences: 1,
            matchPercentage: 1,
            interested_in: 1,
            photos: 1,
          },
        },
      ];

      // Fetch matches using the aggregate pipeline
      const matches = await UserModel.aggregate(aggregatePipeline);

      // Directly use stored location address
      // for (let match of matches) {
      //   const distanceKm = (match.distance / 1000).toFixed(1);
      //   match.location = {
      //     address: `${match.location.address} (${distanceKm} Km)`,
      //     coordinates: match.location.coordinates,
      //   };
      // }

      // Get total count for pagination - This needs to use the same pipeline
      const countPipeline = [...aggregatePipeline];
      countPipeline.splice(-2, 2);
      countPipeline.push({ $count: "total" });
      const countResult = await UserModel.aggregate(countPipeline);
      const totalMatches = countResult.length > 0 ? countResult[0].total : 0;

      res.status(200).json({
        message: "Matches retrieved successfully",
        data: matches,
        page,
        limit,
        totalMatches,
        totalPages: Math.ceil(totalMatches / limit),
        hasNextPage: page * limit < totalMatches,
      });
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  },

  getUsersWhoLikedMe: async (req: Request, res: Response) => {
    try {
      const userId = new mongoose.Types.ObjectId(res.locals.userId);
      const user: IUser = res.locals.user;
      const status = (req.query.status as string)?.toLowerCase();

      // Build the query for user fields
      const userQuery: any = { "user.status": "active" };

      // Add status-based filtering
      if (status) {
        switch (status) {
          case "verified profile":
            userQuery["user.is_email_verified"] = true;
            userQuery["user.isVerified"] = true;
            break;
          case "aligned interests":
            userQuery["user.relationship_preference"] =
              user.relationship_preference;
            break;
          case "education":
            if (user.basics?.education) {
              userQuery["user.basics.education"] = {
                $regex: user.basics.education.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                ),
                $options: "i",
              };
            }
            break;
          case "lifestyle":
            if (user.basics?.lifestyleAndValues?.length) {
              userQuery["user.basics.lifestyleAndValues"] = {
                $in: user.basics.lifestyleAndValues,
              };
            }
            break;
          case "religion":
            if (user.basics?.religion) {
              userQuery["user.basics.religion"] = {
                $regex: user.basics.religion.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                ),
                $options: "i",
              };
            }
            break;
          case "work":
            if (user.basics?.occupation) {
              userQuery["user.basics.occupation"] = {
                $regex: user.basics.occupation.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                ),
                $options: "i",
              };
            }
            break;
        }
      }

      const swipes = await Swipe.aggregate([
        // First, match the swipe conditions
        {
          $match: {
            targetUserId: userId,
            type: { $ne: "dislike" },
            // Add any other swipe-specific filters here
          },
        },
        // Join with users collection
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        // Unwind the user array to work with individual users
        { $unwind: "$user" },
        // Apply user-related filters
        {
          $match: userQuery,
        },
        // Project only the needed fields
        {
          $project: {
            _id: "$user._id",
            full_name: "$user.full_name",
            avatar: "$user.avatar",
            gender: "$user.gender",
            location: "$user.location",
            basics: "$user.basics",
            date_of_birth: "$user.date_of_birth",
            // Include any other fields you need from the user
            swipe_created_at: "$createdAt", // Example of including swipe timestamp
          },
        },
        // Sort by the swipe's creation time (most recent first)
        { $sort: { swipe_created_at: -1 } },
      ]);

      res.status(200).json({
        message: "Filtered users who liked you",
        data: swipes,
      });
    } catch (error) {
      console.error("Error fetching users who liked me:", error);
      res.status(500).json({
        message: "Something went wrong",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
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

      const matchesCount = await Match.countDocuments({ users: user._id });
      const likeCounts = await Swipe.countDocuments({
        userId: user._id,
        type: "like",
      });
      const dislikeCounts = await Swipe.countDocuments({
        userId: user._id,
        type: "dislike",
      });

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

  getUserWithId: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        res.status(404).json({ message: "missing user Id" });
        return;
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(400).json({ message: "user not found" });
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
      res.status(500).json({ message: "server error" });
    }
  },

  searchUser: async (req: Request, res: Response) => {
    try {
      let { page = 1, limit = 40, search } = req.query;
      if (!search || search === "") {
        res.status(400).json({ message: "search is required" });
        return;
      }
      page = Number(page);
      limit = Number(limit);
      const skip = (page - 1) * limit;
      search = search.toString().toLowerCase();
      const filter = {
        $or: [
          { "user.full_name": { $regex: search, $options: "i" } },
          { "user.email": { $regex: search, $options: "i" } },
        ],
      };

      const users = await UserModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalUsers = await UserModel.countDocuments(filter);

      res.status(200).json({
        users,
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        hasNextPage: page * limit < totalUsers,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
