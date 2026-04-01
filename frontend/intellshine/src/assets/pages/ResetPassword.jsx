import { useParams } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    setError("");
    setMessage("");

    try {
      await API.post(`/auth/reset-password/${token}`, {
        newPassword: password
      });
      setMessage("Password reset successful.");
    } catch (error) {
      setError(error.response?.data?.message || "Reset failed.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px]">
        <h2 className="text-2xl font-bold mb-5 text-gray-800">
          Reset Password
        </h2>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

        <input
          type="password"
          placeholder="Enter new password"
          className="w-full border p-2 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;