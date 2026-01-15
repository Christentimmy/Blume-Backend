// src/utils/boostUtils.ts
import User from "../models/user_model";
import cron from "node-cron";

// Check and reset expired boosts
const checkAndResetExpiredBoosts = async () => {
  try {
    const now = new Date();
    const result = await User.updateMany(
      {
        "boost.isActive": true,
        "boost.expiresAt": { $lte: now },
      },
      {
        $set: {
          "boost.isActive": false,
          "boost.boostMultiplier": 1.0,
        },
      }
    );
  } catch (error) {
    console.error("Error resetting expired boosts:", error);
  }
};

const initBoostResetJob = () => {
  cron.schedule(
    "* * * * *",
    async () => {
      await checkAndResetExpiredBoosts();
    },
    {
      timezone: "UTC",
    }
  );
};

initBoostResetJob();
