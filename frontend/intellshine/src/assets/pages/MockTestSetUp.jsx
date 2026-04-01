import { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MockTestContext } from "../context/MockTestContext";

const MockTestSetup = () => {
  const navigate = useNavigate();
  const { setQuestions, setTestInfo } = useContext(MockTestContext);

  const [subject, setSubject] = useState("Physics");
  const [exam, setExam] = useState("JEE");
  const [difficulty, setDifficulty] = useState("easy");

  const generateTest = async () => {
  console.log("Button clicked");

  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:5000/api/mock-test/generate",
      { subject, exam, difficulty, number: 10 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(res.data); // 🔥 check this

    setQuestions(res.data);
    setTestInfo({ subject, exam, difficulty });
    navigate("/mock-test/exam");

  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg p-8 rounded-lg w-full max-w-md">
        <h1 className="text-xl font-semibold text-center mb-6">
          Generate Mock Test
        </h1>

        <div className="space-y-4">
          <select className="w-full border p-2 rounded" onChange={(e) => setSubject(e.target.value)}>
            <option>Physics</option>
            <option>Mathematics</option>
            <option>Chemistry</option>
          </select>

          <select className="w-full border p-2 rounded" onChange={(e) => setExam(e.target.value)}>
            <option>JEE</option>
            <option>NEET</option>
          </select>

          <select className="w-full border p-2 rounded" onChange={(e) => setDifficulty(e.target.value)}>
            <option>easy</option>
            <option>medium</option>
            <option>hard</option>
          </select>

          <button
            onClick={generateTest}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded transition duration-200"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockTestSetup;