import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredUser, getToken } from "../utils/authStorage";

/** Must be logged in. Enforces first-login password change. */
export default function RequireAuth({ children }) {
  const location = useLocation();
  const token = getToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // SECURITY: Force first-login users to /set-password before they can access anything else
  if (user.isFirstLogin && location.pathname !== "/set-password") {
    return <Navigate to="/set-password" replace />;
  }

  return children;
}
