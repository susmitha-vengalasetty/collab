const mongoose = require("mongoose");

const focusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
    },

    duration: {
      type: Number, // minutes
    },

    moodBefore: {
      type: String,
      enum: ["motivated", "normal", "tired", "stressed"],
      required: true,
    },

    moodAfter: {
      type: String,
      enum: ["motivated", "normal", "tired", "stressed"],
    },

    distractionCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Focus", focusSchema);