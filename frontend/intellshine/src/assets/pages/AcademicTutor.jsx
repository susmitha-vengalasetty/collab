import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { marked } from "marked";

const moodOptions = [
  { value: "motivated", label: "Motivated 🚀" },
  { value: "normal", label: "Normal 🙂" },
  { value: "tired", label: "Tired 😴" },
  { value: "stressed", label: "Stressed 😰" }
];

const AcademicTutor = () => {
  const [question, setQuestion] = useState("");
  const [mood, setMood] = useState("normal");
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const controllerRef = useRef(null);

  useEffect(() => {
    fetchDoubts();
  }, []);

  const fetchDoubts = async () => {
    try {
      const { data } = await API.get("/doubts");
      setDoubts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      setError("Please enter your question.");
      return;
    }

    try {
      controllerRef.current = new AbortController();

      setLoading(true);
      setError("");

      const { data } = await API.post(
        "/doubts/ask",
        { question, mood },
        { signal: controllerRef.current.signal }
      );

      setDoubts([data, ...doubts]);
      setQuestion("");

    } catch (err) {
      if (err.name !== "CanceledError") {
        setError("Failed to get explanation.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await API.delete(`/doubts/${id}`);
    setDoubts(doubts.filter((d) => d._id !== id));
  };

  const stopGeneration = () => {
    controllerRef.current?.abort();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pt-24 px-6 transition-colors">
      <div className="max-w-4xl mx-auto">

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            📚 Academic Tutor
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Structured explanations for serious learners.
          </p>
        </div>

        <div className="card p-8 mb-12">

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="input"
            >
              {moodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <textarea
              rows="4"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your academic doubt..."
              className="input"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-secondary"
            >
              {loading ? "Generating..." : "Ask Tutor"}
            </button>

            {loading && (
              <button
                type="button"
                onClick={stopGeneration}
                className="w-full btn btn-ghost text-red-500 dark:text-red-400 text-sm"
              >
                Stop Generation
              </button>
            )}

          </form>
        </div>

        <div className="space-y-6">
          {doubts.map((doubt) => (
            <div
              key={doubt._id}
              className="card p-6"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  Mood: {doubt.moodAtTime}
                </p>

                <button
                  onClick={() => handleDelete(doubt._id)}
                  className="text-xs text-red-500 dark:text-red-400"
                >
                  Delete
                </button>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Q: {doubt.question}
              </h3>

              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: marked(doubt.answer)
                }}
              />

              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                {new Date(doubt.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AcademicTutor;