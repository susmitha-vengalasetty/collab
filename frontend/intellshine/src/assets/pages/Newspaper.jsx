import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Newspaper = () => {

  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/news/latest"
      );

      setArticles(res.data.articles || []);
      setLoading(false);

    } catch (error) {

      console.error("News fetch error:", error);
      setLoading(false);

    }

  };

  /* ---------------- LOADING ---------------- */

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading Latest News...
      </div>
    );

  }

  /* ---------------- NO NEWS ---------------- */

  if (!articles.length) {

    return (
      <div className="min-h-screen flex flex-col items-center justify-center">

        <h2 className="text-2xl font-semibold mb-4">
          No News Available
        </h2>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>

      </div>
    );

  }

  const mainArticle = articles[0];
  const otherArticles = articles.slice(1);

  const fallbackImage =
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c";

  return (

    <div className="min-h-screen bg-gray-50 px-6 py-10 overflow-y-auto">

      {/* HEADER */}

      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">

        <h1 className="text-4xl font-bold text-blue-700 flex items-center gap-2">
          Daily Current Affairs
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="text-red-600 text-3xl font-bold hover:scale-110 transition"
        >
          ✕
        </button>

      </div>


      {/* MAIN ARTICLE */}

      <div className="max-w-7xl mx-auto mb-12 bg-white rounded-xl shadow-lg overflow-hidden">

        <img
          src={mainArticle.urlToImage}
          alt="headline"
          className="w-full h-[380px] object-cover"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />

        <div className="p-6">

          <h2 className="text-2xl font-bold mb-4">
            {mainArticle.title}
          </h2>

          <p className="text-gray-700 mb-4">
            {mainArticle.description}
          </p>

          <div className="flex justify-between text-sm text-gray-500 mb-3">

            <span>
              {mainArticle.source?.name || "News Source"}
            </span>

            <span>
              {mainArticle.publishedAt
                ? new Date(mainArticle.publishedAt).toLocaleDateString()
                : ""}
            </span>

          </div>

          <a
            href={mainArticle.url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 font-semibold hover:underline"
          >
            Read Full Article →
          </a>

        </div>

      </div>


      {/* OTHER ARTICLES */}

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">

        {otherArticles.map((article, index) => (

          <div
            key={index}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col h-full"
            >

            <img
              src={article.urlToImage}
              alt="news"
              className="h-48 w-full object-cover bg-gray-200"
              onError={(e) => {
                e.target.src = fallbackImage;
              }}
            />

            <div className="p-5 flex flex-col flex-grow">

              <h3 className="font-semibold text-lg mb-3 line-clamp-2">
                {article.title}
              </h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {article.description}
                </p>

              <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">

                <span>
                  {article.source?.name || "News"}
                </span>

                <span>
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString()
                    : ""}
                </span>

              </div>

              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 text-blue-600 font-medium hover:underline"
              >
                Read →
              </a>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default Newspaper;