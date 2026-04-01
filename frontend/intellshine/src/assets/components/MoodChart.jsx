import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = {
  motivated: "#22c55e",
  normal: "#3b82f6",
  tired: "#f59e0b",
  stressed: "#ef4444"
};

const MoodChart = ({ plans }) => {

  const moodCounts = plans.reduce((acc, plan) => {
    acc[plan.mood] = (acc[plan.mood] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(moodCounts).map((mood) => ({
    name: mood.charAt(0).toUpperCase() + mood.slice(1),
    value: moodCounts[mood],
    color: COLORS[mood]
  }));

  if (data.length === 0) {
    return (
      <div className="bg-white border rounded-2xl p-6 shadow-sm text-center">
        <p className="text-gray-500">No mood data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6">

      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Mood Distribution
      </h2>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height={300}>

          <PieChart>

            <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                label
                >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip />
            <Legend />

          </PieChart>

        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default MoodChart;