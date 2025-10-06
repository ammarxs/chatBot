import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.type === "text" ? "name" : e.target.type]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/users/register", formData);
      setMessage(res.data.message || "Registered Successfully 🎉");
      setTimeout(() => navigate("/login"), 1500); // redirect to login page
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong ❌");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white px-4">
      <div className="w-full max-w-md bg-gray-800 bg-opacity-70 backdrop-blur-md p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">
          Create Account
        </h2>

        {/* ✅ Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-700 hover:to-orange-600 text-white py-3 rounded-lg font-semibold transition-all duration-300"
          >
            Sign Up
          </button>
        </form>

        {/* ✅ Response Message */}
        {message && (
          <p className="text-center mt-4 text-sm text-gray-300">{message}</p>
        )}

        <p className="text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-pink-400 hover:text-pink-500 font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
