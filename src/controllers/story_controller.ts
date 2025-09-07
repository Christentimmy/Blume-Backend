import { Request, Response } from "express";
import { Story } from "../models/story_model";
import userSchema from "../models/user_model";
import mongoose from "mongoose";
// import { io } from '../config/socket';
import cloudinary from "../config/cloudinary";
import { MatchModel } from "../models/match_model";

import generateThumbnail from "../utils/generate_thumbnail";
import fs from "fs";

export const storyController = {
  createStory: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.userId;
      const storyFiles = req.files as Express.Multer.File[];

      if (!storyFiles || storyFiles.length === 0) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const { content, visibility } = req.body;
      const user = await userSchema.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      let storyDoc = await Story.findOne({ userId });
      if (!storyDoc) {
        storyDoc = new Story({
          userId,
          full_name: user.full_name,
          stories: [],
          visibility: visibility || "matches-only",
        });
      }

      for (let file of storyFiles) {
        const isVideo = file.mimetype.startsWith("video/");
        let thumbnailUrl = "";

        if (isVideo) {
          const thumbPath = await generateThumbnail(file.path);

          const uploadedThumb = await cloudinary.uploader.upload(thumbPath, {
            folder: "stories/thumbnails",
            resource_type: "image",
          });

          thumbnailUrl = uploadedThumb.secure_url;

          fs.unlink(thumbPath, () => {}); // delete temp thumb
        }

        const uploadedMedia = await cloudinary.uploader.upload(file.path, {
          folder: "stories/media",
          resource_type: isVideo ? "video" : "image",
        });

        fs.unlink(file.path, () => {}); // delete uploaded file

        storyDoc.stories.push({
          content,
          mediaUrl: uploadedMedia.secure_url,
          publicId: uploadedMedia.public_id,
          mediaType: isVideo ? "video" : "image",
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          viewedBy: [],
          ...(isVideo ? { thumbnailUrl } : {}),
        });
      }

      await storyDoc.save();
      // io.emit('new-story', storyDoc);

      res.status(201).json({
        message: "Story created successfully",
        data: storyDoc,
      });
    } catch (error) {
      console.error("Error creating story:", error);
      res.status(500).json({ message: "Failed to create story" });
    }
  },

  getUserPostedStories: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.userId;
      const now = new Date();

      const userStories = await Story.findOne({
        userId,
        "stories.expiresAt": { $gt: now },
      });

      if (!userStories) {
        res.status(400).json({ message: "No Story Found" });
        return;
      }

      res.status(200).json({
        message: "Stories fetched successfully",
        data: userStories,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get user's posted stories" });
    }
  },

  getStories: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.userId;
      const now = new Date();

      // 1️⃣ Fetch all matches for this user
      const matches = await MatchModel.find({ users: userId })
        .select("users")
        .lean();

      // 2️⃣ Extract the other user's IDs from each match
      const matchUserIds = matches.flatMap((m) =>
        m.users.filter((id: any) => id.toString() !== userId.toString())
      );

      // 3️⃣ Fetch user's own stories
      const userStories = await Story.find({
        userId: userId,
        "stories.expiresAt": { $gt: now },
      })
        .select("userId full_name avatar stories")
        .lean();

      // 4️⃣ Fetch stories from matched users
      const matchStories = await Story.find({
        userId: { $in: matchUserIds },
        "stories.expiresAt": { $gt: now },
      })
        .select("userId full_name avatar stories")
        .lean();

      // 5️⃣ Fetch public stories from non-matched users
      const publicStories = await Story.find({
        userId: { $nin: [...matchUserIds, userId] },
        visibility: "public",
        "stories.expiresAt": { $gt: now },
      })
        .select("userId full_name avatar stories")
        .lean();

      // 6️⃣ Format stories for response
      const formatStories = (stories: any[]) => {
        return stories.map((story) => ({
          _id: story?._id?.toString() || "",
          userId: story?.userId?.toString() || "",
          fullName: story?.full_name || "",
          avatar: story?.avatar || "",
          stories: (story?.stories || []).map((s: any) => ({
            id: s?._id?.toString() || "",
            thumbnailUrl: s?.thumbnailUrl || "",
            mediaUrl: s?.mediaUrl || "",
            mediaType: s?.mediaType || "",
            content: s?.content || "",
            createdAt: s?.createdAt || new Date(),
            expiresAt: s?.expiresAt || new Date(),
            viewedBy: (s?.viewedBy || []).map(
              (id: mongoose.Types.ObjectId) => id?.toString() || ""
            ),
          })),
        }));
      };

      const formattedUserStories = formatStories(userStories || []);
      const formattedMatchStories = formatStories(matchStories || []);
      const formattedPublicStories = formatStories(publicStories || []);

      // 7️⃣ Send combined stories feed
      res.status(200).json({
        message: "Story Feeds",
        data: [
          ...formattedUserStories,
          ...formattedMatchStories,
          ...formattedPublicStories,
        ],
      });
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  },

  viewManyStories: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.userId;
      if (!req.body) {
        res.status(400).json({ message: "Invalid request body" });
        return;
      }
      const { storyItems } = req.body;
      const now = new Date();

      if (!Array.isArray(storyItems) || storyItems.length === 0) {
        res.status(400).json({ message: "Invalid or empty storyItems array" });
        return;
      }

      for (const item of storyItems) {
        const { storyId, storyItemId } = item;

        const storyDoc = await Story.findById(storyId);
        if (!storyDoc) continue;

        const storyItem = storyDoc.stories.find(
          (story: any) => story._id.toString() === storyItemId
        );

        if (
          !storyItem ||
          storyItem.expiresAt < now ||
          storyDoc.userId.toString() === userId
        ) {
          continue; // Skip expired, non-existent, or own story
        }

        if (!storyItem.viewedBy.includes(userId)) {
          storyItem.viewedBy.push(userId);
        }

        await storyDoc.save();
      }

      res.status(200).json({ message: "Stories marked as viewed (batched)" });
    } catch (err) {
      console.error("Batch story view error:", err);
      res.status(500).json({ message: "Something went wrong" });
    }
  },

  updateStoryVisibility: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.userId;
      const { storyId, visibility } = req.body;

      const story = await Story.findOneAndUpdate(
        { userId, "stories._id": storyId },
        { $set: { "stories.$.visibility": visibility } },
        { new: true }
      );

      if (!story) {
        res.status(404).json({ message: "Story not found or not authorized" });
        return;
      }

      res
        .status(200)
        .json({ message: "Story visibility updated", data: story });
    } catch (error) {
      console.error("Error updating story visibility:", error);
      res.status(500).json({ message: "Failed to update story visibility" });
    }
  },

  deleteStory: async (req: Request, res: Response) => {
    try {
      const { storyId } = req.params;
      const userId = res.locals.userId;
      const user = await userSchema.findById(userId);
      if (!user) {
        res.status(404).json({ message: "user not found" });
        return;
      }
      const story = await Story.findById(storyId);
      if (!story) {
        res.status(404).json({ message: "Story not found" });
        return;
      }
      if (user._id.toString() !== story.userId.toString()) {
        res.status(404).json({ message: "Unauthorized Access" });
        return;
      }
      const result = await Story.deleteOne({ _id: storyId });

      if (!result) {
        res.status(404).json({ message: "Story not found or not authorized" });
        return;
      }

      res.status(200).json({ message: "Story deleted successfully" });
    } catch (error) {
      console.error("Error deleting story:", error);
      res.status(500).json({ message: "Failed to delete story" });
    }
  },

  getStoryViewers: async (req: Request, res: Response) => {
    try {
      const { storyId, storyItemId } = req.params;

      if (!storyId || !storyItemId) {
        res.status(400).json({ message: "Invalid parameters" });
        return;
      }

      // Find the story document
      const storyDoc = await Story.findOne({ _id: storyId });

      if (!storyDoc) {
        res.status(404).json({ message: "Story not found" });
        return;
      }

      // Find the specific story item
      const storyItem = storyDoc.stories.find(
        (e) => e["_id"].toString() === storyItemId
      );

      if (!storyItem) {
        res.status(404).json({ message: "Story item not found" });
        return;
      }

      if (storyDoc.userId.toString() != res.locals.user._id.toString()) {
        res.status(404).json({ message: "Unauthorized Access" });
        return;
      }
      // Get the viewers of this story item
      const viewedByUsers = await userSchema
        .find({
          _id: { $in: storyItem.viewedBy },
        })
        .select("full_name avatar"); // Assuming you have `avatar` field in the User model

      res.status(200).json({
        message: "Viewers fetched successfully",
        viewers: viewedByUsers,
      });
    } catch (error) {
      console.error("Error fetching viewers:", error);
      res.status(500).json({ message: "Failed to fetch viewers" });
    }
  },
};
