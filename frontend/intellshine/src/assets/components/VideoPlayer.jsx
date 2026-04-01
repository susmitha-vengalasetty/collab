import React from "react";

const VideoPlayer = ({ videoId }) => {

  if (!videoId) return null;

  return (

    <div className="w-full aspect-video mb-4">

      <iframe
        className="w-full h-full rounded-xl"
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title="YouTube Player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

    </div>

  );

};

export default VideoPlayer;