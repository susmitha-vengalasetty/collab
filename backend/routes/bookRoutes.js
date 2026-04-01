const express = require("express");
const router = express.Router();

const { getBookRecommendations } = require("../controllers/bookController");
const { protect } = require("../middleware/authMiddleware");

router.post("/recommend", protect, getBookRecommendations);

module.exports = router;