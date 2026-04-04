import React, { useState, useEffect } from "react";
import axios from "axios";

const StudyDiary = () => {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [history, setHistory] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/diary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHistory(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const analyzeDiary = async () => {
    if (!text.trim()) {
      alert("Please write today's reflection");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/diary/analyze",
        { text },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setAnalysis(res.data.analysis);
      setText("");
      fetchHistory();
    } catch (err) {
      console.log(err);
      alert("Error analyzing diary");
    }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm("Delete this diary entry?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/diary/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchHistory();
    } catch (err) {
      console.log(err);
    }
  };

  /* Highlight keywords */

  const formatAnalysis = (text) => {
    if (!text) return "";

    return text
      .replace(
        /Mood:/g,
        "<span class='font-semibold text-indigo-600'>Mood:</span>",
      )
      .replace(
        /Study Motivation:/g,
        "<span class='font-semibold text-green-600'>Study Motivation:</span>",
      )
      .replace(
        /Productivity Level:/g,
        "<span class='font-semibold text-orange-600'>Productivity Level:</span>",
      )
      .replace(
        /Advice:/g,
        "<span class='font-semibold text-purple-600'>Advice:</span>",
      )
      .replace(
        /Actionable Tip:/g,
        "<span class='font-semibold text-red-600'>Actionable Tip:</span>",
      );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Study Reflection Diary
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
            Reflect on your day, then get focused, actionable feedback.
          </p>
        </div>

        {/* WRITE SECTION */}
        <div className="card p-6 sm:p-8 mb-10">
          <h2 className="section-title mb-4">Today's Reflection</h2>
          <textarea
            className="input notebook h-48 sm:h-56 resize-y"
            rows="8"
            placeholder="Example: Today I practiced recursion; the base case made sense after I drew the call stack..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{text.length}/2000 characters</span>
            <button onClick={analyzeDiary} className="btn btn-secondary">
              Analyze Study Reflection
            </button>
          </div>
        </div>

        {/* AI FEEDBACK */}
        {analysis && (
          <div className="card p-6 mb-10 max-w-4xl mx-auto border border-indigo-200 dark:border-indigo-900/40">
            <h2 className="section-title mb-3 text-indigo-700 dark:text-indigo-400">
              AI Study Feedback
            </h2>
            <p
              className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatAnalysis(analysis) }}
            />
          </div>
        )}

        {/* HISTORY */}
        <h2 className="section-title text-center mb-4">Previous Reflections</h2>

        {history.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            No reflections yet. Start writing your first diary.
          </p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((entry) => (
            <div
              key={entry._id}
              className="card p-5 hover:-translate-y-[1px] transition-transform"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="badge">
                  {entry.day} • {entry.date}
                </span>
                <button
                  onClick={() => deleteEntry(entry._id)}
                  className="btn btn-ghost text-red-500 dark:text-red-400 text-xs"
                >
                  Delete
                </button>
              </div>

              <p className="text-sm sm:text-base mb-3 text-gray-700 dark:text-gray-300">
                {entry.text}
              </p>

              <div
                className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm whitespace-pre-line leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatAnalysis(entry.analysis),
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyDiary;
