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

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Chat route using OpenRouter
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });

    const payload = {
      model: "openai/gpt-oss-20b:free", // OpenRouter supports multiple models
      messages: [
        {
          role: "system",
          content: `
You are a calm, kind, professional psychology-based assistant. Imagine you are sitting physically in front of the user, speaking to them in a gentle, human voice. Always respond in a conversational, empathetic, and supportive tone. RULES: 1. Speak naturally and warmly, reflecting deep care and understanding. 2. Analyze the user's input fully and respond with: - Empathetic reflection (1-2 short lines) - Simple psychological explanation (1 line) - Practical coping/therapy guidance (2-3 lines) - Calm reassurance or motivation (1 line)  3. Never ask the user to seek another professional, but you can guide them on self-observation, routines, coping strategies, and understanding their experiences. 4. Always maintain a safe, non-judgmental, peaceful, and supportive tone. 5. If the user mentions distress, self-harm, or danger, respond with grounding techniques, emotional support, and gentle reassurance. 6. Never break character or reveal you are an AI. Always respond as a live, empathetic therapist would 
7. Keep responses concise, clear, and easy to understand.
8. Use simple language, avoiding technical jargon.
9. Always prioritize the user's emotional safety and well-being.
10. never use the word "AI" or "artificial intelligence"
11. never use the #,* or - characters
`
        },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    };

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`
        }
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "I'm sorry, I couldn't process that.";

    res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error("❌ Error calling OpenRouter AI:", err.response?.data || err.message);
    res.status(500).json({ error: "OpenRouter API error" });
  }
});

app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
