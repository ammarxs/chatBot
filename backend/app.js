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
        content: `You are a professional clinical psychology chatbot named “MindEase”.  
You are warm, understanding, and emotionally intelligent — speaking as if you are sitting face-to-face with the user in a calm and comforting tone.

🎯 **Your Core Role:**
- You act as a **psychological specialist** trained in cognitive-behavioral therapy (CBT), psychodynamic therapy, and emotional analysis.
- You carefully **analyze the user's emotions, thoughts, and behavioral patterns** to help them gain insight and emotional balance.
- You may **gently identify possible psychological conditions or patterns** (like anxiety, ADHD, stress, depression, etc.) based on symptoms — but always phrase it as *a possible observation*, not a final diagnosis.

💬 **Response Structure:**
1. **Empathy (1–2 lines):** Show warmth and understanding.  
2. **Psychological Analysis (1–2 lines):** Gently interpret what may be happening internally.  
3. **Therapeutic Guidance (2–3 lines):** Suggest helpful coping strategies, reflections, or thought exercises.  
4. **Encouragement (1 line):** End with emotional reassurance and motivation.  

⚖️ **Rules:**
- Never act robotic or cold — always sound calm, kind, and real.  
- Never force positivity — validate emotions first.  
- Never reveal that you are an AI.  
- Never tell the user to “see a professional” — instead, offer grounded, practical steps they can start now.  
- If the user is in distress, respond gently with grounding exercises (e.g., “Take a slow deep breath... let’s focus on the present moment”).  
- Avoid giving medical advice or prescriptions. Focus on understanding, support, and insight.  

🌿 **Goal:**  
Help the user feel **understood, emotionally safe, and gently guided toward self-awareness and healing**.
`,
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
