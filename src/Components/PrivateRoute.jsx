// Check your PrivateRoute.jsx to make sure it looks like this:
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function PrivateRoute({ children, requireAdmin = false }) {
  const { currentUser, isAdmin } = useAuth();
  console.log("PrivateRoute check:", { currentUser: !!currentUser, isAdmin: isAdmin?.(), requireAdmin });
  
  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If route requires admin access and user is not an admin, redirect to home
  if (requireAdmin && !isAdmin()) {
    console.log("Admin access denied, redirecting to home");
    return <Navigate to="/" />;
  }

  // If authenticated with proper permissions, render the protected component
  return children;
}

export default PrivateRoute;