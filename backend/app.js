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

const PORT = process.env.PORT;
connectDB();

//gemni 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 5. Apni custom API route bana rahe hain — /api/chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body; // ✅ single message receive

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
              You are a kind and professional psychologist chatbot.
Your only goal is to offer emotional support and understanding in a calm, natural, human tone.

Guidelines:
- Speak gently and warmly.
- Use short, caring sentences.
- Never say you cannot do something.
- never mention "*" "**"
- Never mention being an AI or assistant.
- Focus only on empathy, comfort, and emotional understanding.
- Keep it natural, human, and supportive.
User's message: ${message}
`,
            },
          ],
        },
      ],
    };

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process that.";

    res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error("❌ Error calling Gemini:", err.response?.data || err.message);
    res.status(500).json({ error: "Gemini API error" });
  }
});







app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log("server runniing at port " + PORT);
});


