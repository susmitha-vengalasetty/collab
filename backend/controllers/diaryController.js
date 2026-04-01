const Diary = require("../models/Diary");
const { generateWithGemini } = require("../config/gemini");

/* Analyze diary and save */
exports.analyzeDiary = async (req,res)=>{
try{

const { text } = req.body;
const userId = req.user.id;

if(!text){
return res.status(400).json({message:"Diary text required"});
}

if(text.length > 2000){
return res.status(400).json({message:"Diary must be under 2000 characters"});
}

const prompt = `
You are an AI study mentor.

Analyze the student's study diary entry and provide feedback.

Return in this format:

Mood:
Study Motivation:
Productivity Level:
Advice:

feedback should be concise and short.
also recommend one actionable tip to improve their study habits.

Diary Entry:
${text}
`;

const analysis = await generateWithGemini(prompt);

const today = new Date();

const diary = await Diary.create({
user:userId,
text,
analysis,
date:today.toLocaleDateString(),
day:today.toLocaleDateString("en-US",{weekday:"long"})
});

res.json(diary);

}catch(error){

console.error("Diary AI Error:",error);

res.status(500).json({
message:"Diary analysis failed"
});

}
};


/* Get diary history */
exports.getDiary = async (req,res)=>{
try{

const diaries = await Diary.find({user:req.user.id})
.sort({createdAt:-1});

res.json(diaries);

}catch(error){

res.status(500).json({
message:"Failed to fetch diary"
});

}
};


/* Delete diary entry */
exports.deleteDiary = async (req,res)=>{
try{

await Diary.findByIdAndDelete(req.params.id);

res.json({
message:"Diary deleted"
});

}catch(error){

res.status(500).json({
message:"Delete failed"
});

}
};