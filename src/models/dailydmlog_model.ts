


import mongoose from "mongoose";

const dailyDmLogSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
    date: { type: Date, default: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }},
});

export default mongoose.model("DailyDmLog", dailyDmLogSchema);
