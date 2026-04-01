const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  sendMessage,
  getChatHistory,
  clearChat,
} = require("../controllers/chatController");

router.post("/", protect, sendMessage);
router.get("/history", protect, getChatHistory);
router.delete("/clear", protect, clearChat);

module.exports = router;