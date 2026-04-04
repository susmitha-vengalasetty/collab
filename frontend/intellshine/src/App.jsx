import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useContext, useEffect } from "react";

import Navbar from "./assets/components/Navbar";
import Footer from "./assets/components/Footer";
import Login from "./assets/pages/Login";
import Register from "./assets/pages/Register";
import Dashboard from "./assets/pages/Dashboard";
import CreatePlan from "./assets/pages/CreatePlan";
import PrivateRoute from "./assets/components/PrivateRoute";
import ForgotPassword from "./assets/pages/ForgotPassword";
import ResetPassword from "./assets/pages/ResetPassword";
import AskAi from "./assets/pages/AskAi";
import FocusTime from "./assets/pages/FocusTime";
import FocusReport from "./assets/pages/FocusReport";
import AcademicTutor from "./assets/pages/AcademicTutor";
import MockTestSetup from "./assets/pages/MockTestSetup";
import MockTestExam from "./assets/pages/MockTestExam";
import MockTestResult from "./assets/pages/MockTestResult";
import { MockTestProvider } from "./assets/context/MockTestContext";
import MockTestHistory from "./assets/pages/MockTestHistory";
import Analytics from "./assets/pages/Analytics";
import StudyLibrary from "./assets/pages/StudyLibrary";
import MyLibrary from "./assets/pages/MyLibrary";
import StudyDiary from "./assets/pages/StudyDiary";
import Profile from "./assets/pages/Profile";
import ResumeAnalyzer from "./assets/pages/ResumeAnalyzer";
import BookFinder from "./assets/pages/BookFinder";
import Newspaper from "./assets/pages/Newspaper";

import { AuthProvider, AuthContext } from "./assets/context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import "./App.css";

/* ================= Wrapper Component ================= */

function AppContent() {
  const { userToken } = useContext(AuthContext);
  const [chatOpen, setChatOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Force dark theme permanently
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-400 animate-pulse">
            IntelliShine
          </h1>
          <p className="text-gray-300 mt-3">
            Preparing your structured learning dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar setChatOpen={setChatOpen} />

      <main className="pt-20 min-h-screen max-w-7xl mx-auto bg-gray-900 flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/focus-time" element={<FocusTime />} />
          <Route path="/focus-report" element={<FocusReport />} />
          <Route path="/academic-tutor" element={<AcademicTutor />} />
          <Route path="/mock-test" element={<MockTestSetup />} />
          <Route path="/mock-test/exam" element={<MockTestExam />} />
          <Route path="/mock-test/result" element={<MockTestResult />} />
          <Route path="/mock-test/history" element={<MockTestHistory />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/newspaper" element={<Newspaper />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-library"
            element={
              <PrivateRoute>
                <MyLibrary />
              </PrivateRoute>
            }
          />

          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreatePlan />
              </PrivateRoute>
            }
          />

          <Route
            path="/youtube"
            element={
              <PrivateRoute>
                <StudyLibrary />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/study-diary"
            element={
              <PrivateRoute>
                <StudyDiary />
              </PrivateRoute>
            }
          />

          <Route
            path="/resume-analyzer"
            element={
              <PrivateRoute>
                <ResumeAnalyzer />
              </PrivateRoute>
            }
          />

          <Route
            path="/books"
            element={
              <PrivateRoute>
                <BookFinder />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
      <AskAi open={chatOpen} setOpen={setChatOpen} />

      {/* Global toaster for non-intrusive feedback */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--toast-bg, #fff)",
            color: "var(--toast-fg, #111)",
          },
          className: "shadow-lg border border-gray-200 dark:border-gray-800",
        }}
      />
    </>
  );
}

/* ================= Main App ================= */

function App() {
  return (
    <AuthProvider>
      <MockTestProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </MockTestProvider>
    </AuthProvider>
  );
}

export default App;
