const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  exam: {
    type: String, // JEE, NEET, Board
    required: true,
  },
  difficulty: {
    type: String, // easy, medium, hard
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
  },
});

module.exports = mongoose.model("Question", questionSchema);