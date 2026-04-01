import React, { useState, useEffect } from "react";
import axios from "axios";

const StudyDiary = () => {

const [text,setText] = useState("");
const [analysis,setAnalysis] = useState("");
const [history,setHistory] = useState([]);

const token = localStorage.getItem("token");

useEffect(()=>{
fetchHistory();
},[]);

const fetchHistory = async()=>{

try{

const res = await axios.get(
"http://localhost:5000/api/diary",
{
headers:{Authorization:`Bearer ${token}`}
}
);

setHistory(res.data);

}catch(err){
console.log(err);
}

};

const analyzeDiary = async()=>{

if(!text.trim()){
alert("Please write today's reflection");
return;
}

try{

const res = await axios.post(
"http://localhost:5000/api/diary/analyze",
{ text },
{
headers:{Authorization:`Bearer ${token}`}
}
);

setAnalysis(res.data.analysis);
setText("");
fetchHistory();

}catch(err){
console.log(err);
alert("Error analyzing diary");
}

};

const deleteEntry = async(id)=>{

if(!window.confirm("Delete this diary entry?")) return;

try{

await axios.delete(
`http://localhost:5000/api/diary/${id}`,
{
headers:{Authorization:`Bearer ${token}`}
}
);

fetchHistory();

}catch(err){
console.log(err);
}

};

/* Highlight keywords */

const formatAnalysis = (text) => {

if(!text) return "";

return text
.replace(/Mood:/g,"<span class='font-semibold text-indigo-600'>Mood:</span>")
.replace(/Study Motivation:/g,"<span class='font-semibold text-green-600'>Study Motivation:</span>")
.replace(/Productivity Level:/g,"<span class='font-semibold text-orange-600'>Productivity Level:</span>")
.replace(/Advice:/g,"<span class='font-semibold text-purple-600'>Advice:</span>")
.replace(/Actionable Tip:/g,"<span class='font-semibold text-red-600'>Actionable Tip:</span>");

};

return (

<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

{/* HEADER */}

<div className="text-center mb-8">

<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-600">
Study Reflection Diary
</h1>

<p className="text-gray-600 mt-2 text-sm sm:text-base">
Reflect on your study day and receive AI-powered feedback.
</p>

</div>

{/* WRITE SECTION */}

<div className="bg-white rounded-xl shadow-md p-6 sm:p-8 mb-10 max-w-4xl mx-auto">

<h2 className="font-semibold text-lg mb-4">
Today's Reflection
</h2>

<textarea
className="w-full border rounded-lg p-4 sm:p-5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
rows="6"
placeholder="Example: Today I tried learning recursion but struggled understanding the base case..."
value={text}
onChange={(e)=>setText(e.target.value)}
maxLength={2000}
/>

<div className="flex justify-between items-center mt-2 text-xs text-gray-500">
<span>{text.length}/2000 characters</span>
</div>

<button
onClick={analyzeDiary}
className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
>
Analyze Study Reflection
</button>

</div>

{/* AI FEEDBACK */}

{analysis && (

<div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-10 max-w-4xl mx-auto">

<h2 className="font-semibold text-lg mb-4 text-indigo-700">
AI Study Feedback
</h2>

<p
className="text-sm sm:text-base whitespace-pre-line leading-relaxed"
dangerouslySetInnerHTML={{
__html:formatAnalysis(analysis)
}}
/>

</div>

)}

{/* HISTORY */}

<h2 className="text-xl font-semibold mb-4 text-center">
Previous Reflections
</h2>

{history.length === 0 && (

<p className="text-gray-500 text-sm text-center">
No reflections yet. Start writing your first diary.
</p>

)}

<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

{history.map(entry=>(

<div
key={entry._id}
className="bg-white rounded-xl shadow-md p-5 border hover:shadow-lg transition"
>

<div className="flex justify-between items-center mb-2">

<span className="text-xs text-gray-500">
{entry.day} • {entry.date}
</span>

<button
onClick={()=>deleteEntry(entry._id)}
className="text-red-500 text-sm hover:underline"
>
Delete
</button>

</div>

<p className="text-sm sm:text-base mb-3 text-gray-700">
{entry.text}
</p>

<div
className="bg-gray-100 rounded p-3 text-sm whitespace-pre-line leading-relaxed"
dangerouslySetInnerHTML={{
__html:formatAnalysis(entry.analysis)
}}
/>

</div>

))}

</div>

</div>

);

};

export default StudyDiary;

