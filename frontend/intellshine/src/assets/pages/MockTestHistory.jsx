import { useEffect, useState } from "react";
import axios from "axios";

const MockTestHistory = () => {
  const [tests, setTests] = useState([]);
  const token = localStorage.getItem("token");

  const primaryBtn =
    "bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-1 rounded transition duration-200";

  const fetchHistory = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/mock-test/history",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setTests(res.data);
  };

  const deleteTest = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/mock-test/history/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchHistory();
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-md p-8 rounded">

        <h1 className="text-xl font-semibold mb-6">
          Mock Test History
        </h1>

        {tests.length === 0 ? (
          <p>No tests attempted yet.</p>
        ) : (
          tests.map((test) => (
            <div
              key={test._id}
              className="border p-4 mb-4 rounded flex justify-between items-center"
            >
              <div>
                <p><strong>Subject:</strong> {test.subject}</p>
                <p><strong>Exam:</strong> {test.exam}</p>
                <p><strong>Score:</strong> {test.score} / {test.total}</p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(test.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => deleteTest(test._id)}
                className={primaryBtn}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MockTestHistory;