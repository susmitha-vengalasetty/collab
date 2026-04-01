const { checkAndUpdateAiUsage } = require("../services/aiUsageService");
const Chat = require("../models/Chat");
const { generateWithGemini } = require("../config/gemini");

/* ================= CHAT ================= */

exports.sendMessage = async (req, res) => {
  try {
    const { message, mode } = req.body;

    if (!message)
      return res.status(400).json({ message: "Message required" });

    // DEFAULT SHORT ANSWER
    let systemPrompt = `
        You are IntelliShine AI Assistant.

        Mode: QUICK

        Instructions:
        - Answer clearly in 5-6 lines maximum.
        - Keep it simple and student-friendly.
        - No long explanations.
        - No extra examples.
        `;

        if (mode === "detailed") {
          systemPrompt = `
        You are IntelliShine AI Assistant.

        Mode: DETAILED

        Instructions:
        - Minimum 10-12 lines.
        - Explain a little more in depth.
        - Use headings and bullet points if needed.
        - Give 1 practical example.
        - Do NOT keep it short.
        `;
        }

        if (mode === "deep") {
          systemPrompt = `
        You are IntelliShine AI Assistant.

        Mode: VERY DEEP ANALYSIS

        Instructions:
        - Minimum 30-40 lines.
        - Provide detailed conceptual explanation.
        - Include multiple examples.
        - Add real-world application.
        - Add strategy or improvement tips.
        - Add conclusion summary.
        - Make it feel like a mini-lesson.
        - Be structured using headings and subpoints.
        - Do NOT give short responses.
        `;
        }

    const fullPrompt = `
${systemPrompt}

Student Question:
${message}
`;

    const usageCheck = await checkAndUpdateAiUsage(req.user._id);

    if (!usageCheck.allowed) {
      return res.status(429).json({
        message: "Daily AI limit reached. Try again after 5:30 AM IST.",
      });
    }

aiReply = await generateWithGemini(fullPrompt);

    let chat = await Chat.findOne({ user: req.user._id });

    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        messages: [],
      });
    }

    chat.messages.push({ sender: "user", text: message });
    chat.messages.push({ sender: "ai", text: aiReply });

    await chat.save();

    res.json({ reply: aiReply, messages: chat.messages });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ message: "AI failed" });
  }
};

/* ================= GET HISTORY ================= */

exports.getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user._id });

    if (!chat) return res.json({ messages: [] });

    res.json({ messages: chat.messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= CLEAR CHAT ================= */

exports.clearChat = async (req, res) => {
  try {
    await Chat.findOneAndDelete({ user: req.user._id });
    res.json({ message: "Chat cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};