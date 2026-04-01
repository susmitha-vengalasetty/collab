const { checkAndUpdateAiUsage } = require("../services/aiUsageService");
const StudyPlan = require("../models/StudyPlan");
const { generateWithGemini } = require("../config/gemini");
const mongoose = require("mongoose");

/* ================= MOOD CONFIG ================= */

const moodConfig = {
  motivated: {
    session: "Use 90-minute deep work sessions with 10-minute breaks."
  },
  normal: {
    session: "Use 60-minute sessions with 10-minute breaks."
  },
  tired: {
    session: "Use 45-minute sessions with 15-minute breaks."
  },
  stressed: {
    session: "Start with easiest subject and include relaxation breaks."
  }
};

/* ================= BUILD GEMINI PROMPT ================= */

const buildPrompt = (mood, sessionStyle, totalHours, subjectList) => `
Generate a strict daily study timetable.

IMPORTANT RULES:
- Do NOT include meals.
- Do NOT schedule anything between:
  8:00 AM - 9:00 AM
  12:00 PM - 1:00 PM
  8:00 PM - 9:00 PM
- Start scheduling between 6:00 AM - 8:00 AM and from 9:00 AM onwards.
- Follow session style strictly:
  ${sessionStyle}
- Use proper 12-hour format.
- Return ONLY timetable.
- No headings.
- No explanations.

FORMAT STRICTLY LIKE:
9:00 AM - 10:00 AM | Maths
10:00 AM - 10:10 AM | Break

Mood: ${mood}
Total Study Hours: ${totalHours}

Subjects:
${subjectList}
`;

/* ================= CALCULATE HOURS ================= */

const calculateHours = (subjects, totalHours, mood) => {
  const totalMinutes = totalHours * 60;

  const weightedSubjects = subjects.map(sub => {
    const baseWeight = 1 / sub.priority;
    let weight = baseWeight;

    if (mood === "motivated") {
      weight = baseWeight * sub.priority;
    } else if (mood === "tired") {
      weight = baseWeight * (1 / sub.priority);
    } else if (mood === "stressed") {
      weight = sub.priority === 1 ? baseWeight * 3 : baseWeight * 0.5;
    }

    return { ...sub, weight };
  });

  const totalWeight = weightedSubjects.reduce((sum, s) => sum + s.weight, 0);

  let allocatedMinutes = 0;

  return weightedSubjects.map((sub, index) => {
    let minutes = Math.floor((sub.weight / totalWeight) * totalMinutes);
    allocatedMinutes += minutes;

    if (index === weightedSubjects.length - 1) {
      minutes += totalMinutes - allocatedMinutes;
    }

    return {
      name: sub.name,
      priority: sub.priority,
      hours: Math.floor(minutes / 60),
      minutes: minutes % 60
    };
  });
};

/* ================= CREATE ================= */

exports.createStudyPlan = async (req, res) => {
  try {
    const { subjects, totalHoursPerDay, mood } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0)
      return res.status(400).json({ message: "Subjects required" });

    if (!totalHoursPerDay || totalHoursPerDay <= 0)
      return res.status(400).json({ message: "Invalid hours" });

    if (!mood || !moodConfig[mood])
      return res.status(400).json({ message: "Invalid mood" });

    // Validate each subject
    for (const sub of subjects) {
      if (!sub.name || !sub.priority)
        return res.status(400).json({
          message: "Each subject must have name and priority"
        });

      if (sub.priority < 1 || sub.priority > 5)
        return res.status(400).json({
          message: "Priority must be between 1 and 5"
        });
    }

    const subjectsWithHours = calculateHours(
      subjects,
      totalHoursPerDay,
      mood
    );

    const subjectList = subjectsWithHours
      .map(s => `${s.name} - ${s.hours} hrs ${s.minutes} mins`)
      .join("\n");

    const prompt = buildPrompt(
      mood,
      moodConfig[mood].session,
      totalHoursPerDay,
      subjectList
    );

    // 🔹 Check limit BEFORE calling Gemini
      const usageCheck = await checkAndUpdateAiUsage(req.user._id);

      if (!usageCheck.allowed) {
        return res.status(429).json({
          message: "Daily AI limit reached. Try again after 5:30 AM IST.",
        });
      }

    const aiPlan = await generateWithGemini(prompt);

    if (!aiPlan || aiPlan.trim().length === 0)
      return res.status(500).json({
        message: "AI failed to generate timetable"
      });


    const studyPlan = await StudyPlan.create({
      user: req.user._id,
      mood,
      subjects: subjectsWithHours,
      totalHoursPerDay,
      generatedPlan: aiPlan
    });

    res.status(201).json(studyPlan);

  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL ================= */

exports.getStudyPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(plans);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ONE ================= */

exports.getSingleStudyPlan = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid Plan ID" });

    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!plan)
      return res.status(404).json({ message: "Plan not found" });

    res.json(plan);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE ================= */

exports.updateStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!plan)
      return res.status(404).json({ message: "Plan not found" });

    const recalculatedSubjects = calculateHours(
      plan.subjects,
      plan.totalHoursPerDay,
      plan.mood
    );

    plan.subjects = recalculatedSubjects;

    const subjectList = plan.subjects
      .map(s => `${s.name} - ${s.hours} hrs ${s.minutes} mins`)
      .join("\n");

    const prompt = buildPrompt(
      plan.mood,
      moodConfig[plan.mood].session,
      plan.totalHoursPerDay,
      subjectList
    );

    // 🔹 Check limit BEFORE calling Gemini
      const usageCheck = await checkAndUpdateAiUsage(req.user._id);

      if (!usageCheck.allowed) {
        return res.status(429).json({
          message: "Daily AI limit reached. Try again after 5:30 AM IST.",
        });
      }


    const aiPlan = await generateWithGemini(prompt);

    if (!aiPlan)
      return res.status(500).json({ message: "AI regeneration failed" });

    plan.generatedPlan = aiPlan;

    await plan.save();

    res.json(plan);

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Regeneration failed" });
  }

};

/* ================= DELETE ================= */

exports.deleteStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!plan)
      return res.status(404).json({ message: "Plan not found" });

    await plan.deleteOne();

    res.json({ message: "Deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.setActivePlan = async (req, res) => {
  try {

    const { planId } = req.params;

    // remove active from all plans
    await StudyPlan.updateMany(
      { user: req.user.id },
      { isActive: false }
    );

    // activate selected plan
    const plan = await StudyPlan.findByIdAndUpdate(
      planId,
      { isActive: true },
      { new: true }
    );

    res.json(plan);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.assignPlanToDay = async (req, res) => {

  try {

    const { planId, day } = req.body;

    const plan = await StudyPlan.findOne({
      _id: planId,
      user: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

      const validDays = [
        "monday","tuesday","wednesday",
        "thursday","friday","saturday","sunday"
      ];

      if (!validDays.includes(day)) {
        return res.status(400).json({ message: "Invalid day" });
      }

      plan.weeklyAssignments[day] = planId;

    await plan.save();

    res.json(plan);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};



exports.assignWholeWeek = async (req, res) => {

  try {

    const { planId } = req.body;

    const plan = await StudyPlan.findOne({
      _id: planId,
      user: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    plan.weeklyAssignments = {
      monday: planId,
      tuesday: planId,
      wednesday: planId,
      thursday: planId,
      friday: planId,
      saturday: planId,
      sunday: planId
    };

    await plan.save();

    res.json(plan);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};