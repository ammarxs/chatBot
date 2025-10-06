import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
const app = express();
dotenv.config();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const PORT = process.env.PORT;
const db_url = process.env.MONGO_URI;
const connectDB =  () => {
  try {
    mongoose.connect(db_url);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("Error: " + error.message);
  }
};
connectDB();


app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
    res.send("Hello from backend");
    console.log("Hello from backend");
});

app.listen(PORT, () => {
  console.log("server runniing at port " + PORT);
});


