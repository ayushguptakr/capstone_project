import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isTeacherRole } from "../utils/authStorage";

/** Teacher (or admin) only. Enforces first-login password change. */
export default function RequireTeacher({ children }) {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.isFirstLogin && location.pathname !== "/set-password") {
    return <Navigate to="/set-password" replace />;
  }
  if (!isTeacherRole(user.role)) return <Navigate to="/dashboard" replace />;
  
  return children;
}
