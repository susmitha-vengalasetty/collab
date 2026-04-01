const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createStudyPlan,
  getStudyPlans,
  getSingleStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
  setActivePlan,
  assignPlanToDay,
  assignWholeWeek
} = require("../controllers/studyPlanController");

router.put("/set-active/:planId", protect, setActivePlan);

router.put("/assign-day", protect, assignPlanToDay);

router.put("/assign-week", protect, assignWholeWeek);


router.route("/")
  .post(protect, createStudyPlan)
  .get(protect, getStudyPlans);

router.route("/:id")
  .get(protect, getSingleStudyPlan)
  .put(protect, updateStudyPlan)
  .delete(protect, deleteStudyPlan);

module.exports = router;