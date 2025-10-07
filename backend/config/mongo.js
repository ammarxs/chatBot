import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const db_url = process.env.MONGO_URI;
const connectDB =  () => {
  try {
    mongoose.connect(db_url);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("Error: " + error.message);
  }
};

export default connectDB;