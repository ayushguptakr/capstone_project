import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Leaderboard.css";

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("global");
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [schoolLeaderboard, setSchoolLeaderboard] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch global leaderboard
      const globalResponse = await fetch("http://localhost:5000/api/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch school leaderboard
      const schoolResponse = await fetch("http://localhost:5000/api/leaderboard/schools", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch user progress
      const progressResponse = await fetch("http://localhost:5000/api/leaderboard/progress", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (globalResponse.ok) {
        const globalData = await globalResponse.json();
        setGlobalLeaderboard(globalData);
      }

      if (schoolResponse.ok) {
        const schoolData = await schoolResponse.json();
        setSchoolLeaderboard(schoolData);
      }

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setUserProgress(progressData);
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getBadgeDisplay = (badges) => {
    return badges.slice(0, 3).map((badge, index) => (
      <span key={index} className="badge-icon" title={badge.title}>
        {badge.icon}
      </span>
    ));
  };

  if (loading) return <div className="loading">Loading leaderboard...</div>;

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      {/* User Progress Card */}
      {userProgress && (
        <div className="user-progress-card">
          <div className="progress-header">
            <h2>Your Progress</h2>
            <div className="user-rank">
              <span className="rank-badge">{getRankIcon(userProgress.student.rank)}</span>
              <span>Rank {userProgress.student.rank}</span>
            </div>
          </div>
          
          <div className="progress-stats">
            <div className="stat-item">
              <span className="stat-icon">🏆</span>
              <div>
                <div className="stat-value">{userProgress.student.points}</div>
                <div className="stat-label">Total Points</div>
              </div>
            </div>
            
            <div className="stat-item">
              <span className="stat-icon">🧠</span>
              <div>
                <div className="stat-value">{userProgress.quizStats.totalAttempts}</div>
                <div className="stat-label">Quizzes Taken</div>
              </div>
            </div>
            
            <div className="stat-item">
              <span className="stat-icon">📝</span>
              <div>
                <div className="stat-value">{userProgress.taskStats.approvedSubmissions}</div>
                <div className="stat-label">Tasks Completed</div>
              </div>
            </div>
            
            <div className="stat-item">
              <span className="stat-icon">🎖️</span>
              <div>
                <div className="stat-value">{userProgress.student.badges.length}</div>
                <div className="stat-label">Badges Earned</div>
              </div>
            </div>
          </div>

          {userProgress.student.badges.length > 0 && (
            <div className="user-badges">
              <h4>Your Badges:</h4>
              <div className="badges-display">
                {userProgress.student.badges.map((badge, index) => (
                  <div key={index} className="badge-item" title={badge.title}>
                    <span className="badge-icon">{badge.icon}</span>
                    <span className="badge-title">{badge.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="leaderboard-tabs">
        <button 
          className={`tab-btn ${activeTab === "global" ? "active" : ""}`}
          onClick={() => setActiveTab("global")}
        >
          🌍 Global Rankings
        </button>
        <button 
          className={`tab-btn ${activeTab === "schools" ? "active" : ""}`}
          onClick={() => setActiveTab("schools")}
        >
          🏫 School Rankings
        </button>
      </div>

      {/* Global Leaderboard */}
      {activeTab === "global" && (
        <div className="leaderboard-content">
          <h3>Top Students</h3>
          <div className="leaderboard-list">
            {globalLeaderboard.map((student, index) => (
              <div key={student._id} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
                <div className="rank-section">
                  <span className="rank-display">{getRankIcon(student.rank)}</span>
                </div>
                
                <div className="student-info">
                  <div className="student-name">{student.name}</div>
                  <div className="student-school">{student.school || "No School"}</div>
                </div>
                
                <div className="student-badges">
                  {getBadgeDisplay(student.badges)}
                </div>
                
                <div className="student-points">
                  <span className="points-value">{student.points}</span>
                  <span className="points-label">points</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* School Leaderboard */}
      {activeTab === "schools" && (
        <div className="leaderboard-content">
          <h3>Top Schools</h3>
          <div className="leaderboard-list">
            {schoolLeaderboard.map((school, index) => (
              <div key={school.school} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
                <div className="rank-section">
                  <span className="rank-display">{getRankIcon(school.rank)}</span>
                </div>
                
                <div className="school-info">
                  <div className="school-name">{school.school}</div>
                  <div className="school-stats">
                    {school.studentCount} students • Avg: {school.averagePoints} pts
                  </div>
                </div>
                
                <div className="school-points">
                  <span className="points-value">{school.totalPoints}</span>
                  <span className="points-label">total points</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {((activeTab === "global" && globalLeaderboard.length === 0) || 
        (activeTab === "schools" && schoolLeaderboard.length === 0)) && (
        <div className="no-data">
          <h3>No data available yet</h3>
          <p>Start participating in quizzes and tasks to see rankings!</p>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;