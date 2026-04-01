const express = require("express");
const router = express.Router();

const {
  searchVideos,
  getPlaylistVideos
} = require("../controllers/youtubeController");

router.get("/search", searchVideos);

router.get("/playlist", getPlaylistVideos);

module.exports = router;