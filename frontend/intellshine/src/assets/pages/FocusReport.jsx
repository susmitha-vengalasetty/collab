import React, { useEffect, useState } from "react";
import API from "../services/api";

const FocusReport = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      const res = await API.get("/focus/weekly-report");
      setReport(res.data);
    };

    fetchReport();
  }, []);

  if (!report) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <h2 className="text-2xl font-bold text-[#1E3A8A] mb-6">
        Weekly Focus Report
      </h2>

      <div className="bg-white shadow-xl rounded-2xl p-6 space-y-3 max-w-md">
        <p>Total Sessions: {report.totalSessions}</p>
        <p>Total Minutes: {report.totalMinutes}</p>
        <p>Total Distractions: {report.totalDistractions}</p>
        <p className="font-bold text-[#1E3A8A]">
          Productivity Score: {report.productivityScore}
        </p>
      </div>
    </div>
  );
};

export default FocusReport;