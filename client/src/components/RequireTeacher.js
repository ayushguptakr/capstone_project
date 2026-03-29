import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser, getToken, isTeacherRole } from "../utils/authStorage";

/** Teacher (or admin) only. */
export default function RequireTeacher({ children }) {
  const token = getToken();
  const user = getStoredUser();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (!isTeacherRole(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
