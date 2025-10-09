import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/mongo.js";
import userRoutes from "./routes/userRoutes.js";
import axios from "axios";

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ------------------ User-specific conversation history ------------------
const userSessions = new Map();

function getUserSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, [
      {
        role: "system",
        content: `You are a calm, kind, professional psychology-based therapist and counselor. Speak gently... (rest of your prompt)`,
      },
    ]);
  }
  return userSessions.get(userId);
}

// ------------------ Chat route using Gemini ------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;
    if (!message || !userId)
      return res.status(400).json({ error: "Message and User ID are required" });

    const userConversationHistory = getUserSession(userId);

    userConversationHistory.push({ role: "user", content: message });

    const messages = userConversationHistory.map((m) => {
      let role = "user";
      if (m.role === "assistant") role = "model";
      else if (m.role === "system") role = "user";
      return { role, parts: [{ text: m.content }] };
    });

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      { contents: messages },
      { headers: { "Content-Type": "application/json" } }
    );

    const rawReply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't understand that.";
    const reply = cleanText(rawReply);

    userConversationHistory.push({ role: "assistant", content: reply });

    res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error("❌ Gemini API error:", err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data?.error?.message || "Server error",
    });
  }
});

const cleanText = (text) => {
  if (!text) return "";
  return text
    .replace(/[*#_~`>-]/g, "")
    .replace(/[-—]/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
};

// ------------------ User routes ------------------
app.use("/api/users", userRoutes);

// ------------------ Start server ------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
