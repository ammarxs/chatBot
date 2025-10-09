// ...existing code...
import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";

const Confirmation = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialEmail = location.state?.email || query.get("email") || "";
  const [email] = useState(initialEmail);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const openMail = () => {
    // Open Gmail in a new tab. User can change to other providers manually.
    window.open("https://mail.google.com", "_blank", "noopener,noreferrer");
  };

  const resendVerification = async () => {
    if (!email) {
      setMessage("No email provided to resend verification.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/api/users/resend-verification", { email });
      setMessage(res.data?.message || "Verification email resent. Check your inbox.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend verification. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white px-4">
      <div className="w-full max-w-lg bg-gray-800 bg-opacity-70 backdrop-blur-md p-8 rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">
          Confirm your email
        </h1>

        <p className="text-gray-300 mb-4">
          We sent a confirmation link to{" "}
          <span className="font-medium text-white">{email || "your email address"}</span>.
          Please open your inbox and click the verification link to activate your account.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={openMail}
            className="px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-700 transition"
          >
            Open Gmail
          </button>

          <button
            onClick={resendVerification}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition disabled:opacity-60"
          >
            {loading ? "Resending..." : "Resend Verification"}
          </button>
        </div>

        {message && (
          <p className="mt-4 text-sm text-gray-300">{message}</p>
        )}

        <p className="text-gray-400 mt-6 text-sm">
          Didn't receive it? Check spam folder or{" "}
          <Link to="/login" className="text-pink-400 hover:text-pink-500 font-medium">
            go to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Confirmation;
// ...existing code...