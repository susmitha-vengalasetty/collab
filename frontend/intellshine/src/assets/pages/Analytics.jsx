import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/mock-test/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStats(res.data);
      } catch (err) {
        setError("Failed to load analytics data.");
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="text-center mt-20 text-red-600">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center mt-20 text-gray-600">
        Loading analytics...
      </div>
    );
  }

  if (stats.totalTests === 0) {
    return (
      <div className="text-center mt-20 text-gray-600">
        No tests attempted yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-md p-8 rounded">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Performance Analytics
          </h1>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-3 gap-6 mb-10">

          <div className="bg-indigo-50 p-6 rounded shadow text-center">
            <h2 className="text-sm text-gray-500">Total Tests</h2>
            <p className="text-2xl font-bold text-indigo-700">
              {stats.totalTests}
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded shadow text-center">
            <h2 className="text-sm text-gray-500">Average Score</h2>
            <p className="text-2xl font-bold text-green-700">
              {stats.averageScore}
            </p>
          </div>

          <div className="bg-yellow-50 p-6 rounded shadow text-center">
            <h2 className="text-sm text-gray-500">Highest Score</h2>
            <p className="text-2xl font-bold text-yellow-700">
              {stats.highestScore}
            </p>
          </div>

        </div>

        {/* SUBJECT PERFORMANCE */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Subject-wise Performance
          </h2>

          {stats.subjectStats.length === 0 ? (
            <p className="text-gray-500">No data available.</p>
          ) : (
            <div className="space-y-4">
              {stats.subjectStats.map((sub, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{sub.subject}</span>
                    <span>{sub.percentage}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded"
                      style={{ width: `${sub.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Analytics;