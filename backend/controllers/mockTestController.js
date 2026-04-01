const Question = require("../models/Question");
const MockTest = require("../models/MockTest");

/* ===== GENERATE TEST ===== */

exports.generateTest = async (req, res) => {
  try {
    const { subject, exam, difficulty, number } = req.body;

    const questions = await Question.aggregate([
      { $match: { subject, exam, difficulty } },
      { $sample: { size: Number(number) || 10 } },
    ]);

    if (!questions.length) {
      return res.status(404).json({ message: "No questions found" });
    }

    // 🔒 Remove correctAnswer before sending to frontend
    const safeQuestions = questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));

    res.json(safeQuestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===== SUBMIT TEST ===== */

exports.submitTest = async (req, res) => {
  try {
    const { subject, exam, difficulty, answers } = req.body;

    let score = 0;
    const detailedResults = [];

    for (let ans of answers) {
      const dbQuestion = await Question.findById(ans.questionId);

      if (!dbQuestion) continue;

      const isCorrect = ans.selectedAnswer === dbQuestion.correctAnswer;

      if (isCorrect) score++;

      detailedResults.push({
        question: dbQuestion.question,
        options: dbQuestion.options,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: dbQuestion.correctAnswer,
        explanation: dbQuestion.explanation,
        isCorrect,
      });
    }

    const mockTest = await MockTest.create({
      user: req.user._id,
      subject,
      exam,
      difficulty,
      questions: detailedResults,
      score,
      total: answers.length,
    });

    res.json({
      score,
      total: answers.length,
      percentage: ((score / answers.length) * 100).toFixed(2),
      details: detailedResults, // 🔥 VERY IMPORTANT
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteMockTest = async (req, res) => {
  try {
    const test = await MockTest.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    if (test.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await test.deleteOne();

    res.json({ message: "Test deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===== HISTORY ===== */

exports.getHistory = async (req, res) => {
  try {
    const tests = await MockTest.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ===== TEST STATS ===== */

exports.getTestStats = async (req, res) => {
  try {
    const tests = await MockTest.find({ user: req.user._id });

    if (!tests.length) {
      return res.json({
        totalTests: 0,
        averageScore: 0,
        highestScore: 0,
        subjectStats: [],
      });
    }

    const totalTests = tests.length;

    const totalScore = tests.reduce((acc, t) => acc + t.score, 0);
    const averageScore = (totalScore / totalTests).toFixed(2);

    const highestScore = Math.max(...tests.map((t) => t.score));

    // Subject-wise performance
    const subjectMap = {};

    tests.forEach((test) => {
      if (!subjectMap[test.subject]) {
        subjectMap[test.subject] = { total: 0, scored: 0 };
      }
      subjectMap[test.subject].total += test.total;
      subjectMap[test.subject].scored += test.score;
    });

    const subjectStats = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      percentage: ((data.scored / data.total) * 100).toFixed(2),
    }));

    res.json({
      totalTests,
      averageScore,
      highestScore,
      subjectStats,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
