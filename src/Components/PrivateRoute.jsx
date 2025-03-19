// src/Components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Updated import path

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If authenticated, render the protected component
  return children;
}

export default PrivateRoute;