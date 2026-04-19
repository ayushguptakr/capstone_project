import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredUser, getToken, isPrincipalRole } from "../utils/authStorage";

/** Principal (or admin) only. Enforces first-login password change. */
export default function RequirePrincipal({ children }) {
  const location = useLocation();
  const token = getToken();
  const user = getStoredUser();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.isFirstLogin && location.pathname !== "/set-password") {
    return <Navigate to="/set-password" replace />;
  }
  if (!isPrincipalRole(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
