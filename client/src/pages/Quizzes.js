import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Quizzes.css";

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/quizzes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "waste-management": "♻️",
      "energy": "⚡",
      "water": "💧",
      "biodiversity": "🌿",
      "climate": "🌍"
    };
    return icons[category] || "📚";
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "#4CAF50",
      medium: "#FF9800",
      hard: "#F44336"
    };
    return colors[difficulty] || "#2196F3";
  };

  if (loading) return <div className="loading">Loading quizzes...</div>;

  return (
    <div className="quizzes-container">
      <div className="quizzes-header">
        <h1>🧠 Eco-Quizzes</h1>
        <p>Test your environmental knowledge and earn points!</p>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="quizzes-grid">
        {quizzes.map((quiz) => (
          <div key={quiz._id} className="quiz-card">
            <div className="quiz-header">
              <span className="quiz-icon">{getCategoryIcon(quiz.category)}</span>
              <h3>{quiz.title}</h3>
            </div>
            
            <p className="quiz-description">{quiz.description}</p>
            
            <div className="quiz-info">
              <div className="quiz-meta">
                <span 
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
                >
                  {quiz.difficulty.toUpperCase()}
                </span>
                <span className="points-badge">
                  🏆 {quiz.totalPoints} pts
                </span>
              </div>
              
              <div className="quiz-stats">
                <span>📝 {quiz.questions.length} questions</span>
                <span>⏱️ ~{quiz.questions.length * 2} min</span>
              </div>
            </div>

            <button 
              className="take-quiz-btn"
              onClick={() => navigate(`/quiz/${quiz._id}`)}
            >
              Start Quiz
            </button>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="no-quizzes">
          <h3>No quizzes available yet</h3>
          <p>Check back later for new eco-challenges!</p>
        </div>
      )}
    </div>
  );
}

export default Quizzes;