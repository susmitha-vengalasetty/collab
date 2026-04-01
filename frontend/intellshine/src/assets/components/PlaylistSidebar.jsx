import React from "react";

const PlaylistSidebar = ({ videos = [], onSelect }) => {

  if (!videos || videos.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500">
          No playlist videos available
        </p>
      </div>
    );
  }

  return (

    <div className="bg-white p-4 rounded shadow max-h-[400px] lg:max-h-[600px] overflow-y-auto">

      <h2 className="font-semibold mb-3">
        Course Chapters
      </h2>

      {videos.map((video, index) => (

        <div
            key={
              video.videoId ||
              video.playlistId ||
              video.id?.videoId ||
              video.id?.playlistId ||
              index
            }
            onClick={() => onSelect(video, true)}
          className="text-sm cursor-pointer py-2 border-b hover:text-blue-600"
        >
          {index + 1}. {video.title}
        </div>

      ))}

    </div>

  );

};

export default PlaylistSidebar;