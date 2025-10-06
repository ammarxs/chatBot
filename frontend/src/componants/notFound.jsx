import React from "react";
import { Link } from "react-router-dom"; // ✅ named import, not default

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white text-center px-4">
      <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-pink-500 drop-shadow-lg">
        404
      </h1>
      <h2 className="text-3xl font-semibold mt-4">Page Not Found</h2>
      <p className="text-gray-400 mt-2 max-w-md">
        Oops! The page you’re trying to reach doesn’t exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-md hover:shadow-xl transition-all duration-300"
      >
        ⬅ Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
