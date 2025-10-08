import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/mongo.js";
import axios from "axios";
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

const PORT = process.env.PORT || 5000;
connectDB();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ FIX: User-specific conversation history
const userSessions = new Map();

// ✅ Function to get or create user session
function getUserSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, [
      {
        role: "system",
        content: `
You are a calm, kind, professional psychology-based therapist and counselor.
Speak gently and naturally like a real human therapist sitting face-to-face.
Start every reply with brief empathy (1–2 lines), showing emotional understanding.

If the user's problem is unclear or incomplete, ask 1–2 short, thoughtful questions
to understand their emotions, background, or situation better.

Once you understand enough, give a simple psychological explanation (1 line),
then offer diagnosis-style insight — explaining what condition, pattern,
or emotional state the user might be experiencing (e.g., anxiety, guilt, overthinking, trauma).

Follow that with practical psychological guidance (2–3 lines) —
using easy, non-technical language anyone can follow.
End each message with calm reassurance (1 line) that makes the user feel safe and supported.

Never mention AI, data, or technology.
Never break character.
Always sound warm, human, and emotionally intelligent.
dont use more than 150 words in a single response.
like a real therapist 
`,
      },
    ]);
  }
  return userSessions.get(userId);
}

// Chat route using Gemini
app.post("/api/chat", async (req, res) => {
  try {
    const { message, userId } = req.body; // ✅ userId frontend se aayega
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // ✅ FIX: User-specific history
    const userConversationHistory = getUserSession(userId);

    // Add user message
    userConversationHistory.push({ role: "user", content: message });

    // ✅ Fix role conversion for Gemini
    const messages = userConversationHistory.map((m) => {
      let role = "user";
      if (m.role === "assistant") role = "model";
      else if (m.role === "system") role = "user";
      else role = m.role;
      return {
        role,
        parts: [{ text: m.content }],
      };
    });

    // Gemini API call
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: messages,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const rawReply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't understand that.";
    const reply = cleanText(rawReply);

    // ✅ Store assistant reply in user-specific history
    userConversationHistory.push({ role: "assistant", content: reply });

    res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error("❌ Gemini API error:", err.response?.data || err.message);
    res.status(500).json({
      error:
        err.response?.data?.error?.message ||
        "Server error. Check backend logs.",
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

app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});