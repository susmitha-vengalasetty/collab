const mongoose = require("mongoose");

const mockTestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: String,
  exam: String,
  difficulty: String,

  // ✅ Updated structure to match submitTest controller
  questions: [
    {
      question: String,
      options: [String],
      selectedAnswer: String,
      correctAnswer: String,
      explanation: String,
      isCorrect: Boolean,
    },
  ],

  score: Number,
  total: Number,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MockTest", mockTestSchema);