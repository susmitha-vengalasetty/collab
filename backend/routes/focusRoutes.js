const express = require("express");
const router = express.Router();

const controller = require("../controllers/focusController");
console.log("Controller import:", controller);

const {
  startFocusSession,
  endFocusSession,
  getMyFocusSessions,
  getWeeklyFocusReport,
} = controller;

const { protect } = require("../middleware/authMiddleware");

router.post("/start", protect, startFocusSession);
router.put("/end/:id", protect, endFocusSession);
router.get("/", protect, getMyFocusSessions);
router.get("/weekly-report", protect, getWeeklyFocusReport);

module.exports = router;