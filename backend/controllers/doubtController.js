const Doubt = require("../models/Doubt");
const { generateWithGemini } = require("../config/gemini");

/* ================= ASK DOUBT ================= */

exports.askDoubt = async (req, res) => {
  try {
    const { question, mood } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const systemPrompt = `
You are IntelliShine Academic Tutor.

Rules:
-Provide answers within 10-12 lines and expand its length based on the question like if user asks detailed and depth then extend the lines to 20 and max 30 lines.
- Give clear and structured answers
- Use step-by-step explanation when required
- Keep answers concise unless the topic needs depth
- Avoid unnecessary repetition
- Adapt answer length based on question complexity
- Use simple student-friendly language.
- Use bullet points when helpful.
- Use small tables if comparison is needed.
- Do NOT give long motivational speeches.
- Be practical and direct.
- Avoid very long paragraphs.

If question is unrelated to academics or self-improvement, politely refuse.
`;

    const finalPrompt = `
${systemPrompt}

Student Mood: ${mood || "normal"}

Question:
${question}
`;

    const aiAnswer = await generateWithGemini(finalPrompt);

    const doubt = await Doubt.create({
      user: req.user._id,
      question,
      answer: aiAnswer,
      moodAtTime: mood || "normal",
    });

    res.status(201).json(doubt);

  } catch (error) {
    console.error("Doubt Error:", error);
    res.status(500).json({ message: error.message });
  }
};



exports.deleteDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    await doubt.deleteOne();

    res.json({ message: "Doubt deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL MY DOUBTS ================= */

exports.getMyDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};