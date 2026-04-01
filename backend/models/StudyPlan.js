const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  hours: {
    type: Number,
    default: 0
  },
  minutes: {
    type: Number,
    default: 0
  }
});

const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },

    mood: {
      type: String,
      required: true,
      enum: ["motivated", "normal", "tired", "stressed"]
    },

    subjects: [subjectSchema],

    totalHoursPerDay: {
      type: Number,
      required: true,
      min: 1
    },

    generatedPlan: {
      type: String,
      required: true
    },
    isActive: {
  type: Boolean,
  default: false
},
    weeklyAssignments: {
  monday: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudyPlan",
    default: null
  },
  tuesday: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudyPlan",
    default: null
  },
  wednesday: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudyPlan",
    default: null
  },
  thursday: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudyPlan",
    default: null
  },
  friday: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudyPlan",
    default: null
  },
  saturday: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudyPlan",
    default: null
  },
  sunday: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudyPlan",
    default: null
  }
}
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyPlan", studyPlanSchema);