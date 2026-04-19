import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredUser, getToken, isStudentRole } from "../utils/authStorage";

/** Student (or admin/sponsor) only. Enforces first-login password change. */
export default function RequireStudent({ children }) {
  const location = useLocation();
  const token = getToken();
  const user = getStoredUser();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.isFirstLogin && location.pathname !== "/set-password") {
    return <Navigate to="/set-password" replace />;
  }
  if (!isStudentRole(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
