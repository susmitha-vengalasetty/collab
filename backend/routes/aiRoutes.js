const express = require("express");
const router = express.Router();
const { generateWithGemini } = require("../config/gemini");
const VideoNotes = require("../models/VideoNotes");

router.post("/summary", async (req, res) => {

  const { title, videoId } = req.body;

  try {

    // Check if notes already exist
    const existing = await VideoNotes.findOne({ videoId });

    if (existing) {
      return res.json({ summary: existing.notes });
    }

    const prompt = `
You are an expert teacher.

Create structured study notes for this lecture topic:

"${title}"

Provide:

1. Key Concepts
2. Short Explanation
3. Important Points to Remember
4. Simple Examples if possible
`;

    const summary = await generateWithGemini(prompt);

    // Save notes
    await VideoNotes.create({
      videoId,
      title,
      notes: summary
    });

    res.json({ summary });

  } catch (error) {

    console.error(error);
    res.status(500).json({
      message: "Failed to generate summary"
    });

  }

});

module.exports = router;