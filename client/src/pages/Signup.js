import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

import minion from "./images/minion.jpg";
import trainToy from "./images/train_toy.jpg";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [school, setSchool] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all required fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password,
        role,
        school,
      });

      // Save user + token
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      alert("Signup successful!");
      navigate("/dashboard");

    } catch (err) {
      console.log("Signup Error:", err);
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      className="signup-container"
      style={{ backgroundImage: `url(${trainToy})` }}
    >
      <div className="signup-box">
        <img src={minion} alt="mascot" className="mascot" />
        <h2 className="title">Create Account</h2>

        <form onSubmit={handleSignup}>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />

          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-field"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          <input
            type="text"
            placeholder="School Name"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="input-field"
          />

          <button className="signup-btn" type="submit">
            Signup
          </button>
        </form>

        <p className="signup-text">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
