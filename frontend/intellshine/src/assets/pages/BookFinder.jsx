import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BookFinder() {

const navigate = useNavigate();

const [subject,setSubject]=useState("");
const [level,setLevel]=useState("Beginner");
const [goal,setGoal]=useState("");

const [books,setBooks]=useState([]);
const [loading,setLoading]=useState(false);
const [history,setHistory]=useState([]);

/* ================= QUICK SUBJECTS ================= */

const quickSubjects=[
"Data Structures",
"Operating Systems",
"Machine Learning",
"Databases",
"UPSC Geography",
"UPSC Polity",
"Self Improvement",
"Productivity",
"Motivation",
"Competitive Exams"
];

/* ================= ACADEMIC KEYWORDS ================= */

const academicKeywords=[
"data","algorithm","computer","programming","ai","machine",
"learning","database","network","software","engineering",
"math","physics","chemistry","biology","history","geography",
"polity","economics","philosophy","psychology","sociology",
"ethics","productivity","motivation","self","improvement",
"competitive","exam","upsc","education","knowledge","career"
];

/* ================= SEARCH VALIDATION ================= */

const isAcademicSearch=(text)=>{

const lower=text.toLowerCase();

return (
academicKeywords.some(keyword=>lower.includes(keyword))
||
lower.split(" ").length>=2
);

};

/* ================= LOAD DATA ================= */

useEffect(()=>{

const savedHistory=localStorage.getItem("bookSearchHistory");
const savedBooks=localStorage.getItem("latestBooks");

if(savedHistory){
setHistory(JSON.parse(savedHistory));
}

if(savedBooks){
setBooks(JSON.parse(savedBooks));
}

},[]);

/* ================= FETCH BOOKS ================= */

const fetchBooks=async()=>{

if(!subject||!goal){
toast.error("Please enter subject and goal");
return;
}

if(!isAcademicSearch(subject)){
toast.error("Please search academic or knowledge related subjects");
return;
}

try{

setLoading(true);

const token=localStorage.getItem("token");

const res=await axios.post(
"http://localhost:5000/api/books/recommend",
{subject,level,goal},
{
headers:{Authorization:`Bearer ${token}`}
}
);

setBooks(res.data.books);
setLoading(false);

/* SAVE CURRENT BOOKS */

localStorage.setItem(
"latestBooks",
JSON.stringify(res.data.books)
);

/* SAVE HISTORY */

const newSearch={
subject,
level,
goal,
books:res.data.books
};

let updated=[newSearch,...history];

if(updated.length>10){
updated=updated.slice(0,10);
}

setHistory(updated);

localStorage.setItem(
"bookSearchHistory",
JSON.stringify(updated)
);

}catch(err){
console.error(err);
setLoading(false);
toast.error("Failed to fetch books");
}

};

/* ================= DELETE HISTORY ================= */

const deleteHistory=(index)=>{

const updated=history.filter((_,i)=>i!==index);

setHistory(updated);

localStorage.setItem(
"bookSearchHistory",
JSON.stringify(updated)
);

};

/* ================= ANALYTICS ================= */

const totalSearches = useMemo(()=>history.length,[history]);

const uniqueSubjects = useMemo(()=>{

const subjects = history.map(h=>h.subject);
return [...new Set(subjects)];

},[history]);

const lastSearch = history.length ? history[0].subject : "None";

/* ================= UI ================= */

return(

<div className="min-h-screen bg-gray-100 px-4 md:px-10 py-8">

{/* HEADER */}

<div className="flex justify-between items-center mb-6">

<h1 className="text-2xl md:text-3xl font-bold text-blue-700">
AI Book Referencing
</h1>

<button
onClick={()=>navigate("/dashboard")}
className="text-red-600 text-xl font-bold"
>
✕
</button>

</div>

{/* ANALYTICS */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

<div className="bg-white p-4 rounded shadow">
<p className="text-gray-600 text-sm">Total Searches</p>
<p className="text-xl font-bold">{totalSearches}</p>
</div>

<div className="bg-white p-4 rounded shadow">
<p className="text-gray-600 text-sm">Unique Subjects</p>
<p className="text-xl font-bold">{uniqueSubjects.length}</p>
</div>

<div className="bg-white p-4 rounded shadow">
<p className="text-gray-600 text-sm">Last Search</p>
<p className="text-xl font-bold">{lastSearch}</p>
</div>

</div>

{/* QUICK SUBJECTS */}

<div className="mb-6 flex flex-wrap gap-2">

{quickSubjects.map((sub,i)=>(

<button
key={i}
onClick={()=>setSubject(sub)}
className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
>
{sub}
</button>

))}

</div>

{/* INPUT */}

<div className="bg-white shadow-md p-6 rounded-lg mb-8">

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

<input
type="text"
placeholder="Subject"
value={subject}
onChange={(e)=>setSubject(e.target.value)}
className="border p-3 rounded w-full"
/>

<select
value={level}
onChange={(e)=>setLevel(e.target.value)}
className="border p-3 rounded w-full"
>

<option>Beginner</option>
<option>Intermediate</option>
<option>Advanced</option>

</select>

<input
type="text"
placeholder="Goal (UPSC / College / Interviews)"
value={goal}
onChange={(e)=>setGoal(e.target.value)}
className="border p-3 rounded w-full"
/>

</div>

<button
onClick={fetchBooks}
className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
>
Get Recommendations
</button>

</div>

{/* LOADING */}

{loading&&(
<p className="text-gray-600 mb-6">
Generating AI recommendations...
</p>
)}

{/* CURRENT RESULTS */}

{books.length>0 &&(

<>

<h2 className="text-xl font-semibold mb-4">
Recommended Books
</h2>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

{books.map((book,index)=>(

<div
key={index}
className="bg-white shadow-lg rounded-lg p-5 border hover:shadow-xl transition"
>

<img
src={`https://covers.openlibrary.org/b/title/${encodeURIComponent(book.book)}.jpg`}
alt="cover"
className="h-40 mx-auto mb-3"
onError={(e)=>{
e.target.src="https://via.placeholder.com/150x220?text=Book";
}}
/>

<h3 className="text-lg font-semibold text-blue-600">
{book.book}
</h3>

<p className="text-gray-700 mt-1">
Author: {book.author}
</p>

<p className="text-sm text-gray-500">
Difficulty: {book.difficulty}
</p>

<p className="text-sm mt-2">
{book.reason}
</p>

<a
href={`https://www.amazon.in/s?k=${encodeURIComponent(book.book)}`}
target="_blank"
rel="noreferrer"
className="inline-block mt-3 text-blue-600 text-sm"
>
View on Amazon
</a>

</div>

))}

</div>

</>

)}

{/* PREVIOUS SEARCHES (excluding latest) */}

{history.length>1 &&(

<>

<h2 className="text-xl font-semibold mb-4">
Previous Searches
</h2>

{history.slice(1).map((item,index)=>(

<div key={index} className="mb-10">

<div className="flex justify-between items-center mb-4">

<div>

<p className="font-semibold text-blue-700 text-lg">
{item.subject}
</p>

<p className="text-sm text-gray-600">
{item.level} • {item.goal}
</p>

</div>

<button
onClick={()=>deleteHistory(index+1)}
className="text-red-600 text-sm"
>
Delete
</button>

</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

{item.books.map((book,i)=>(

<div
key={i}
className="bg-white shadow rounded-lg p-4 border hover:shadow-lg transition"
>

<img
src={`https://covers.openlibrary.org/b/title/${encodeURIComponent(book.book)}.jpg`}
alt="cover"
className="h-32 mx-auto mb-2"
onError={(e)=>{
e.target.src="https://via.placeholder.com/120x180?text=Book";
}}
/>

<p className="font-semibold text-blue-600">
{book.book}
</p>

<p className="text-sm text-gray-700">
{book.author}
</p>

<p className="text-xs text-gray-500">
{book.difficulty}
</p>

<a
href={`https://www.amazon.in/s?k=${encodeURIComponent(book.book)}`}
target="_blank"
rel="noreferrer"
className="text-blue-600 text-xs"
>
View on Amazon
</a>

</div>

))}

</div>

</div>

))}

</>

)}

</div>

);

}

export default BookFinder;