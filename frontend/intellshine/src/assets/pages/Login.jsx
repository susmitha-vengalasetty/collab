import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await API.post("/auth/login", form);
      login(data.token);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <form onSubmit={handleSubmit} className="card p-8 w-[420px]">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Login to IntelliShine
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            className="input"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            name="password"
            className="input"
            onChange={handleChange}
            required
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-3 font-medium">{error}</p>
        )}

        <button className="w-full btn btn-primary font-semibold">Login</button>

        <div className="flex justify-between text-sm mt-4">
          <Link
            to="/forgot-password"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Forgot Password?
          </Link>
          <Link
            to="/register"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Create Account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
