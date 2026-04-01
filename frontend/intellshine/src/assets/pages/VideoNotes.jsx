import React, { useState, useEffect } from "react";
import axios from "axios";

const VideoNotes = ({ title, videoId }) => {

  const [summary, setSummary] = useState("");

  // Load notes if already generated
  useEffect(() => {

    const fetchNotes = async () => {

      try {

        const res = await axios.get(
          `http://localhost:5000/api/ai/notes/${videoId}`
        );

        if (res.data.notes) {
          setSummary(res.data.notes);
        }

      } catch (error) {
        console.log("No notes found");
      }

    };

    fetchNotes();

  }, [videoId]);



  const getSummary = async () => {

    const res = await axios.post(
      "http://localhost:5000/api/ai/summary",
      {
        title,
        videoId
      }
    );

    setSummary(res.data.summary);

  };



  return (

    <div className="bg-white shadow p-4 mt-4">

      {!summary && (
        <button
          onClick={getSummary}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Generate AI Notes
        </button>
      )}

      <p className="mt-4 text-sm whitespace-pre-line">
        {summary}
      </p>

    </div>

  );

};

export default VideoNotes;