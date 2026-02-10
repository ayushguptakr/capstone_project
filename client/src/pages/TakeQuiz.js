import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TakeQuiz.css";

function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/quizzes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(null));
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = { selectedAnswer: answerIndex };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1]?.selectedAnswer || null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]?.selectedAnswer || null);
    }
  };

  const handleSubmit = async () => {
    if (answers.some(answer => answer === null)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/quizzes/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quizId: id,
          answers: answers,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (!quiz) return <div className="error">Quiz not found</div>;

  if (result) {
    return (
      <div className="quiz-result-container">
        <div className="result-card">
          <h1>🎉 Quiz Completed!</h1>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-percentage">{result.percentage.toFixed(1)}%</span>
            </div>
            <div className="score-details">
              <p><strong>Score:</strong> {result.score} / {result.totalPossible} points</p>
              <p><strong>Percentage:</strong> {result.percentage.toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="result-actions">
            <button onClick={() => navigate("/quizzes")} className="back-to-quizzes-btn">
              Back to Quizzes
            </button>
            <button onClick={() => navigate("/dashboard")} className="dashboard-btn">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="take-quiz-container">
      <div className="quiz-header">
        <h1>{quiz.title}</h1>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="question-counter">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </p>
      </div>

      <div className="question-card">
        <h2 className="question-text">{question.question}</h2>
        
        <div className="options-container">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${selectedAnswer === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>

        <div className="quiz-navigation">
          <button 
            onClick={handlePrevious} 
            disabled={currentQuestion === 0}
            className="nav-btn prev-btn"
          >
            ← Previous
          </button>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <button 
              onClick={handleSubmit} 
              disabled={submitting || selectedAnswer === null}
              className="submit-btn"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          ) : (
            <button 
              onClick={handleNext} 
              disabled={selectedAnswer === null}
              className="nav-btn next-btn"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TakeQuiz;