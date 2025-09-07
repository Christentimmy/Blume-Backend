import multer from "multer";
import cloudinary from "../config/cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request, Response, NextFunction } from "express";

const datingPhotosStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "dating_photos",
        format: "png",
        public_id: file.originalname.split(".")[0],
    }),
});

const uploadDatingPhotos = multer({ storage: datingPhotosStorage });


const storyStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith("video/");
        return {
            folder: "stories",
            resource_type: isVideo ? "video" : "image",
            public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
        };
    },
});

const uploadStoryMedia = multer({
    storage: storyStorage,
    limits: { fileSize: 30 * 1024 * 1024 }, // 30MB limit
});


// Storage for message images/videos/audio
const messageMediaStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        return {
            folder: "message_media",
            resource_type: "auto",
            public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
        };
    },
});


const uploadMessageMedia = multer({
    storage: messageMediaStorage,
    limits: { fileSize: 150 * 1024 * 1024 }
});

export { uploadDatingPhotos, uploadStoryMedia, uploadMessageMedia };
