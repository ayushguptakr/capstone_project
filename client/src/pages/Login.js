import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { AuthShell, AuthFloatingLeaf, AuthInput } from "../components/auth";
import { EcoLoader } from "../components";
import { API_BASE_URL } from "../api/httpClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Email is required";
    if (!password) next.password = "Password is required";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      const user = res.data.user;

      // First-login intercept
      if (user.isFirstLogin) {
        navigate("/set-password");
        return;
      }

      // Role-based redirection
      const roleHome = {
        student: "/dashboard",
        teacher: "/teacher-dashboard",
        principal: "/principal/dashboard",
        admin: "/admin/dashboard",
      };
      navigate(roleHome[user.role] || "/dashboard");
    } catch (err) {
      setIsLoading(false);
      setSubmitError(err.response?.data?.message || "Login failed. Check your details and try again.");
    }
  };

  if (isLoading) {
    return <EcoLoader text="Authenticating..." />;
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

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-center text-[#2D332F] tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-gray-600 font-body text-sm sm:text-base leading-relaxed">
          Student, Teacher, and Principal access{" "}
          <span aria-hidden>🌍</span>
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          {submitError && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200/90 bg-red-50/80 px-4 py-3 text-sm text-red-800 font-medium"
            >
              {submitError}
            </div>
          )}

          <AuthInput
            id="login-email"
            label="Email"
            type="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((f) => ({ ...f, email: undefined }));
              setSubmitError("");
            }}
            error={fieldErrors.email}
            autoComplete="email"
            required
          />

          <AuthInput
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((f) => ({ ...f, password: undefined }));
              setSubmitError("");
            }}
            error={fieldErrors.password}
            autoComplete="current-password"
            required
          />

          <motion.button
            type="submit"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#5E9F57] to-eco-primary text-white font-display font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-400/35 transition-shadow duration-300"
          >
            Log in
          </motion.button>
        </form>

        <p className="text-center mt-8 text-gray-600 font-body text-sm sm:text-base">
          New to EcoQuest?{" "}
          <Link
            to="/signup"
            className="font-semibold text-[#5E9F57] hover:text-eco-primaryDark underline-offset-2 hover:underline transition-colors"
          >
            Start your journey
          </Link>
        </p>

        <div className="mt-6 flex justify-center md:hidden">
          <Link
            to="/"
            className="text-sm font-semibold text-gray-500 hover:text-[#5E9F57] transition-colors duration-300"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </AuthShell>
  );
}

export default Login;
