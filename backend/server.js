const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const focusRoutes = require("./routes/focusRoutes");
const doubtRoutes = require("./routes/doubtRoutes");
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");
const studyPlanRoutes = require("./routes/studyPlanRoutes");
const mockTestRoutes = require("./routes/mockTestRoutes");
const youtubeRoutes = require("./routes/youtubeRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const youtubeSummary = require("./routes/youtubeSummary");
const aiRoutes = require("./routes/aiRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const bookRoutes = require("./routes/bookRoutes");
const newsRoutes = require("./routes/newsRoutes");




const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const { generateWithGemini, listAvailableModels } = require("./config/gemini");

const app = express();

/* ===============================
   MIDDLEWARE
================================ */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/* ===============================
   ROUTES
================================ */

app.use("/api/auth", authRoutes);
app.use("/api/studyplan", studyPlanRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/mock-test", mockTestRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/youtube-summary", youtubeSummary);
app.use("/api/diary", require("./routes/diaryRoutes"));
app.use("/api/resume", resumeRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/news", newsRoutes);

const profileRoutes = require("./routes/profileRoutes");
app.use("/api/profile", profileRoutes);

/* ===============================
   GEMINI TEST ROUTES
================================ */

app.get("/test-models", async (req, res) => {
  try {
    const models = await listAvailableModels();
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/test-ai", async (req, res) => {
  try {
    const text = await generateWithGemini("Say hello from IntelliShine AI");
    res.json({ message: text });
  } catch (error) {
    console.error("FULL GEMINI ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   ROOT
================================ */

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

/* ===============================
   ERROR HANDLER
================================ */

app.use(notFound);
app.use(errorHandler);

/* ===============================
   DATABASE CONNECTION
================================ */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
  });