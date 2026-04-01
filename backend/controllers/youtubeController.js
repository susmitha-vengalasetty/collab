const axios = require("axios");

/* ================= BLOCKED KEYWORDS ================= */

const blockedWords = [
  "shorts","motivation","motivational","status","reels",
  "earn money","rich","success story","mind blowing","shocking","viral",

  /* entertainment */
  "movie","film","trailer","cinema","song","music","remix","dj",

  /* lifestyle */
  "vlog","daily vlog","lifestyle",

  /* beauty */
  "makeup","beauty","skincare","hair","crochet","knitting",

  /* dance */
  "dance","choreography",

  /* cooking */
  "recipe","cooking","kitchen",

  /* gaming */
  "gameplay","gaming",

  /* social media */
  "tiktok","instagram","whatsapp status",

  /* celebrity */
  "alia bhatt","ranveer","bollywood"
];


/* ================= EDUCATIONAL KEYWORDS ================= */

const educationWords = [
  "course","tutorial","lecture","lesson","class",
  "training","explained","learning","study","education",

  "programming","coding","sql","java","python",

  "math","physics","chemistry","biology",

  "engineering","data structures","algorithm",

  "english speaking","grammar","spoken english"
];


/* ================= EDUCATIONAL FILTER ================= */

const isEducational = (title="", channel="", description="") => {

  const text = `${title} ${channel} ${description}`.toLowerCase();

  /* block unwanted topics */
  if (blockedWords.some(word => text.includes(word))) {
    return false;
  }

  /* allow only educational */
  if (educationWords.some(word => text.includes(word))) {
    return true;
  }

  return false;
};



/* ================= SEARCH VIDEOS + PLAYLISTS ================= */

exports.searchVideos = async (req, res) => {

  try {

    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        message: "Query required"
      });
    }

    const lowerQuery = query.toLowerCase();

    /* ===== BLOCKED SEARCH ===== */

    if(blockedWords.some(word => lowerQuery.includes(word))){
      return res.json({
        message:"No educational videos found for this search.",
        videos:[],
        playlists:[]
      });
    }


    /* ===== SEARCH VIDEOS ===== */

    const videoResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params:{
          part:"snippet",
          q:`${query} lecture tutorial course university`,
          type:"video",
          maxResults:20,
          videoEmbeddable:true,
          videoDuration:"medium",
          safeSearch:"strict",
          key:process.env.YOUTUBE_API_KEY
        }
      }
    );


    /* ===== SEARCH PLAYLISTS ===== */

    const playlistResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params:{
          part:"snippet",
          q:`${query} full course lecture playlist`,
          type:"playlist",
          maxResults:10,
          safeSearch:"strict",
          key:process.env.YOUTUBE_API_KEY
        }
      }
    );


    /* ===== FORMAT VIDEOS ===== */

    const videos = videoResponse.data.items
      .map(item => ({
        type:"video",
        videoId:item.id.videoId,
        title:item.snippet.title,
        channel:item.snippet.channelTitle,
        description:item.snippet.description,
        thumbnail:item.snippet.thumbnails.medium.url
      }))
      .filter(v =>
        isEducational(v.title, v.channel, v.description)
      );


    /* ===== FORMAT PLAYLISTS ===== */

    const playlists = playlistResponse.data.items
      .map(item => ({
        type:"playlist",
        playlistId:item.id.playlistId,
        title:item.snippet.title,
        channel:item.snippet.channelTitle,
        description:item.snippet.description,
        thumbnail:item.snippet.thumbnails.medium.url
      }))
      .filter(p =>
        isEducational(p.title, p.channel, p.description)
      );


    /* ===== IF NOTHING EDUCATIONAL ===== */

    if(videos.length === 0 && playlists.length === 0){
      return res.json({
        message:"No educational videos available for this search.",
        videos:[],
        playlists:[]
      });
    }


    res.json({
      videos,
      playlists
    });

  }

  catch(error){

    console.error("YouTube API Error:", error.message);

    res.status(500).json({
      message:"Failed to fetch content"
    });

  }

};



/* ================= FETCH PLAYLIST VIDEOS ================= */

exports.getPlaylistVideos = async (req, res) => {

  try {

    const { playlistId } = req.query;

    if(!playlistId){
      return res.status(400).json({
        message:"playlistId required"
      });
    }

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/playlistItems",
      {
        params:{
          part:"snippet",
          maxResults:50,
          playlistId,
          key:process.env.YOUTUBE_API_KEY
        }
      }
    );


    const videos = response.data.items
      .map(item => ({
        videoId:item.snippet.resourceId.videoId,
        title:item.snippet.title,
        channel:item.snippet.channelTitle,
        description:item.snippet.description,
        thumbnail:item.snippet.thumbnails.medium.url
      }))
      .filter(v =>
        isEducational(v.title, v.channel, v.description)
      );


    if(videos.length === 0){
      return res.json({
        message:"No educational videos available in this playlist.",
        videos:[]
      });
    }


    res.json({ videos });

  }

  catch(error){

    console.error("Playlist Error:", error.message);

    res.status(500).json({
      message:"Failed to fetch playlist"
    });

  }

};