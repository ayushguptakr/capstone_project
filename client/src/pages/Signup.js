import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { AuthShell, AuthFloatingLeaf, AuthInput, AuthSelect } from "../components/auth";
import { EcoLoader } from "../components";
import { API_BASE_URL } from "../api/httpClient";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState([]);
  const [classValue, setClassValue] = useState("");
  const [section, setSection] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  React.useEffect(() => {
    // Fetch available schools on mount
    axios.get(`${API_BASE_URL}/api/auth/schools`)
      .then(res => {
        setSchools(res.data.schools || []);
      })
      .catch(err => {
        console.error("Failed to fetch schools:", err);
      });
  }, []);

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Full name is required";
    if (!email.trim()) next.email = "Email is required";
    if (!password) next.password = "Password is required";
    else if (password.length < 6) next.password = "Password must be at least 6 characters";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        name,
        email,
        password,
        // No role field — backend enforces student-only for public signup
        schoolId: schoolId || undefined,
        class: classValue,
        section,
        className: classValue && section ? `${classValue}${section}` : classValue,
      });
      // Use AuthContext so state updates reactively and GuestOnly handles the redirect
      login(res.data.user, res.data.token, true); // true for rememberMe to persist session

    } catch (err) {
      setIsLoading(false);
      setSubmitError(err.response?.data?.message || "Could not create account. Try again or use a different email.");
    }
  };

  if (isLoading) {
    return <EcoLoader text="Creating Eco Hero..." />;
  }

  return (
    <AuthShell formClassName="max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="isolate rounded-3xl border border-white/80 bg-white/65 backdrop-blur-xl px-8 py-10 sm:px-10 sm:py-12 supports-[backdrop-filter]:bg-white/58 shadow-[0_20px_48px_-10px_rgba(16,185,129,0.18),inset_0_1px_0_0_rgba(255,255,255,0.92)]"
      >
        <AuthFloatingLeaf />

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-center text-[#2D332F] tracking-tight">
          Join EcoQuest
        </h1>
        <p className="mt-2 text-center text-gray-600 font-body text-sm sm:text-base leading-relaxed">
        Create your student account and start your eco journey
        </p>

        <form onSubmit={handleSignup} className="mt-8 space-y-4">
          {submitError && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200/90 bg-red-50/80 px-4 py-3 text-sm text-red-800 font-medium"
            >
              {submitError}
            </div>
          )}

          <AuthInput
            id="signup-name"
            label="Full name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldErrors((f) => ({ ...f, name: undefined }));
              setSubmitError("");
            }}
            error={fieldErrors.name}
            autoComplete="name"
            required
          />

          <AuthInput
            id="signup-email"
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
            id="signup-password"
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((f) => ({ ...f, password: undefined }));
              setSubmitError("");
            }}
            error={fieldErrors.password}
            autoComplete="new-password"
            required
          />

          <AuthSelect
            id="signup-school"
            label="School"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
          >
            <option value="">— Select your school —</option>
            {schools.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} {s.address ? `(${s.address})` : ""}
              </option>
            ))}
          </AuthSelect>

          <div className="grid sm:grid-cols-2 gap-4">
            <AuthInput
              id="signup-class"
              label="Class"
              type="text"
              placeholder="e.g. 10"
              value={classValue}
              onChange={(e) => setClassValue(e.target.value)}
            />
            <AuthInput
              id="signup-section"
              label="Section"
              type="text"
              placeholder="e.g. A"
              value={section}
              onChange={(e) => setSection(e.target.value.toUpperCase())}
            />
          </div>

          <div className="pt-2">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#5E9F57] to-eco-primary text-white font-display font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-400/35 transition-shadow duration-300"
            >
              Create account
            </motion.button>
          </div>
        </form>

        <p className="text-center mt-8 text-gray-600 font-body text-sm sm:text-base">
          Already on the quest?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#5E9F57] hover:text-eco-primaryDark underline-offset-2 hover:underline transition-colors"
          >
            Log in
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

export default Signup;
