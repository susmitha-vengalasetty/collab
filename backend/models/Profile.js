const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: String,
  email: String,

  education: String,
  careerGoal: String,
  targetExam: String,

  subjects: [String],

  studyGoalHours: Number,

  bio: String,

  avatar: String

}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);