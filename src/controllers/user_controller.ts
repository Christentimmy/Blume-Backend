import { Request, Response } from "express";
import UserModel from "../models/user_model";

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
};
