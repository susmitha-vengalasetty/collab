const Resume = require("../models/Resume");
const { generateWithGemini } = require("../config/gemini"); 
// adjust path if your gemini file name is different

/*
ANALYZE RESUME
*/
exports.analyzeResume = async (req, res) => {

  try {

    const {
      name,
      education,
      skills,
      projects,
      experience,
      careerGoal
    } = req.body;

    // Create prompt for Gemini AI
    const prompt = `
You are an expert career mentor and resume reviewer.

Analyze the following student resume information and give SHORT structured suggestions.

Student Data:
Name: ${name}
Education: ${education}
Skills: ${skills}
Projects: ${projects}
Experience: ${experience}
Career Goal: ${careerGoal}

Give response ONLY in this format:

Missing Skills:
- skill 1
- skill 2

Resume Improvements:
- improvement 1
- improvement 2

Project Ideas:
- project idea 1
- project idea 2

Career Advice:
- short advice
`;

    // Call Gemini AI
    const aiSuggestions = await generateWithGemini(prompt);

    // Save to database
    const resume = await Resume.create({

      userId: req.user._id,

      name,
      education,
      skills,
      projects,
      experience,
      careerGoal,

      aiSuggestions

    });

    // Send response to frontend
    res.json({
      result: aiSuggestions,
      resume
    });

  } catch (error) {

    console.error("Resume AI Error:", error);
    res.status(500).json({ message: "Resume analysis failed" });

  }

};


/*
GET USER RESUMES
*/
exports.getMyResumes = async (req, res) => {

  try {

    const resumes = await Resume.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    res.json(resumes);

  } catch (error) {

    console.error("Fetch resumes error:", error);
    res.status(500).json({ message: "Error fetching resumes" });

  }

};


/*
DELETE RESUME
*/
exports.deleteResume = async (req, res) => {

  try {

    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    await Resume.findByIdAndDelete(req.params.id);

    res.json({ message: "Resume deleted successfully" });

  } catch (error) {

    console.error("Delete resume error:", error);
    res.status(500).json({ message: "Delete failed" });

  }

};