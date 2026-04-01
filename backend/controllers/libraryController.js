const SavedVideo = require("../models/SavedVideo");

exports.saveVideo = async (req, res) => {
  try {

    const { videoId, title, channel, thumbnail } = req.body;

    const saved = await SavedVideo.create({
      userId: req.user._id,
      videoId,
      title,
      channel,
      thumbnail,
    });

    res.json(saved);

  } catch (error) {
    res.status(500).json({ message: "Failed to save video" });
  }
};


exports.getSavedVideos = async (req, res) => {

  try {

    const videos = await SavedVideo.find({ userId: req.user._id });

    res.json(videos);

  } catch (error) {
    res.status(500).json({ message: "Error fetching saved videos" });
  }

};