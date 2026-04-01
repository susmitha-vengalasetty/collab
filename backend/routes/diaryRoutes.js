const express = require("express");
const router = express.Router();

const diaryController = require("../controllers/diaryController");
const { protect } = require("../middleware/authMiddleware");

/* Create + Analyze diary */
router.post("/analyze", protect, diaryController.analyzeDiary);

/* Get diary history */
router.get("/", protect, diaryController.getDiary);

/* Delete diary entry */
router.delete("/:id", protect, diaryController.deleteDiary);

module.exports = router;