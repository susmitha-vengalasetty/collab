const Focus = require("../models/FocusModel");

/* ================= START SESSION ================= */
exports.startFocusSession = async (req, res) => {
  try {
    const { moodBefore } = req.body;

    if (!moodBefore) {
      return res.status(400).json({ message: "Mood is required" });
    }

    const focus = await Focus.create({
      user: req.user._id,
      startTime: new Date(),
      moodBefore,
    });

    // Auto end after 25 minutes
    setTimeout(async () => {
      const session = await Focus.findById(focus._id);
      if (session && !session.endTime) {
        session.endTime = new Date();
        session.duration = 25;
        await session.save();
      }
    }, 25 * 60 * 1000);

    res.status(201).json(focus);
  } catch (error) {
    console.error("Start Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= END SESSION ================= */
exports.endFocusSession = async (req, res) => {
  try {
    const { moodAfter, distractionCount } = req.body;

    const session = await Focus.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.endTime) {
      return res.status(400).json({ message: "Session already ended" });
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime - session.startTime) / 60000
    );

    session.endTime = endTime;
    session.duration = duration;
    session.moodAfter = moodAfter;
    session.distractionCount = distractionCount;

    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL SESSIONS ================= */
exports.getMyFocusSessions = async (req, res) => {
  try {
    const sessions = await Focus.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= WEEKLY REPORT ================= */
exports.getWeeklyFocusReport = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await Focus.find({
      user: req.user._id,
      createdAt: { $gte: sevenDaysAgo },
      endTime: { $exists: true }, // ✅ ignore incomplete sessions
    });

    const totalMinutes = sessions.reduce(
      (acc, s) => acc + (s.duration || 0),
      0
    );

    const totalDistractions = sessions.reduce(
      (acc, s) => acc + (s.distractionCount || 0),
      0
    );

    const productivityScore =
      totalMinutes - totalDistractions * 2;

    res.json({
      totalSessions: sessions.length,
      totalMinutes,
      totalDistractions,
      productivityScore,
    });
  } catch (error) {
    console.error("Weekly Report Error:", error);
    res.status(500).json({ message: error.message });
  }
};