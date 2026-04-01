import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MockTestContext } from "../context/MockTestContext";

const MockTestResult = () => {
  const { result } = useContext(MockTestContext);
  const navigate = useNavigate();

  if (!result) return null;

  const percentage = result.percentage;

  // ================= PERFORMANCE REMARK =================
  let remark = "";
  let remarkColor = "";

  if (percentage >= 90) {
    remark = "Excellent Performance 🎯";
    remarkColor = "text-green-600";
  } else if (percentage >= 70) {
    remark = "Good Performance 👍";
    remarkColor = "text-blue-600";
  } else if (percentage >= 50) {
    remark = "Average Performance ⚖️";
    remarkColor = "text-yellow-600";
  } else {
    remark = "Needs Improvement 📘";
    remarkColor = "text-red-600";
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md p-8 rounded">

        <h1 className="text-xl font-semibold mb-6">
          Test Result
        </h1>

        {/* SUMMARY BOX */}
        <div className="bg-gray-50 border rounded-lg p-6 mb-8">
          <p className="text-lg font-medium">
            Score: {result.score} / {result.total}
          </p>

          <p className="text-md mt-2">
            Percentage: {percentage}%
          </p>

          <p className={`mt-3 font-semibold ${remarkColor}`}>
            {remark}
          </p>
        </div>

        {/* DETAILED RESULTS */}
        <div className="space-y-6">
          {result.details?.map((item, index) => (
            <div
              key={index}
              className={`border p-4 rounded ${
                item.isCorrect ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <p className="font-semibold mb-2">
                Q{index + 1}. {item.question}
              </p>

              <p>
                <strong>Your Answer:</strong>{" "}
                <span className={item.isCorrect ? "text-green-600" : "text-red-600"}>
                  {item.selectedAnswer || "Not Answered"}
                </span>
              </p>

              {!item.isCorrect && (
                <p>
                  <strong>Correct Answer:</strong>{" "}
                  <span className="text-green-600">
                    {item.correctAnswer}
                  </span>
                </p>
              )}

              {item.explanation && (
                <p className="mt-2 text-gray-600">
                  <strong>Explanation:</strong> {item.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate("/mock-test")}
            className="bg-indigo-700 text-white px-6 py-2 rounded"
          >
            Take Another Mock
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-700 text-white px-6 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default MockTestResult;