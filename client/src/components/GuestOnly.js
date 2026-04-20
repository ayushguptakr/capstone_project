import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Login / signup only when logged out. */
export default function GuestOnly({ children }) {
  const { user, isLoggedIn } = useAuth();

  if (isLoggedIn && user) {
    if (user.isFirstLogin && user.role !== "student") {
      return <Navigate to="/set-password" replace />;
    }
    
    const roleHome = {
      student: "/dashboard",
      teacher: "/teacher-dashboard",
      principal: "/principal/dashboard",
      admin: "/admin/dashboard",
    };
    return <Navigate to={roleHome[user.role] || "/dashboard"} replace />;
  }

  return children;
}
