import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";

const ResumeAnalyzer = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    education: "",
    skills: "",
    projects: "",
    experience: "",
    careerGoal: "",
  });

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // FETCH SAVED RESUMES
  const fetchResumes = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/resume/my-resumes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // IMPORTANT FIX
      setResumes(res.data.resumes || res.data);
    } catch (error) {
      console.log("Fetch resumes error:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchResumes();
    }
  }, []);

  // ANALYZE RESUME
  const analyzeResume = async () => {
    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/resume/analyze",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setResult(res.data.result);

      // refresh saved list
      fetchResumes();
    } catch (error) {
      console.log(error);
      toast.error("Error analyzing resume");
    }

    setLoading(false);
  };

  // GENERATE PDF
  const generatePDF = (data = form) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text(data.name || "Resume", 20, 20);

    doc.setFontSize(14);

    doc.text("Education", 20, 40);
    doc.setFontSize(11);
    doc.text(data.education || "-", 20, 48);

    doc.setFontSize(14);
    doc.text("Skills", 20, 65);
    doc.setFontSize(11);
    doc.text(data.skills || "-", 20, 73);

    doc.setFontSize(14);
    doc.text("Projects", 20, 90);
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(data.projects || "-", 170), 20, 98);

    doc.setFontSize(14);
    doc.text("Experience", 20, 130);
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(data.experience || "-", 170), 20, 138);

    doc.setFontSize(14);
    doc.text("Career Goal", 20, 170);
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(data.careerGoal || "-", 170), 20, 178);

    doc.save(`${data.name || "resume"}.pdf`);
  };

  // DELETE RESUME
  const deleteResume = async (id) => {
    if (!window.confirm("Delete this resume?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/resume/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchResumes();
      import("react-hot-toast").then(({ toast }) =>
        toast.success("Resume deleted"),
      );
      setSelectedResume(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl"
      >
        ✕
      </button>

      <h2 className="text-3xl text-blue-700 font-semibold mb-6 text-center">
        AI Resume Analyzer & Builder
      </h2>

      <div className="space-y-4">
        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <input
          name="education"
          placeholder="Education"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <input
          name="skills"
          placeholder="Skills (comma separated)"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          name="projects"
          placeholder="Projects"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          name="experience"
          placeholder="Experience"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          name="careerGoal"
          placeholder="Career Goal"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <div className="flex gap-3">
          <button
            onClick={analyzeResume}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>

          <button
            onClick={() => generatePDF()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Generate Resume PDF
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-6 bg-gray-100 p-5 rounded-lg border max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3 text-blue-700">
            AI Suggestions
          </h3>

          <pre className="whitespace-pre-wrap text-gray-700">{result}</pre>
        </div>
      )}

      {resumes.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-blue-700 mb-4">
            Saved Resume Analyses
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                onClick={() => setSelectedResume(resume)}
                className="p-4 border rounded-lg bg-gray-50 hover:shadow cursor-pointer"
              >
                <h4 className="font-semibold text-gray-900">{resume.name}</h4>

                <p className="text-sm text-gray-500">{resume.education}</p>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(resume.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedResume && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedResume(null)}
              className="absolute top-3 right-4 text-gray-500 text-xl"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              Resume Analysis
            </h3>

            <p>
              <b>Name:</b> {selectedResume.name}
            </p>
            <p>
              <b>Education:</b> {selectedResume.education}
            </p>
            <p>
              <b>Skills:</b> {selectedResume.skills}
            </p>

            <div className="mt-4 bg-gray-100 p-4 rounded">
              <h4 className="font-semibold text-blue-600 mb-2">
                AI Suggestions
              </h4>

              <pre className="whitespace-pre-wrap text-gray-700">
                {selectedResume.aiSuggestions}
              </pre>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => generatePDF(selectedResume)}
                className="bg-green-600 text-white px-5 py-2 rounded"
              >
                Export PDF
              </button>

              <button
                onClick={() => deleteResume(selectedResume._id)}
                className="bg-red-600 text-white px-5 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
