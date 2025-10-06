import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // token check

  if (!token) {
    // agar token nahi hai → login page bhej do
    return <Navigate to="/login" replace />;
  }

  // agar token hai → children render karo (Home ya koi page)
  return children;
};

export default ProtectedRoute;
