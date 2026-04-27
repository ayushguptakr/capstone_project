import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isStudentRole } from "../utils/authStorage";

/** Student (or admin/sponsor) only. Enforces first-login password change. */
export default function RequireStudent({ children }) {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.isFirstLogin && location.pathname !== "/set-password") {
    return <Navigate to="/set-password" replace />;
  }
  if (!isStudentRole(user.role)) return <Navigate to="/dashboard" replace />;
  
  return children;
}
