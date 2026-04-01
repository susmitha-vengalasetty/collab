import React from "react";

const VideoCard = ({ video, onClick }) => {

  const thumbnail =
    video.thumbnail ||
    video.snippet?.thumbnails?.medium?.url;

  const title =
    video.title ||
    video.snippet?.title ||
    "Untitled Video";

  const channel =
    video.channel ||
    video.snippet?.channelTitle ||
    "Unknown Channel";

  return (

    <div
      onClick={() => onClick(video)}
      className="bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition overflow-hidden"
    >

      <img
        src={thumbnail}
        alt={title}
        className="w-full aspect-video object-cover"
      />

      <div className="p-4">

        <h3 className="font-semibold text-sm line-clamp-2">
          {title}
        </h3>

        <p className="text-gray-500 text-xs mt-1">
          {channel}
        </p>

      </div>

    </div>

  );

};

export default VideoCard;