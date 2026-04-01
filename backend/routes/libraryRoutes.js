const express = require("express");
const router = express.Router();

const {
  saveVideo,
  getSavedVideos
} = require("../controllers/libraryController");

const { protect } = require("../middleware/authMiddleware");

router.post("/save", protect, saveVideo);
router.get("/my-videos", protect, getSavedVideos);

module.exports = router;