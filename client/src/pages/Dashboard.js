import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (err) {
      console.log("Error parsing user:", err);
      navigate("/");
    }
  }, [navigate]);

  if (!user) return <h2>Loading...</h2>;

  return (
    <div className="dash-container">
      <div className="dash-box">
        <h1 className="dash-title">Welcome, {user.name} 👋</h1>
        <h3 className="dash-role">Role: {user.role.toUpperCase()}</h3>

        {/* Student Options */}
        {user.role === "student" && (
          <div className="dash-buttons">
            <button className="dash-btn" onClick={() => navigate("/tasks")}>
              📋 View All Tasks
            </button>
            <button className="dash-btn" onClick={() => navigate("/quizzes")}>
              🧠 Eco-Quizzes
            </button>
            <button className="dash-btn" onClick={() => navigate("/mini-games")}>
              🎮 Mini-Games
            </button>
            <button className="dash-btn" onClick={() => navigate("/mysubmissions")}>
              📤 My Submissions
            </button>
            <button className="dash-btn" onClick={() => navigate("/marketplace")}>
              🛒 Marketplace
            </button>
            <button className="dash-btn" onClick={() => navigate("/leaderboard")}>
              🏆 Leaderboard & Progress
            </button>
          </div>
        )}

        {/* Teacher Options */}
        {user.role === "teacher" && (
          <div className="dash-buttons">
            <button className="dash-btn" onClick={() => navigate("/create-task")}>
              ➕ Create Task
            </button>
            <button className="dash-btn" onClick={() => navigate("/create-quiz")}>
              🧠 Create Quiz
            </button>
            <button className="dash-btn" onClick={() => navigate("/teacher-dashboard")}>
              📊 Analytics Dashboard
            </button>
            <button className="dash-btn" onClick={() => navigate("/mytasks")}>
              📚 My Created Tasks
            </button>
            <button className="dash-btn" onClick={() => navigate("/submissions")}>
              👀 Student Submissions
            </button>
          </div>
        )}

        {/* Logout */}
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
