import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser, getToken, isPrincipalRole } from "../utils/authStorage";

/** Principal (or admin) only. */
export default function RequirePrincipal({ children }) {
  const token = getToken();
  const user = getStoredUser();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (!isPrincipalRole(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
