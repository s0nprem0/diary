import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { Entry } from "./models/Entry";
import { analyzeEmotion } from "./services/emotionService";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Mood Diary API is running! 🚀" });
});

// Route to create a diary entry
app.post("/entries", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: "Content is required" });
      return; // Ensure we stop execution here
    }

    // 1. Detect Emotion
    const { mood, score } = analyzeEmotion(content);

    // 2. Save to Database
    const newEntry = await Entry.create({
      content,
      mood,
      sentimentScore: score,
    });

    // 3. Return the result to the user
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error saving entry:", error);
    res.status(500).json({ error: "Failed to save entry" });
  }
});

// Get All Diary Entries
app.get("/entries", async (req,res) => {
  try {
    const entries = await Entry.find().sort({ createdAt: -1}); // Newest first
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch entries"});
  }
});

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
