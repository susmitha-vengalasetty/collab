require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("../models/Question");

const questions = require("../seed/questions.json"); // we will create this next

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected for Seeding");

    await Question.deleteMany(); // optional: clears old questions
    await Question.insertMany(questions);

    console.log("🎉 100 Questions Inserted Successfully!");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Seeding Failed:", err);
    process.exit(1);
  });