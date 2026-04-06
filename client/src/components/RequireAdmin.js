import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser, getToken, isAdminRole } from "../utils/authStorage";

/** Admin only. */
export default function RequireAdmin({ children }) {
  const token = getToken();
  const user = getStoredUser();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (!isAdminRole(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
