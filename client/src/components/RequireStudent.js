import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser, getToken, isStudentRole } from "../utils/authStorage";

/** Student (or admin/sponsor) only. */
export default function RequireStudent({ children }) {
  const token = getToken();
  const user = getStoredUser();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (!isStudentRole(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
