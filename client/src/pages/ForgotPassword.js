import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthShell, AuthFloatingLeaf, AuthInput } from "../components/auth";
import { CheckCircle, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../api/httpClient";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter an email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // POST to forgot-password endpoint
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err.response?.data?.message || "Failed to process request. Please try again later."
      );
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
          Reset your password 🔑
        </h1>
        <p className="mt-2 text-center text-gray-600 font-body text-sm sm:text-base leading-relaxed">
          Enter your email to receive reset link
        </p>

        {status === "success" ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center"
          >
            <div className="flex justify-center mb-3">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-emerald-800 font-bold mb-2">Check your email</h3>
            <p className="text-emerald-700 text-sm">
              If an account exists for <b>{email}</b>, we have sent password reset instructions.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/login"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors duration-300"
              >
                ← Return to Login
              </Link>
            </div>
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
              id="reset-email"
              label="Email"
              type="email"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              required
            />

            <motion.button
              type="submit"
              whileHover={status !== "loading" ? { scale: 1.03, y: -2 } : {}}
              whileTap={status !== "loading" ? { scale: 0.97 } : {}}
              disabled={status === "loading"}
              className="w-full py-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5E9F57] to-eco-primary text-white font-display font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-400/35 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed mt-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </motion.button>
          </motion.form>
        )}

        {status !== "success" && (
          <div className="mt-8 flex justify-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-500 hover:text-[#5E9F57] transition-colors duration-300"
            >
              ← Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </AuthShell>
  );
}

export default ForgotPassword;
