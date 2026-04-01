import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const moodOptions = [
  { value: "motivated", label: "Motivated 🚀" },
  { value: "normal", label: "Normal 🙂" },
  { value: "tired", label: "Tired 😴" },
  { value: "stressed", label: "Stressed 😰" }
];

const CreatePlan = () => {
  const navigate = useNavigate();

  const [mood, setMood] = useState("normal");
  const [hours, setHours] = useState(4);
  const [subjects, setSubjects] = useState([{ name: "", priority: 1 }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addSubject = () => {
    const last = subjects[subjects.length - 1];

    if (!last.name.trim()) {
      setError("Fill current subject before adding another.");
      return;
    }

    setSubjects([...subjects, { name: "", priority: 1 }]);
    setError("");
  };

  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const validate = () => {
    const names = subjects.map((s) => s.name.trim().toLowerCase());
    const priorities = subjects.map((s) => Number(s.priority));

    if (names.some((name) => name === "")) {
      setError("All subject names must be filled.");
      return false;
    }

    if (new Set(names).size !== names.length) {
      setError("Duplicate subject names are not allowed.");
      return false;
    }

    if (new Set(priorities).size !== priorities.length) {
      setError("Duplicate priorities are not allowed.");
      return false;
    }

    if (hours <= 0 || hours > 16) {
      setError("Total study hours must be between 1 and 16.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const response = await API.post("/studyplan", {
        mood,
        totalHoursPerDay: Number(hours),
        subjects
      });

      console.log("Remaining AI calls:", response.data.remainingAiCalls);

      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 429) {
        setError("🚫 Daily AI limit reached. Try again tomorrow after 5:30 AM.");
      } else {
        setError(err.response?.data?.message || "Failed to create plan.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-12 flex justify-center bg-gray-50 min-h-screen">

      <div className="relative w-full max-w-2xl bg-white p-10 rounded-2xl shadow-xl">

        {/* ❌ Close Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Create Study Plan
        </h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Mood
            </label>

            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {moodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Hours */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Total Study Hours Per Day
            </label>

            <input
              type="number"
              min="1"
              max="16"
              value={hours}
              onChange={(e) =>
                setHours(Math.max(1, Number(e.target.value)))
              }
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Subjects & Priority
            </label>

            {subjects.map((sub, index) => (
              <div key={index} className="flex gap-3 mb-3 items-center">

                <input
                  type="text"
                  placeholder="Subject Name"
                  value={sub.name}
                  onChange={(e) =>
                    handleChange(index, "name", e.target.value)
                  }
                  className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="number"
                  min="1"
                  max="10"
                  value={sub.priority}
                  onChange={(e) =>
                    handleChange(index, "priority", e.target.value)
                  }
                  className="w-24 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubject(index)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}

              </div>
            ))}

            <button
              type="button"
              onClick={addSubject}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              + Add Subject
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-medium transition"
          >
            {loading ? "Generating Plan..." : "Generate Study Plan"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreatePlan;