import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

import VideoCard from "../components/VideoCard";
import VideoPlayer from "../components/VideoPlayer";
import PlaylistSidebar from "../components/PlaylistSidebar";
import { useNavigate } from "react-router-dom";

const StudyLibrary = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [summary, setSummary] = useState("");

  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const videoSectionRef = useRef(null);

  /* ================= RESTORE PREVIOUS SEARCH ================= */

  /* ================= SCROLL TO PLAYER ================= */

  useEffect(() => {
    if (selectedVideo && videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedVideo]);

  useEffect(() => {
    if (!selectedVideo) return;

    const savedNotes = JSON.parse(localStorage.getItem("videoNotes")) || {};

    if (savedNotes[selectedVideo.videoId]) {
      setSummary(savedNotes[selectedVideo.videoId]);
    } else {
      setSummary("");
    }
  }, [selectedVideo]);
  useEffect(() => {
    try {
      const savedVideos = localStorage.getItem("studyVideos");
      const savedQuery = localStorage.getItem("studyQuery");

      if (savedVideos) {
        const parsed = JSON.parse(savedVideos);
        setVideos(Array.isArray(parsed) ? parsed : []);
      }

      if (savedQuery) {
        setQuery(savedQuery);
      }
    } catch (error) {
      console.log("LocalStorage restore error:", error);
      setVideos([]);
    }
  }, []);

  /* ================= SEARCH YOUTUBE ================= */

  const searchVideos = async () => {
    if (!query.trim()) return;

    try {
      setLoadingVideos(true);

      const res = await axios.get("http://localhost:5000/api/youtube/search", {
        params: { query },
      });

      const videoResults = Array.isArray(res.data?.videos)
        ? res.data.videos
        : [];

      const playlistResults = Array.isArray(res.data?.playlists)
        ? res.data.playlists
        : [];

      const combinedResults = [...playlistResults, ...videoResults];

      setVideos(combinedResults);

      localStorage.setItem("studyVideos", JSON.stringify(combinedResults));

      localStorage.setItem("studyQuery", query);

      setSelectedVideo(null);
      setPlaylistVideos([]);
      setSummary("");
    } catch (error) {
      console.error("Search Error:", error);
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  /* ================= NORMALIZE VIDEO ================= */

  const normalizeVideo = (video) => {
    return {
      videoId: video.videoId || video.id?.videoId || "",

      playlistId: video.playlistId || video.id?.playlistId || "",

      title: video.title || video.snippet?.title || "Untitled Video",

      thumbnail:
        video.thumbnail ||
        video.snippet?.thumbnails?.high?.url ||
        video.snippet?.thumbnails?.medium?.url ||
        "",

      channel:
        video.channel || video.snippet?.channelTitle || "Unknown Channel",
    };
  };

  /* ================= OPEN VIDEO ================= */

  const openVideo = (video, fromPlaylist = false) => {
    const normalized = {
      ...normalizeVideo(video),
      playlistId: video.playlistId || "",
    };

    if (!fromPlaylist) {
      setPlaylistVideos([]);
    }

    setSelectedVideo(normalized);

    const savedNotes = JSON.parse(localStorage.getItem("videoNotes")) || {};

    setSummary(savedNotes[normalized.videoId] || "");
  };
  /* ================= FETCH PLAYLIST ================= */

  const fetchPlaylistVideos = async (playlistId) => {
    try {
      /* CLEAR OLD PLAYLIST FIRST */

      setPlaylistVideos([]);
      setSelectedVideo(null);
      setSummary("");

      const res = await axios.get(
        "http://localhost:5000/api/youtube/playlist",
        { params: { playlistId } },
      );

      const playlist = Array.isArray(res.data?.videos)
        ? res.data.videos.map((v) => ({
            ...normalizeVideo(v),
            playlistId: playlistId,
          }))
        : [];

      setPlaylistVideos(playlist);

      if (playlist.length > 0) {
        openVideo(playlist[0], true);
      }
    } catch (error) {
      console.log("Playlist Error:", error);

      setPlaylistVideos([]);
    }
  };

  /* ================= GENERATE AI NOTES ================= */

  const generateSummary = async () => {
    if (!selectedVideo || loadingSummary) return;

    /* CHECK IF NOTES ALREADY EXIST */

    const savedNotes = JSON.parse(localStorage.getItem("videoNotes")) || {};

    if (savedNotes[selectedVideo.videoId]) {
      setSummary(savedNotes[selectedVideo.videoId]);
      return;
    }

    try {
      setLoadingSummary(true);

      const res = await axios.post(
        "http://localhost:5000/api/youtube-summary/summary",
        {
          title: selectedVideo.title,
        },
      );

      const notes = res.data?.summary || "No notes generated.";

      setSummary(notes);

      /* SAVE NOTES */

      savedNotes[selectedVideo.videoId] = notes;

      localStorage.setItem("videoNotes", JSON.stringify(savedNotes));
    } catch (error) {
      console.log("Summary Error:", error);
      setSummary("Unable to generate notes.");
    } finally {
      setLoadingSummary(false);
    }
  };

  /* ================= SAVE VIDEO ================= */

  const saveVideo = () => {
    if (!selectedVideo) return;

    const library = JSON.parse(localStorage.getItem("myLibrary")) || [];

    const exists = library.find((v) => v.videoId === selectedVideo.videoId);

    if (exists) {
      import("react-hot-toast").then(({ toast }) =>
        toast("Video already saved"),
      );
      return;
    }

    const videoToSave = {
      videoId: selectedVideo.videoId,
      playlistId: selectedVideo.playlistId || "",
      title: selectedVideo.title,
      thumbnail: selectedVideo.thumbnail,
      channel: selectedVideo.channel,
      summary: summary || "",
    };

    library.push(videoToSave);

    localStorage.setItem("myLibrary", JSON.stringify(library));

    import("react-hot-toast").then(({ toast }) =>
      toast.success("Saved to My Study Library"),
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold">Study Library</h1>

        <button
          onClick={() => navigate("/my-library")}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          My Library
        </button>
      </div>

      {/* SEARCH */}

      <div className="flex max-w-2xl mx-auto mb-10 shadow">
        <input
          type="text"
          placeholder="Search topic..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchVideos();
            }
          }}
          className="flex-1 px-4 py-3 border rounded-l-lg"
        />

        <button
          onClick={searchVideos}
          className="bg-blue-600 text-white px-6 rounded-r-lg"
        >
          Search
        </button>
      </div>

      {/* VIDEO PLAYER */}

      {selectedVideo && (
        <div
          ref={videoSectionRef}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12"
        >
          <PlaylistSidebar videos={playlistVideos} onSelect={openVideo} />

          <div className="lg:col-span-3">
            <VideoPlayer
              key={selectedVideo.videoId}
              videoId={selectedVideo.videoId}
            />

            <h2 className="text-xl font-semibold mt-4">
              {selectedVideo.title}
            </h2>

            <p className="text-gray-500 text-sm">{selectedVideo.channel}</p>

            <div className="flex gap-4 mt-4">
              <button
                onClick={generateSummary}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {loadingSummary
                  ? "Generating..."
                  : summary
                  ? "Refresh Notes"
                  : "Generate AI Notes"}
              </button>

              <button
                onClick={saveVideo}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save to My Library
              </button>
            </div>

            {summary && (
              <div className="bg-white p-5 mt-5 rounded-xl shadow max-h-[300px] overflow-y-auto">
                <h2 className="font-semibold text-lg mb-3">AI Study Notes</h2>

                <p className="text-sm whitespace-pre-line">{summary}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIDEO GRID */}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {videos.map((video, index) => (
          <VideoCard
            key={
              video.videoId ||
              video.playlistId ||
              video.id?.videoId ||
              video.id?.playlistId ||
              index
            }
            video={video}
            onClick={(video) => {
              const playlistId = video.playlistId || video.id?.playlistId;

              const videoId = video.videoId || video.id?.videoId;

              if (playlistId) {
                fetchPlaylistVideos(playlistId);
              } else if (videoId) {
                setPlaylistVideos([]);

                openVideo(video);
              }
            }}
          />
        ))}
      </div>

      {/* EMPTY STATE */}

      {loadingVideos && (
        <div className="flex justify-center mt-10">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></span>
        </div>
      )}

      {videos.length === 0 && !loadingVideos && (
        <p className="text-center text-gray-500 mt-10">
          No videos found. Try another topic.
        </p>
      )}
    </div>
  );
};

export default StudyLibrary;
