const express = require("express");
const router = express.Router();

const { 
  askDoubt, 
  getMyDoubts, 
  deleteDoubt 
} = require("../controllers/doubtController");

const { protect } = require("../middleware/authMiddleware");

// ================= ASK DOUBT =================
router.post("/ask", protect, askDoubt);

// ================= GET ALL MY DOUBTS =================
router.get("/", protect, getMyDoubts);

// ================= DELETE A DOUBT =================
router.delete("/:id", protect, deleteDoubt);

module.exports = router;