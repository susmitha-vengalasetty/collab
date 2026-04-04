import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    education: "",
    careerGoal: "",
    targetExam: "",
    subjects: "",
    studyGoalHours: "",
    bio: "",
    avatar: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [meta, setMeta] = useState({ createdAt: "", updatedAt: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        setProfile({
          name: res.data.name || "",
          email: res.data.email || "",
          education: res.data.education || "",
          careerGoal: res.data.careerGoal || "",
          targetExam: res.data.targetExam || "",
          subjects: res.data.subjects ? res.data.subjects.join(", ") : "",
          studyGoalHours: res.data.studyGoalHours || "",
          bio: res.data.bio || "",
          avatar: res.data.avatar || "",
        });
        setMeta({
          createdAt: res.data.createdAt || "",
          updatedAt: res.data.updatedAt || "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Allow only images
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    // Max size 2MB
    const MAX_SIZE = 2 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      alert("Image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfile((prev) => ({
        ...prev,
        avatar: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setProfile({
      ...profile,
      avatar: "",
    });
  };

  const openFilePicker = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Session expired. Please login again.");
      return;
    }

    try {
      await axios.put(
        "http://localhost:5000/api/profile",
        {
          ...profile,
          studyGoalHours: Number(profile.studyGoalHours),
          subjects: profile.subjects
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Profile Updated Successfully");

      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors px-6 py-10">
      <div className="relative max-w-3xl mx-auto card p-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-xl font-bold"
        >
          ✕
        </button>

        <h2 className="text-3xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-8">
          Student Profile
        </h2>

        {/* Avatar Section */}

        <div className="flex flex-col items-center mb-8">
          <div
            onClick={openFilePicker}
            className={`relative cursor-pointer ${
              isEditing ? "hover:opacity-80" : ""
            }`}
          >
            <img
              src={
                profile.avatar ||
                "https://api.dicebear.com/7.x/initials/svg?seed=User"
              }
              alt="avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 dark:border-gray-700 shadow-md"
            />

            {isEditing && (
              <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Edit
              </div>
            )}
          </div>

          {/* Hidden file input */}

          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />

          {isEditing && profile.avatar && (
            <button
              type="button"
              onClick={removeAvatar}
              className="mt-3 text-sm text-red-500 dark:text-red-400 hover:underline"
            >
              Remove Photo
            </button>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Allowed formats: JPG, PNG • Max size: 2MB
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="card p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Education
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {profile.education || "-"}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Career Goal
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {profile.careerGoal || "-"}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Target Exam
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {profile.targetExam || "-"}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Daily Goal
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {profile.studyGoalHours || 0} hrs/day
            </p>
          </div>
        </div>

        {/* Subjects badges */}
        {profile.subjects && (
          <div className="mb-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Subjects
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.subjects.split(",").map((s, i) => (
                <span key={i} className="badge">
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Profile Form */}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            value={profile.name}
            onChange={handleChange}
            disabled={!isEditing}
            className="input"
          />

          <input
            name="email"
            placeholder="Email"
            value={profile.email}
            onChange={handleChange}
            disabled={!isEditing}
            className="input"
          />

          <input
            name="education"
            placeholder="Education Level"
            value={profile.education}
            onChange={handleChange}
            disabled={!isEditing}
            className="input"
          />

          <input
            name="careerGoal"
            placeholder="Career Goal"
            value={profile.careerGoal}
            onChange={handleChange}
            disabled={!isEditing}
            className="input"
          />

          <input
            name="targetExam"
            placeholder="Target Exam"
            value={profile.targetExam}
            onChange={handleChange}
            disabled={!isEditing}
            className="input"
          />

          <input
            name="subjects"
            placeholder="Subjects (comma separated)"
            value={profile.subjects}
            onChange={handleChange}
            disabled={!isEditing}
            className="input"
          />

          <input
            name="studyGoalHours"
            placeholder="Daily Study Goal (hours)"
            value={profile.studyGoalHours}
            onChange={handleChange}
            disabled={!isEditing}
            className="input"
          />

          <textarea
            name="bio"
            placeholder="Short Bio"
            value={profile.bio}
            onChange={handleChange}
            disabled={!isEditing}
            rows="4"
            className="input"
          />

          {/* Buttons */}

          {isEditing ? (
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto"
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                className="btn btn-ghost w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary mt-3"
            >
              Edit Profile
            </button>
          )}
        </form>

        {/* Meta info */}
        {(meta.createdAt || meta.updatedAt) && (
          <div className="mt-6 flex flex-wrap gap-2">
            {meta.createdAt && (
              <span className="badge">
                Joined {new Date(meta.createdAt).toLocaleDateString()}
              </span>
            )}
            {meta.updatedAt && (
              <span className="badge">
                Updated {new Date(meta.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
