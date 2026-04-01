const express = require("express");
const router = express.Router();

const { generateWithGemini } = require("../config/gemini");

router.post("/summary", async (req, res) => {

  const { title } = req.body;

  if (!title || title.length > 200) {
    return res.status(400).json({
      message: "Invalid video title"
    });
  }

  try {

    const prompt = `
You are a helpful teacher.

Create SHORT and EASY study notes for the topic:

"${title}"

Rules:
• Maximum 5 key points
• Each point should be 1–2 lines only
• Use simple student-friendly language
• Avoid long explanations
• Keep it quick for revision

Format:

Topic: ${title}

• Point 1
• Point 2
• Point 3
• Point 4
• Point 5

Keep the answer under 120 words.
`;

    const summary = await generateWithGemini(prompt);

    res.json({ summary });

  } catch (error) {

    console.error("Gemini Error:", error.message);

    res.status(500).json({
      message: "Failed to generate summary"
    });

  }

});

module.exports = router;