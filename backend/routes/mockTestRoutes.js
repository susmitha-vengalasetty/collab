const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  generateTest,
  submitTest,
  getHistory,
  deleteMockTest,   
   getTestStats,  
} = require("../controllers/mockTestController");


router.post("/generate", protect, generateTest);
router.post("/submit", protect, submitTest);
router.get("/history", protect, getHistory);
router.delete("/history/:id", protect, deleteMockTest);
router.get("/stats", protect, getTestStats);

module.exports = router;