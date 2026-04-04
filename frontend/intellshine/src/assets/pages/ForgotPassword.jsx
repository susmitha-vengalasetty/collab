import { useState } from "react";
import API from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setMessage("");
    setError("");

    try {
      const { data } = await API.post("/auth/forgot-password", { email });
      setMessage(data.message);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="card p-8 w-[400px]">
        <h2 className="text-2xl font-bold mb-5 text-gray-800 dark:text-gray-100">
          Forgot Password
        </h2>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

        <input
          type="email"
          placeholder="Enter your email address"
          className="input mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleSubmit} className="w-full btn btn-primary">
          Send Reset Link
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
