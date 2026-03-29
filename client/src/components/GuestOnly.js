import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser, isAuthenticated } from "../utils/authStorage";

/** Login / signup only when logged out. */
export default function GuestOnly({ children }) {
  const user = getStoredUser();
  if (isAuthenticated() && user) {
    const to = user.role === "teacher" ? "/teacher-dashboard" : "/dashboard";
    return <Navigate to={to} replace />;
  }
  return children;
}
