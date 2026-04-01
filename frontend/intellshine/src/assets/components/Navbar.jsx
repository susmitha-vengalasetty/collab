import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import Dropdown from "./Dropdown";
import logo from "../../assets/images/IntellShine_Brain_Logo.jpeg";

const Navbar = ({ setChatOpen }) => {
  const { userToken, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoOpen, setLogoOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Prevent scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  const learningItems = [
    { label: "Create Plan", path: "/create" },
    { label: "Book Referencing", path: "/books" },
    { label: "Mock Tests", path: "/mock-test" },
    { label: "Mock Test History", path: "/mock-test/history" },
    { label: "Ask AI", action: () => setChatOpen(true) }
  ];

  const growthItems = [
  { label: "AI Resume Analyzer", path: "/resume-analyzer" },
  { label: "Study Diary", path: "/study-diary" },
  { label: "Current Affairs", path: "/newspaper" }
];

  const resourceItems = [
    { label: "YouTube Library", path: "/youtube" }
  ];

  const profileItems = [
    { label: "My Profile", path: "/profile" },
    { label: "Focus Time", path: "/focus-time" }
  ];

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* ===== Logo Section ===== */}
          <div className="flex items-center space-x-3">

            <img
              src={logo}
              alt="logo"
              className="w-10 h-10 cursor-pointer hover:scale-110 transition"
              onClick={() => setLogoOpen(true)}
            />

            <Link
              to="/"
              className="text-2xl font-bold text-blue-700 tracking-wide"
            >
              IntelliShine
            </Link>

          </div>

          {/* ===== Desktop Menu ===== */}
          <div className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">

            {!userToken ? (
              <>
                <Link
                  to="/"
                  className="text-blue-700 font-semibold hover:underline"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="hover:text-blue-600">
                  Dashboard
                </Link>

                <Dropdown title="Learning" items={learningItems} />
                <Dropdown title="Growth" items={growthItems} />
                <Dropdown title="Resources" items={resourceItems} />
                <Dropdown title="Profile" items={profileItems} />

                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            )}

          </div>

          {/* ===== Mobile Menu Button ===== */}
          {userToken && (
            <button
              className="md:hidden text-2xl text-blue-700"
              onClick={() => setMobileOpen(true)}
            >
              ☰
            </button>
          )}

        </div>
      </nav>

      {/* ================= LOGO ACCORDION MODAL ================= */}

      {logoOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]">

          <div className="bg-white rounded-2xl shadow-xl p-10 w-[420px] relative text-center animate-fadeIn">

            {/* Close Button */}
            <button
              onClick={() => setLogoOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
            >
              ✕
            </button>

            {/* Logo */}
            <img
              src={logo}
              alt="logo"
              className="w-44 h-44 mx-auto mb-6 object-contain"
            />

            <h2 className="text-2xl font-bold text-blue-700">
              IntelliShine
            </h2>

            <p className="text-gray-600 text-sm mt-3">
              AI Powered Study Productivity Platform
            </p>

            <div className="mt-6">

              <Link
                to="/dashboard"
                onClick={() => setLogoOpen(false)}
                className="block bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>

            </div>

          </div>

        </div>
      )}

      {/* ================= MOBILE MENU ================= */}

      {mobileOpen && userToken && (
        <div className="fixed inset-0 bg-white z-[999] overflow-y-auto pt-24 px-6 pb-10 md:hidden">

          <button
            onClick={() => setMobileOpen(false)}
            className="fixed top-5 right-5 text-xl"
          >
            ✕
          </button>

          <Link
            to="/dashboard"
            className="block text-lg font-semibold mb-6"
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </Link>

          <p className="font-semibold text-gray-800 mb-2">Learning</p>

          {learningItems.map((item, i) =>
            item.action ? (
              <button
                key={i}
                onClick={() => {
                  setMobileOpen(false);
                  item.action();
                }}
                className="block ml-4 mb-3 text-gray-600"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={i}
                to={item.path}
                className="block ml-4 mb-3 text-gray-600"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}

          <p className="font-semibold text-gray-800 mt-6 mb-2">Growth</p>

          {growthItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className="block ml-4 mb-3 text-gray-600"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <p className="font-semibold text-gray-800 mt-6 mb-2">Resources</p>

          {resourceItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className="block ml-4 mb-3 text-gray-600"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <p className="font-semibold text-gray-800 mt-6 mb-2">Profile</p>

          {profileItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className="block ml-4 mb-3 text-gray-600"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
            className="block text-red-600 mt-8"
          >
            Logout
          </button>

        </div>
      )}
    </>
  );
};

export default Navbar;