import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MockTestContext } from "../context/MockTestContext";

const MockTestExam = () => {
  const navigate = useNavigate();
  const { questions, answers, setAnswers, testInfo, setResult } =
    useContext(MockTestContext);

  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [bookmarked, setBookmarked] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ================= TIMER =================
  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          submitTest();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSelect = (option) => {
    setAnswers({ ...answers, [questions[current]._id]: option });
  };

  const toggleBookmark = () => {
    const id = questions[current]._id;
    if (bookmarked.includes(id)) {
      setBookmarked(bookmarked.filter((q) => q !== id));
    } else {
      setBookmarked([...bookmarked, id]);
    }
  };

  // ================= SUBMIT =================
  const submitTest = async () => {
    if (submitted || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const formattedAnswers = questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: answers[q._id],
      }));

      const res = await axios.post(
        "http://localhost:5000/api/mock-test/submit",
        { ...testInfo, answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitted(true);
      setResult(res.data);
      navigate("/mock-test/result");
    } catch (err) {
      console.error(err);
      setError("Failed to submit test. Please try again.");
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  if (!questions.length) {
    return <p className="text-center mt-10">Loading questions...</p>;
  }

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;
  const notAnsweredCount = questions.length - answeredCount;

  return (
    <div className="bg-gray-100 py-10 min-h-[calc(100vh-80px)]">
      <div className="max-w-5xl mx-auto bg-white shadow-md p-8 rounded">

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">
              Question {current + 1} of {questions.length}
            </h2>
            <p className="text-sm text-gray-500">
              Answered: {answeredCount} | Not Answered: {notAnsweredCount}
            </p>
          </div>

          <div
            className={`text-lg font-bold px-4 py-2 rounded ${
              timeLeft < 60 ? "bg-red-100 text-red-600" : "bg-gray-100"
            }`}
          >
            ⏱ {formatTime()}
          </div>
        </div>

        {/* QUESTION */}
        <p className="mb-6 font-medium">{q.question}</p>

        {/* OPTIONS */}
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <label
              key={i}
              className="block border p-3 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name={q._id}
                checked={answers[q._id] === opt}
                onChange={() => handleSelect(opt)}
                className="mr-2"
                disabled={submitting}
              />
              {opt}
            </label>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="flex justify-between mt-6">
          <button
            disabled={current === 0 || submitting}
            onClick={() => setCurrent(current - 1)}
            className="bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex gap-3">
            <button
              onClick={toggleBookmark}
              disabled={submitting}
              className="px-4 py-2 rounded border disabled:opacity-50"
            >
              ⭐ {bookmarked.includes(q._id) ? "Bookmarked" : "Bookmark"}
            </button>

            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent(current + 1)}
                disabled={submitting}
                className="bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Submit Test
              </button>
            )}
          </div>
        </div>

        {/* QUESTION STATUS PANEL */}
        <div className="mt-10 border-t pt-6">
          <h3 className="font-semibold mb-4">Question Status</h3>
          <div className="grid grid-cols-5 gap-3 text-sm">
            {questions.map((question, index) => {
              const isAnswered = answers[question._id];
              const isBookmarked = bookmarked.includes(question._id);

              return (
                <div
                  key={question._id}
                  onClick={() => setCurrent(index)}
                  className={`p-2 rounded text-center cursor-pointer border ${
                    isBookmarked
                      ? "bg-yellow-100 border-yellow-400"
                      : isAnswered
                      ? "bg-green-100 border-green-400"
                      : "bg-red-100 border-red-400"
                  }`}
                >
                  Q{index + 1}
                  <div className="text-xs mt-1">
                    {isBookmarked
                      ? "Bookmarked"
                      : isAnswered
                      ? "Answered"
                      : "Not Answered"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">

            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Submission
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to submit the test?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>

              <button
                onClick={submitTest}
                disabled={submitting}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                {submitting ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MockTestExam;