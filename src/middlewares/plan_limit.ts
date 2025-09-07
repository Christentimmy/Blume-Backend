// middlewares/planLimit.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/user_model";

const planLimits = {
    free: { swipes: 10, messages: 5 },
    basic: { swipes: 40, messages: 10 },
    budget: { swipes: 100, messages: 20 },
    premium: { swipes: 140, messages: 20 },
};

export const checkSwipeLimit = async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.userId;
    const user = await User.findById(userId);

    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    if (user.plan === "premium") {
        next();
        return;
    }

    if (user.daily_swipes >= planLimits[user.plan].swipes) {
        res.status(403).json({ message: "Swipe limit reached for today." });
        return;
    }

    user.daily_swipes += 1;
    await user.save();
    next();
};

// export const checkMessageLimit = async (req: Request, res: Response, next: NextFunction) => {
//     const userId = res.locals.userId;
//     const user = await User.findById(userId);
//     if (!user) {
//         res.status(404).json({ message: "User not found" });
//         return;
//     }
//     if (user.plan === "premium") {
//         next();
//         return;
//     }


//     if (user.daily_messages >= planLimits[user.plan].messages) {
//         res.status(403).json({ message: "Message limit reached for today." });
//         return;
//     }

//     user.daily_messages += 1;
//     await user.save();
//     next();
// };

export default planLimits;