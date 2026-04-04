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
        newPassword: password,
      });
      setMessage("Password reset successful.");
    } catch (error) {
      setError(error.response?.data?.message || "Reset failed.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="card p-8 w-[400px]">
        <h2 className="text-2xl font-bold mb-5 text-gray-800 dark:text-gray-100">
          Reset Password
        </h2>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

        <input
          type="password"
          placeholder="Enter new password"
          className="input mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleReset} className="w-full btn btn-primary">
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
