import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isPrincipalRole } from "../utils/authStorage";

/** Principal (or admin) only. Enforces first-login password change. */
export default function RequirePrincipal({ children }) {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.isFirstLogin && location.pathname !== "/set-password") {
    return <Navigate to="/set-password" replace />;
  }
  if (!isPrincipalRole(user.role)) return <Navigate to="/dashboard" replace />;
  
  return children;
}
