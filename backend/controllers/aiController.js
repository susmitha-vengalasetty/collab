const { generateWithGemini } = require("../config/gemini");

exports.getVideoSummary = async (req, res) => {

  try {

    const { title } = req.body;

    const prompt = `
    Give a short educational summary of the video topic:
    ${title}

    Provide:
    1. Concept explanation
    2. Key points
    3. Important notes
    `;

    const summary = await generateWithGemini(prompt);

    res.json({ summary });

  } catch (error) {

    res.status(500).json({ message: "AI summary failed" });

  }

};