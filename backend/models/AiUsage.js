const mongoose = require("mongoose");

const aiUsageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  lastReset: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("AiUsage", aiUsageSchema);