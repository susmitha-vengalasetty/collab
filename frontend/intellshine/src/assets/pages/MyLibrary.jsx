import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import VideoPlayer from "../components/VideoPlayer.jsx";
import PlaylistSidebar from "../components/PlaylistSidebar.jsx";

const MyLibrary = () => {

  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState([]);

  const videoSectionRef = useRef(null);

  /* ================= SCROLL TO PLAYER ================= */

  useEffect(() => {

    if (selectedVideo && videoSectionRef.current) {

      videoSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }

  }, [selectedVideo]);

  /* ================= NORMALIZE VIDEO ================= */

  const normalizeVideo = (video) => {

    if (!video) return null;

    return {
      videoId: video.videoId || video?.id?.videoId || "",
      playlistId: video.playlistId || video?.id?.playlistId || "",
      title: video.title || video?.snippet?.title || "Untitled Video",
      thumbnail:
        video.thumbnail ||
        video?.snippet?.thumbnails?.medium?.url ||
        "https://via.placeholder.com/320x180",
      channel:
        video.channel ||
        video?.snippet?.channelTitle ||
        "Unknown Channel"
    };

  };

  /* ================= LOAD LIBRARY ================= */

  useEffect(() => {

    try {

      const storedLibrary = JSON.parse(
        localStorage.getItem("myLibrary") || "[]"
      );

      const normalizedVideos = storedLibrary
        .map((video) => normalizeVideo(video))
        .filter(Boolean);

      setVideos(normalizedVideos);

      console.log("Loaded Library:", normalizedVideos);

    } catch (error) {

      console.log("Library Load Error:", error);
      setVideos([]);

    }

  }, []);

  /* ================= REMOVE VIDEO ================= */

  const removeVideo = (index) => {

    const updatedVideos = [...videos];

    updatedVideos.splice(index, 1);

    setVideos(updatedVideos);

    localStorage.setItem(
      "myLibrary",
      JSON.stringify(updatedVideos)
    );

  };

  /* ================= OPEN VIDEO ================= */

  const openVideo = (video, fromPlaylist = false) => {

    const normalized = normalizeVideo(video);

    if (!normalized) return;

    setSelectedVideo(normalized);

    if (!fromPlaylist) {

      setPlaylistVideos([]);

    }

  };

  /* ================= LOAD PLAYLIST ================= */

  const loadPlaylist = async (playlistId) => {

    if (!playlistId) return;

    try {

      setPlaylistVideos([]);
      setSelectedVideo(null);

      const response = await axios.get(
        "http://localhost:5000/api/youtube/playlist",
        {
          params: { playlistId }
        }
      );

      console.log("Playlist API Response:", response.data);

        const playlist = Array.isArray(response.data?.videos)
        ? response.data.videos.map((v) => ({
            ...normalizeVideo(v),
            playlistId: playlistId
          }))
        : [];

      setPlaylistVideos(playlist);

      if (playlist.length > 0) {

        openVideo(playlist[0], true);

      }

    } catch (error) {

      console.log("Playlist Load Error:", error);

    }

  };

  /* ================= UI ================= */

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}

      <div className="flex justify-between items-center max-w-6xl mx-auto mb-8">

        <h1 className="text-3xl font-bold">
          My Study Library
        </h1>

        <button
          onClick={() => navigate("/youtube")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Study Library
        </button>

      </div>

      {/* VIDEO PLAYER SECTION */}

      {selectedVideo && (

        <div
          ref={videoSectionRef}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12"
        >

          <PlaylistSidebar
            videos={playlistVideos}
            onSelect={openVideo}
          />

          <div className="lg:col-span-3">

            <VideoPlayer
              key={selectedVideo.videoId}
              videoId={selectedVideo.videoId}
            />

            <h2 className="text-xl font-semibold mt-4">
              {selectedVideo.title}
            </h2>

            <p className="text-gray-500 text-sm">
              {selectedVideo.channel}
            </p>

          </div>

        </div>

      )}

      {/* LIBRARY GRID */}

      {videos.length > 0 ? (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

          {videos.map((video, index) => (

            <div
              key={index}
              onClick={() => {

                if (video.playlistId && video.playlistId.trim() !== "") {
                  loadPlaylist(video.playlistId);
                } else {
                  openVideo(video);
                }

              }}
              className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
            >

              <img
                src={video.thumbnail}
                alt={video.title}
                className="rounded mb-3"
              />

              <h3 className="text-sm font-medium line-clamp-2">
                {video.title}
              </h3>

              <button
                onClick={(e) => {

                  e.stopPropagation();
                  removeVideo(index);

                }}
                className="mt-3 text-red-500 text-xs"
              >
                Remove
              </button>

            </div>

          ))}

        </div>

      ) : (

        <div className="text-center mt-20 text-gray-500">

          <p className="text-lg">
            Your study library is empty
          </p>

          <p className="text-sm mt-2">
            Save videos or playlists from Study Library
          </p>

        </div>

      )}

    </div>

  );

};

export default MyLibrary;