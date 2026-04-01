const mongoose = require("mongoose");

const videoNotesSchema = new mongoose.Schema({

  videoId: String,

  title: String,

  notes: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("VideoNotes", videoNotesSchema);