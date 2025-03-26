import dotenv from "dotenv";
dotenv.config();

console.log("Mongo URI:", process.env.MONGO_URI);

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import employeeRoutes from "./routes/employeeRoutes.js"; 
import authRoutes from "./routes/authRoutes.js";
import timesheetRoutes from "./routes/timesheetRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check if MongoDB URI exists
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing in .env file!");
  process.exit(1);
}

// Async Function for MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};
connectDB();

// API Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/timesheets", timesheetRoutes); 

// Basic Route
app.get("/", (req, res) => {
  res.send("TimeSheet Backend is Running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
