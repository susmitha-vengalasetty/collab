import React, { useState, useEffect } from "react";
import API from "../services/api";

const FocusTime = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [moodBefore, setMoodBefore] = useState("normal");
  const [moodAfter, setMoodAfter] = useState("normal");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let timer;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && isRunning) {
      stopSession();
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const startSession = async () => {
    if (isRunning) return; // ✅ prevent multiple starts

    try {
      const res = await API.post("/focus/start", {
        moodBefore,
      });

      setSessionId(res.data._id);
      setIsRunning(true);
      setCompleted(false);
    } catch (error) {
      console.error(error);
    }
  };

  const stopSession = async () => {
    setIsRunning(false);

    if (!sessionId) return;

    try {
      await API.put(`/focus/end/${sessionId}`, {
        moodAfter,
        distractionCount: distractions,
      });

      setCompleted(true);

      // ✅ Reset state safely
      setSessionId(null);
      setTimeLeft(25 * 60);
      setDistractions(0);
    } catch (error) {
      console.error(error);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formatTime = (num) => (num < 10 ? `0${num}` : num);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md text-center border border-blue-100">
        <h1 className="text-2xl font-bold mb-6 text-[#1E3A8A]">
          Focus Session
        </h1>

        {!isRunning && !completed && (
          <div className="mb-4">
            <label className="block text-sm mb-1">Mood Before</label>
            <select
              value={moodBefore}
              onChange={(e) => setMoodBefore(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="motivated">Motivated</option>
              <option value="normal">Normal</option>
              <option value="tired">Tired</option>
              <option value="stressed">Stressed</option>
            </select>
          </div>
        )}

        <div className="text-6xl font-mono mb-6">
          {formatTime(minutes)}:{formatTime(seconds)}
        </div>

        {!isRunning && !completed && (
          <button
            onClick={startSession}
            className="bg-[#1E3A8A] hover:bg-blue-800 text-white px-6 py-2 rounded-xl"
          >
            Start Focus
          </button>
        )}

        {isRunning && (
          <>
            <button
              onClick={() => setDistractions((prev) => prev + 1)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg mb-3 mt-4"
            >
              I Got Distracted
            </button>

            <p className="text-gray-600">
              Distractions: <span className="font-bold">{distractions}</span>
            </p>
          </>
        )}

        {completed && (
          <>
            <div className="mt-6 text-green-600 font-semibold">
              🎉 Session Completed Successfully!
            </div>

            <button
              onClick={() => setCompleted(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Start New Session
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FocusTime;