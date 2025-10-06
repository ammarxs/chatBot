import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // backend se error aya (400 ya 500)
        setError(data.message || "Login failed");
        return;
      }

      // ✅ Save token & user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Navigate to home page
      navigate("/");
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white px-4">
      <div className="w-full max-w-md bg-gray-800 bg-opacity-70 backdrop-blur-md p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-700 hover:to-orange-600 text-white py-3 rounded-lg font-semibold transition-all duration-300"
          >
            Login
          </button>
        </form>

        {/* Show error if any */}
        {error && (
          <p className="text-center text-red-400 mt-3 font-medium">{error}</p>
        )}

        <p className="text-center text-gray-400 mt-4">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-400 hover:text-blue-500 font-medium"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
