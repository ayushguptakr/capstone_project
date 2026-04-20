import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthShell, AuthFloatingLeaf, AuthInput } from "../components/auth";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../api/httpClient";
import axios from "axios";

// Helper for strength check
function getStrength(pass) {
  if (!pass) return { label: "", color: "bg-gray-200" };
  const hasLower = /[a-z]/.test(pass);
  const hasUpper = /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);
  
  let score = 0;
  if (pass.length > 5) score += 1;
  if (pass.length > 8) score += 1;
  if (hasLower && hasUpper) score += 1;
  if (hasNumber || hasSpecial) score += 1;

  if (score < 2) return { label: "Weak", color: "bg-red-400 w-1/3" };
  if (score < 4) return { label: "Medium", color: "bg-yellow-400 w-2/3" };
  return { label: "Strong", color: "bg-emerald-500 w-full" };
}

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error, expired
  const [errorMessage, setErrorMessage] = useState("");

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      setStatus("error");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password/${token}`, { password });
      setStatus("success");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password.";
      // Catch specific expiry phrases from backend
      if (msg.includes("invalid or has expired")) {
        setStatus("expired");
      } else {
        setStatus("error");
        setErrorMessage(msg);
      }
    }
  };

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="isolate rounded-3xl border border-white/80 bg-white/65 backdrop-blur-xl px-8 py-10 sm:px-10 sm:py-12 supports-[backdrop-filter]:bg-white/58 shadow-[0_20px_48px_-10px_rgba(16,185,129,0.18),inset_0_1px_0_0_rgba(255,255,255,0.92)]"
      >
        <AuthFloatingLeaf />

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-center text-[#2D332F] tracking-tight">
          New Password
        </h1>
        <p className="mt-2 text-center text-gray-600 font-body text-sm sm:text-base leading-relaxed">
          Create a secure new password
        </p>

        {status === "expired" ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
          >
            <div className="flex justify-center mb-3">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-red-800 font-bold mb-2">Link Expired</h3>
            <p className="text-red-700 text-sm">
              This reset link has expired or is invalid. Please request a new one.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/forgot-password"
                className="w-full py-3 rounded-xl bg-red-100 text-red-800 font-bold hover:bg-red-200 transition-colors"
              >
                Request New Link
              </Link>
            </div>
          </motion.div>
        ) : status === "success" ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center"
          >
            <div className="flex justify-center mb-3">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-emerald-800 font-bold mb-2">Password Reset!</h3>
            <p className="text-emerald-700 text-sm">
              Your password has been changed successfully. Redirecting you to login...
            </p>
          </motion.div>
        ) : (
          <motion.form 
            onSubmit={handleSubmit} 
            className="mt-8 space-y-5"
            animate={status === "error" ? { x: [-8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <AnimatePresence>
              {status === "error" && errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-red-200/90 bg-red-50/80 px-4 py-3 text-sm text-red-800 font-medium overflow-hidden"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <AuthInput
              id="new-password"
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              required
            />

            {/* Strength Indicator */}
            {password.length > 0 && (
              <div className="space-y-1 mt-1 px-1">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden transition-all">
                  <div className={`h-full transition-all duration-300 ${strength.color}`} />
                </div>
                <p className="text-xs text-right font-medium text-gray-500">
                  Strength: <span className="text-gray-700">{strength.label}</span>
                </p>
              </div>
            )}

            <AuthInput
              id="confirm-password"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              required
            />

            <motion.button
              type="submit"
              whileHover={status !== "loading" ? { scale: 1.03, y: -2 } : {}}
              whileTap={status !== "loading" ? { scale: 0.97 } : {}}
              disabled={status === "loading"}
              className="w-full py-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5E9F57] to-eco-primary text-white font-display font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-400/35 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed mt-4"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Reset Password"
              )}
            </motion.button>
          </motion.form>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-500 hover:text-[#5E9F57] transition-colors duration-300"
          >
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </AuthShell>
  );
}

export default ResetPassword;
