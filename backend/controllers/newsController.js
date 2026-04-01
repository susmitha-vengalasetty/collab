const axios = require("axios");

exports.getLatestNews = async (req, res) => {
  try {

    const response = await axios.get(
      "https://gnews.io/api/v4/search",
      {
        params: {
          q: "education OR science OR technology OR government OR economy OR space OR policy",
          lang: "en",
          country: "in",
          max: 30,
          apikey: process.env.GNEWS_API_KEY
        }
      }
    );

    const articles = response.data.articles || [];

    const formattedArticles = articles.map((article) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: {
        name: article.source.name
      },
      publishedAt: article.publishedAt,

      // fallback image
      urlToImage:
        article.image ||
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c"
    }));

    res.json({
      success: true,
      articles: formattedArticles.slice(0, 30)
    });

  } catch (error) {

    console.error("GNews Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch news"
    });

  }
};