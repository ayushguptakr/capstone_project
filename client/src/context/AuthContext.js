import React, { createContext, useContext, useState, useCallback } from "react";
import {
  getStoredUser,
  getToken,
  setAuthData,
  clearAuth as clearStorage,
} from "../utils/authStorage";

const AuthContext = createContext(null);

/**
 * Provides reactive auth state across the entire app.
 * When logout() is called, every component consuming useAuth()
 * will immediately re-render with user = null.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getToken());
  const isLoading = false;

  const login = useCallback((userData, tokenStr, rememberMe = false) => {
    setAuthData(userData, tokenStr, rememberMe);
    setUser(userData);
    setToken(tokenStr);
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    // Also clear any legacy keys the app may have scattered
    localStorage.removeItem("ecoStreak");
    localStorage.removeItem("ecoQuest_user");
    sessionStorage.clear();
    setUser(null);
    setToken(null);
  }, []);

  const isLoggedIn = Boolean(user && token);
  const isAuthenticated = isLoggedIn;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        isAuthenticated,
        isLoading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth state. Must be used within <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() must be used within an <AuthProvider>");
  }
  return ctx;
}
