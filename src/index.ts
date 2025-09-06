import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/database";
import authRouter from "./routes/auth_route";
import morgan from "morgan";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api/auth", authRouter);

// Database Connection
connectToDatabase();

// Start Server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
