const Profile = require("../models/Profile");

exports.getProfile = async (req, res) => {
  try {

    const profile = await Profile.findOne({
      userId: req.user.id
    });

    res.json(profile || {});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {

  try {

    const {
      name,
      email,
      education,
      careerGoal,
      targetExam,
      subjects,
      studyGoalHours,
      bio,
      avatar
    } = req.body;

    let profile = await Profile.findOne({
      userId: req.user.id
    });

    if (profile) {

      profile.name = name;
      profile.email = email;
      profile.education = education;
      profile.careerGoal = careerGoal;
      profile.targetExam = targetExam;
      profile.subjects = Array.isArray(subjects) ? subjects : [];
      profile.studyGoalHours = studyGoalHours;
      profile.bio = bio;
      profile.avatar = avatar;

      await profile.save();

    } else {

      profile = await Profile.create({
        userId: req.user.id,
        name,
        email,
        education,
        careerGoal,
        targetExam,
        subjects: Array.isArray(subjects) ? subjects : [],
        studyGoalHours,
        bio,
        avatar
      });

    }

    res.json(profile);

  } catch (error) {
  console.error("PROFILE UPDATE ERROR:", error);
  res.status(500).json({ message: error.message });
}
};