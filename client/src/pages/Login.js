import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

import minion from "./images/minion.jpg";
import trainToy from "./images/train_toy.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email & password");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // SAVE TOKEN + USER
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      alert("Login successful!");

      navigate("/dashboard"); // redirect to dashboard
    } catch (err) {
      console.log("Login error:", err);
      alert(err.response?.data?.message || "Login failed!");
    }
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${trainToy})` }}
    >
      <div className="login-box">
        <img src={minion} alt="mascot" className="mascot" />

        <h2 className="title">Welcome Back!</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="signup-text">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
