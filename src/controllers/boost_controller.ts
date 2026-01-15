import { Request, Response } from "express";
import User from "../models/user_model";
import { createBoostCheckoutSession } from "../services/stripe_service";
import { BOOST_PLANS } from "../config/subscription_plans";

export const boostController = {
  initialBoostPayment: async (req: Request, res: Response) => {
    try {
      const { boostType } = req.body;
      const userId = res.locals.userId;

      if (!boostType) {
        return res.status(400).json({ message: "Boost type is required" });
      }

      const session = await createBoostCheckoutSession(userId, boostType);

      res.status(201).json({
        url: session.url,
        sessionId: session.id,
      });
    } catch (error: any) {
      console.error("Error creating boost checkout session:", error);
      res.status(500).json({
        message: error.message || "Error creating boost checkout session",
      });
    }
  },

  completeBoostPayment: async (boostType: string, userId: string) => {
    try {
      if (!["boost1", "boost5", "boost10"].includes(boostType)) {
        throw new Error("Invalid boost type");
      }

      const boostPlan = BOOST_PLANS[boostType as keyof typeof BOOST_PLANS];

      const expiresAt = new Date(Date.now() + boostPlan.duration);

      await User.findByIdAndUpdate(userId, {
        boost: {
          isActive: true,
          expiresAt,
          boostType,
          boostMultiplier: boostPlan.multiplier,
        },
      });

      return { success: true, expiresAt };
    } catch (error) {
      console.error("Error in completeBoostPayment:", error);
      throw error;
    }
  },

  getBoostStatus: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.userId;
      const user = await User.findById(userId, "boost");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        data: user.boost,
      });
    } catch (error) {
      console.error("Error getting boost status:", error);
      res.status(500).json({ message: "Error getting boost status" });
    }
  },
};
