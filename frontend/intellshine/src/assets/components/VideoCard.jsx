import React from "react";

const VideoCard = ({ video, onClick }) => {
  const thumbnail = video.thumbnail || video.snippet?.thumbnails?.medium?.url;

  const title = video.title || video.snippet?.title || "Untitled Video";

  const channel =
    video.channel || video.snippet?.channelTitle || "Unknown Channel";

  return (
    <div
      onClick={() => onClick(video)}
      className="card cursor-pointer overflow-hidden"
    >
      <img
        src={thumbnail}
        alt={title}
        className="w-full aspect-video object-cover"
      />

      <div className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-gray-100">
          {title}
        </h3>

        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
          {channel}
        </p>
      </div>
    </div>
  );
};

export default VideoCard;
