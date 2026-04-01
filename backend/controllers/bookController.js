const { generateWithGemini } = require("../config/gemini");

exports.getBookRecommendations = async (req, res) => {
  try {
    const { subject, level, goal } = req.body;

    /* ================= VALIDATION ================= */

    if (!subject || !level || !goal) {
      return res.status(400).json({
        message: "Subject, level and goal are required",
      });
    }

    /* ================= AI PROMPT ================= */

    const prompt = `
You are an academic mentor and book advisor.

Recommend 5 best books for learning the topic below.

Subject: ${subject}
Student Level: ${level}
Goal: ${goal}

Books should help with:
- academic learning
- competitive exams
- knowledge building
- self improvement

Return ONLY valid JSON in this format:

[
  {
    "book": "Book Name",
    "author": "Author Name",
    "difficulty": "Beginner | Intermediate | Advanced",
    "reason": "Short reason why this book is useful"
  }
]

Do NOT include explanation.
Do NOT include text before or after JSON.
`;

    /* ================= GEMINI CALL ================= */

    const result = await generateWithGemini(prompt);

    let cleaned = result
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let books = [];

    /* ================= SAFE JSON PARSE ================= */

    try {
      books = JSON.parse(cleaned);
    } catch (parseError) {

      console.log("❌ AI returned invalid JSON:");
      console.log(cleaned);

      return res.status(500).json({
        message: "AI returned invalid format",
      });
    }

    /* ================= SUCCESS RESPONSE ================= */

    res.json({
      success: true,
      books,
    });

  } catch (error) {

    console.error("❌ BOOK AI ERROR:", error);

    res.status(500).json({
      message: "Failed to generate book recommendations",
    });
  }
};