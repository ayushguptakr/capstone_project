import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredUser, getToken } from "../utils/authStorage";

/** Must be logged in. */
export default function RequireAuth({ children }) {
  const location = useLocation();
  const token = getToken();
  const user = getStoredUser();
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
