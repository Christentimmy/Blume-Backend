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

// Storage for verification images (selfie + ID front/back)
const verificationStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith("video/");
        if (isVideo) {
            // multer will surface this as an error
            throw new Error("Video files are not allowed for verification");
        }
        return {
            folder: "verification_media",
            resource_type: "image",
            public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
        };
    },
});

const uploadVerificationMedia = multer({
    storage: verificationStorage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB per file
});

const supportTicketStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "user_verification",
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

export const supportUpload = multer({ storage: supportTicketStorage });

export { uploadDatingPhotos, uploadStoryMedia, uploadMessageMedia, uploadVerificationMedia };
