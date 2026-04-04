import { useEffect, useState } from "react";
import API from "../services/api";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import MoodChart from "../components/MoodChart";

const Dashboard = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testStats, setTestStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [welcomeLoading, setWelcomeLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const greeting = getGreeting();
  const [user] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  // ================= Fetch Plans =================
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setWelcomeLoading(false);
    }, 2500);

    const fetchPlans = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/studyplan");
        setPlans(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load your study plans.");
      } finally {
        setLoading(false);
      }
    };

    const fetchTestStats = async () => {
      try {
        setStatsLoading(true);
        const { data } = await API.get("/mock-test/stats");
        setTestStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchTestStats();
    fetchPlans();
    return () => clearTimeout(welcomeTimer);
  }, []);

  const selectPlan = async (planId) => {
    try {
      await API.put(`/studyplan/set-active/${planId}`);

      const { data } = await API.get("/studyplan");
      setPlans(data);
    } catch (error) {
      console.log(error);
    }
  };

  const assignPlanToDay = async (planId, day) => {
    if (!day) return;

    try {
      await API.put("/studyplan/assign-day", {
        planId,
        day,
      });

      alert(`Plan assigned to ${day}`);

      const { data } = await API.get("/studyplan");
      setPlans(data);
    } catch (error) {
      console.log(error);
    }
  };

  const assignWholeWeek = async (planId) => {
    try {
      await API.put("/studyplan/assign-week", { planId });

      alert("Plan assigned for whole week");

      const { data } = await API.get("/studyplan");
      setPlans(data);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= Delete Plan =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      await API.delete(`/studyplan/${id}`);
      setPlans(plans.filter((plan) => plan._id !== id));
      setSelectedPlan(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete plan.");
    }
  };

  // ================= Export PDF =================
  const exportToPDF = (plan) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("IntelliShine - AI Study Plan", 20, 20);

    doc.setFontSize(12);
    doc.text(`Mood: ${plan.mood}`, 20, 35);
    doc.text(`Total Hours Per Day: ${plan.totalHoursPerDay}`, 20, 45);

    let y = 60;
    doc.text("Subjects Allocation:", 20, y);
    y += 10;

    plan.subjects.forEach((sub) => {
      doc.text(`${sub.name} - ${sub.hours}h ${sub.minutes}m`, 25, y);
      y += 8;
    });

    y += 10;
    doc.text("Generated Schedule:", 20, y);
    y += 10;

    const lines = doc.splitTextToSize(plan.generatedPlan, 170);
    doc.text(lines, 20, y);

    doc.save("AI_Study_Plan.pdf");
  };

  // ================= Analytics Calculations =================
  const maxDailyHours =
    plans.length > 0 ? Math.max(...plans.map((p) => p.totalHoursPerDay)) : 0;
  const totalSubjects = plans.reduce(
    (acc, p) => acc + (p.subjects?.length || 0),
    0,
  );
  const moodStats =
    plans.length > 0
      ? Object.entries(
          plans.reduce((acc, p) => {
            acc[p.mood] = (acc[p.mood] || 0) + 1;
            return acc;
          }, {}),
        ).sort((a, b) => b[1] - a[1])[0][0]
      : "-";

  // ===== AI Study Insights Calculations =====

  let weeklyHours = 0;

  plans.forEach((plan) => {
    const assignedDays = Object.values(plan.weeklyAssignments || {}).filter(
      Boolean,
    );

    weeklyHours += assignedDays.length * plan.totalHoursPerDay;
  });

  // most productive mood
  const productiveMood = moodStats;

  // most studied subject
  const subjectCount = {};

  plans.forEach((plan) => {
    plan.subjects?.forEach((sub) => {
      subjectCount[sub.name] =
        (subjectCount[sub.name] || 0) + sub.hours + sub.minutes / 60;
    });
  });

  const mostStudiedSubject =
    Object.keys(subjectCount).length > 0
      ? Object.entries(subjectCount).sort((a, b) => b[1] - a[1])[0][0]
      : "None";

  if (welcomeLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Preparing your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 pt-28 pb-16 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            {greeting}, {user?.name} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your smart hub for plans, progress, and AI guidance.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* LEFT SIDE */}
          <div className="card p-6 w-full lg:w-1/2">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              Video Learning Library
            </h2>

            <p className="text-gray-600 mb-4">
              Search structured learning videos without distractions.
            </p>

            <button
              onClick={() => navigate("/youtube")}
              className="btn btn-primary"
            >
              Open Library
            </button>
          </div>

          {/* RIGHT SIDE BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 lg:items-center">
            <button
              onClick={() => navigate("/academic-tutor")}
              className="btn btn-primary"
            >
              Academic Tutor
            </button>

            <button
              onClick={() => navigate("/create")}
              className="btn btn-secondary"
            >
              + Create New Plan
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        {/* ===== User Study Plans ===== */}
        {!loading && plans.length === 0 && (
          <div className="text-center mt-20 card p-10">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              No Study Plans Yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start by creating your first AI-powered study plan.
            </p>
            <button
              onClick={() => navigate("/create")}
              className="btn btn-secondary"
            >
              Create Study Plan
            </button>
          </div>
        )}
        <div className="mt-12 mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title text-blue-600">Your Study Plans</h2>
            <p className="section-subtle mt-1">
              Quickly assign plans to days or the entire week.
            </p>
          </div>
          {plans.length > 0 && (
            <button
              onClick={() => navigate("/create")}
              className="btn btn-ghost"
            >
              + New Plan
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan._id}
              onClick={() => setSelectedPlan(plan)}
              className="card p-6 transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-2xl mb-4"></div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Study Plan
                  </h2>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                    Mood: {plan.mood}
                  </p>
                </div>

                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-600 dark:text-gray-200">
                  {plan.totalHoursPerDay} hrs/day
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {plan.subjects?.slice(0, 3).map((sub, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{sub.name}</span>
                    <span>
                      {sub.hours}h {sub.minutes}m
                    </span>
                  </div>
                ))}
              </div>
              {/* SELECT PLAN BUTTON */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    assignWholeWeek(plan._id);
                  }}
                  className="w-full btn btn-primary text-sm"
                >
                  Use this plan for whole week
                </button>

                <select
                  className="input text-sm w-full"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    assignPlanToDay(plan._id, e.target.value);
                    e.target.value = "";
                  }}
                >
                  <option value="">Assign to Day</option>
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>

              {plan.weeklyAssignments && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Assigned Days:{" "}
                  {Object.entries(plan.weeklyAssignments)
                    .filter(([_, v]) => v !== null)
                    .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
                    .join(", ") || "None"}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="card w-full max-w-4xl p-10 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedPlan(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 text-xl"
              >
                ✕
              </button>

              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Daily Study Schedule
                </h2>
                <p className="text-sm text-indigo-600 font-medium mt-2">
                  Mood Selected: {selectedPlan.mood}
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                {selectedPlan.generatedPlan
                  .split("\n")
                  .filter((line) => line.includes("|"))
                  .map((line, index) => {
                    const [time, subject] = line.split("|");
                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center px-6 py-4 hover:bg-indigo-50 transition-all duration-200"
                      >
                        <span className="text-gray-500 text-sm">
                          {time.trim()}
                        </span>
                        <span className="font-medium text-gray-900">
                          {subject.trim()}
                        </span>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-10 flex justify-center gap-4">
                <button
                  onClick={() => exportToPDF(selectedPlan)}
                  className="btn btn-ghost"
                >
                  Export PDF
                </button>

                <button
                  onClick={() => handleDelete(selectedPlan._id)}
                  className="btn btn-danger"
                >
                  Delete Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Analytics Overview ===== */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <div className="card p-6">
            <p className="text-sm text-gray-500">Total Plans</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-2">
              {plans.length}
            </h3>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-500">Total Study Hours</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-2">
              {weeklyHours} hrs
            </h3>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-500">Most Selected Mood</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-2">
              {moodStats}
            </h3>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-500">Total Subjects Covered</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-2">
              {totalSubjects}
            </h3>
          </div>
        </div>

        {/* ===== AI Study Insights ===== */}

        <div className="mt-10 card p-6">
          <h2 className="section-title mb-4">AI Study Insights</h2>

          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              This week you studied
              <span className="font-semibold"> {weeklyHours} hours</span>.
            </li>

            <li>
              🔥Your most productive mood was
              <span className="font-semibold"> {productiveMood}</span>.
            </li>

            <li>
              You focused the most on
              <span className="font-semibold"> {mostStudiedSubject}</span>.
            </li>
          </ul>
        </div>

        {/* Mood Analytics */}

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">
            Mood Insights
          </h2>

          <div className="card p-6 min-h-[320px]">
            <MoodChart plans={plans} />
          </div>
        </div>

        {/* ===== Mock Test Analytics ===== */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">
            Mock Test Performance
          </h2>

          {statsLoading && (
            <p className="text-gray-500">Loading performance data...</p>
          )}

          {testStats && testStats.totalTests === 0 && (
            <div className="card p-8 text-center">
              <p className="text-gray-600">
                You haven't attempted any mock tests yet.
              </p>
              <button
                onClick={() => navigate("/mock-test")}
                className="mt-4 btn btn-primary"
              >
                Start Mock Test
              </button>
            </div>
          )}

          {testStats && testStats.totalTests > 0 && (
            <>
              {/* ✅ FIXED: Button moved outside grid */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => navigate("/analytics")}
                  className="btn btn-secondary"
                >
                  View Detailed Analytics →
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-10">
                <div className="card p-6">
                  <p className="text-sm text-gray-500">Total Tests Attempted</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {testStats.totalTests}
                  </h3>
                </div>

                <div className="card p-6">
                  <p className="text-sm text-gray-500">Average Score</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {testStats.averageScore}
                  </h3>
                </div>

                <div className="card p-6">
                  <p className="text-sm text-gray-500">Highest Score</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {testStats.highestScore}
                  </h3>
                </div>
              </div>

              {/* Subject Performance */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Subject-wise Performance
                </h3>

                {testStats.subjectStats.map((sub, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{sub.subject}</span>
                      <span>{sub.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${sub.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* EVERYTHING BELOW THIS REMAINS EXACTLY SAME AS YOUR ORIGINAL */}

        {loading && (
          <div className="grid md:grid-cols-3 gap-8 mt-16 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-center text-red-500 mt-10">{error}</p>}
      </div>
    </div>
  );
};

export default Dashboard;
