const express = require("express");
const router = express.Router();

const {
  analyzeResume,
  getMyResumes,
  deleteResume
} = require("../controllers/resumeController");

// import protect from your auth middleware
const { protect } = require("../middleware/authMiddleware");

/* ANALYZE RESUME */
router.post("/analyze", protect, analyzeResume);

/* GET SAVED RESUMES */
router.get("/my-resumes", protect, getMyResumes);

/* DELETE RESUME */
router.delete("/delete/:id", protect, deleteResume);

module.exports = router;