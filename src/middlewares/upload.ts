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

export default uploadDatingPhotos;
