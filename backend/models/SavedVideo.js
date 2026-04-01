const mongoose = require("mongoose");

const savedVideoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoId: String,
    title: String,
    channel: String,
    thumbnail: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavedVideo", savedVideoSchema);