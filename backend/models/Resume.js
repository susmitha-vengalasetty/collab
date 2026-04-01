const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  name: String,
  education: String,
  skills: String,
  projects: String,
  experience: String,
  careerGoal: String,

  aiSuggestions: String

}, { timestamps: true });

module.exports = mongoose.model("Resume", resumeSchema);