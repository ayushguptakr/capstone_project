import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";

function TeacherDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
    fetchVerificationQueue();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/teacher/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const fetchVerificationQueue = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/teacher/verification-queue", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setVerificationQueue(data);
      }
    } catch (error) {
      console.error("Error fetching verification queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (submissionId, status, feedback = "") => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/teacher/verify/${submissionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, feedback }),
      });

      if (response.ok) {
        alert(`Submission ${status} successfully!`);
        fetchVerificationQueue(); // Refresh the queue
        fetchAnalytics(); // Refresh analytics
      }
    } catch (error) {
      console.error("Error verifying submission:", error);
      alert("Failed to verify submission");
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="teacher-dashboard-container">
      <div className="dashboard-header">
        <h1>👨‍🏫 Teacher Dashboard</h1>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Main Dashboard
        </button>
      </div>

      {/* Overview Cards */}
      {analytics && (
        <div className="overview-cards">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{analytics.schoolStats.totalStudents}</div>
              <div className="stat-label">Students</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-value">{analytics.schoolStats.totalPoints}</div>
              <div className="stat-label">Total Points</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-value">{verificationQueue.length}</div>
              <div className="stat-label">Pending Reviews</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎖️</div>
            <div className="stat-content">
              <div className="stat-value">{analytics.schoolStats.totalBadges}</div>
              <div className="stat-label">Badges Earned</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === "verification" ? "active" : ""}`}
          onClick={() => setActiveTab("verification")}
        >
          ✅ Verification Queue ({verificationQueue.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          👥 Students
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && analytics && (
          <div className="overview-content">
            <div className="content-section">
              <h3>Content Created</h3>
              <div className="content-stats">
                <div className="content-item">
                  <span className="content-icon">📋</span>
                  <span className="content-count">{analytics.contentCreated.tasks}</span>
                  <span className="content-label">Tasks Created</span>
                </div>
                <div className="content-item">
                  <span className="content-icon">🧠</span>
                  <span className="content-count">{analytics.contentCreated.quizzes}</span>
                  <span className="content-label">Quizzes Created</span>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Quiz Activity</h3>
              <div className="activity-list">
                {analytics.recentActivity.map((attempt, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-info">
                      <span className="student-name">{attempt.student.name}</span>
                      <span className="quiz-title">completed "{attempt.quiz.title}"</span>
                    </div>
                    <div className="activity-score">
                      <span className="score">{attempt.totalScore} pts</span>
                      <span className="percentage">({attempt.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "verification" && (
          <div className="verification-content">
            <h3>Pending Submissions</h3>
            <div className="submissions-list">
              {verificationQueue.map((submission) => (
                <div key={submission._id} className="submission-card">
                  <div className="submission-header">
                    <div className="student-info">
                      <span className="student-name">{submission.student.name}</span>
                      <span className="student-school">({submission.student.school})</span>
                    </div>
                    <div className="submission-date">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="task-info">
                    <h4>{submission.task.title}</h4>
                    <p>{submission.task.description}</p>
                    <span className="points-badge">🏆 {submission.task.points} points</span>
                  </div>
                  
                  <div className="submission-content">
                    <p><strong>Submission:</strong> {submission.content}</p>
                    {submission.imageUrl && (
                      <img 
                        src={submission.imageUrl} 
                        alt="Submission evidence" 
                        className="submission-image"
                      />
                    )}
                  </div>
                  
                  <div className="verification-actions">
                    <button 
                      className="approve-btn"
                      onClick={() => handleVerification(submission._id, "approved")}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => {
                        const feedback = prompt("Rejection reason (optional):");
                        handleVerification(submission._id, "rejected", feedback);
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {verificationQueue.length === 0 && (
              <div className="no-submissions">
                <p>No pending submissions to review!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "students" && analytics && (
          <div className="students-content">
            <h3>School Students Leaderboard</h3>
            <div className="students-list">
              {analytics.students.map((student, index) => (
                <div key={student._id} className="student-card">
                  <div className="student-rank">#{index + 1}</div>
                  <div className="student-info">
                    <span className="student-name">{student.name}</span>
                    <div className="student-badges">
                      {student.badges.slice(0, 3).map((badge, i) => (
                        <span key={i} className="badge-icon" title={badge.title}>
                          {badge.icon}
                        </span>
                      ))}
                    </div>
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
      </div>
    </div>
  );
}

export default TeacherDashboard;