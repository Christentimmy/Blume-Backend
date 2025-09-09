import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/database";

import authRouter from "./routes/auth_route";
import userRouter from "./routes/user_route";
import storyRouter from "./routes/story_route";
import messageRouter from "./routes/message_route";
import morgan from "morgan";
import { setupSocket } from "./config/socket";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);

// Database Connection
connectToDatabase();

// Start Server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

setupSocket(server);

