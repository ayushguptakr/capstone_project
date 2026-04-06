import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";
import { AuthShell, AuthFloatingLeaf, AuthInput } from "../components/auth";
import { EcoLoader } from "../components";
import { API_BASE_URL } from "../api/httpClient";
import axios from "axios";
import { getStoredUser, getToken } from "../utils/authStorage";

const ROLE_HOME = {
  student: "/dashboard",
  teacher: "/teacher-dashboard",
  principal: "/principal/dashboard",
  admin: "/developer/dashboard",
};

export default function SetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setIsLoading(true);
    try {
      const token = getToken();
      await axios.post(
        `${API_BASE_URL}/api/auth/set-password`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local user to reflect isFirstLogin = false
      const user = getStoredUser();
      if (user) {
        user.isFirstLogin = false;
        localStorage.setItem("user", JSON.stringify(user));
      }

      const role = user?.role || "student";
      navigate(ROLE_HOME[role] || "/dashboard");
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || "Failed to update password. Please try again.");
    }
  };

  if (isLoading) {
    return <EcoLoader text="Securing your account..." />;
  }

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="isolate rounded-3xl border border-white/80 bg-white/65 backdrop-blur-xl px-8 py-10 sm:px-10 sm:py-12 supports-[backdrop-filter]:bg-white/58 shadow-[0_20px_48px_-10px_rgba(16,185,129,0.18),inset_0_1px_0_0_rgba(255,255,255,0.92)]"
      >
        <AuthFloatingLeaf />

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-center text-[#2D332F] tracking-tight">
          Set Your Password
        </h1>
        <p className="mt-2 text-center text-gray-600 font-body text-sm sm:text-base leading-relaxed">
          Welcome! For security, please create a new password to replace the temporary one.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200/90 bg-red-50/80 px-4 py-3 text-sm text-red-800 font-medium"
            >
              {error}
            </div>
          )}

          <AuthInput
            id="set-new-password"
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError("");
            }}
            autoComplete="new-password"
            required
          />

          <AuthInput
            id="set-confirm-password"
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            autoComplete="new-password"
            required
          />

          <motion.button
            type="submit"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#5E9F57] to-eco-primary text-white font-display font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-400/35 transition-shadow duration-300 flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Secure My Account
          </motion.button>
        </form>
      </motion.div>
    </AuthShell>
  );
}
