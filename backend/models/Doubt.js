const mongoose = require("mongoose");

const doubtSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },

    moodAtTime: {
      type: String,
      enum: ["motivated", "normal", "tired", "stressed"],
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doubt", doubtSchema);