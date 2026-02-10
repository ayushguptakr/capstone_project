import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateQuiz.css";

function CreateQuiz() {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    category: "waste-management",
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        points: 5
      }
    ]
  });
  const [loading, setLoading] = useState(false);

  const handleQuizChange = (field, value) => {
    setQuiz(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          points: 5
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (quiz.questions.length > 1) {
      const newQuestions = quiz.questions.filter((_, i) => i !== index);
      setQuiz(prev => ({ ...prev, questions: newQuestions }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!quiz.title.trim() || !quiz.description.trim()) {
      alert("Please fill in title and description");
      return;
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.question.trim()) {
        alert(`Please fill in question ${i + 1}`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(`Please fill in all options for question ${i + 1}`);
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/quizzes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quiz),
      });

      if (response.ok) {
        alert("Quiz created successfully!");
        navigate("/dashboard");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-quiz-container">
      <div className="create-quiz-header">
        <h1>📝 Create Eco-Quiz</h1>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="quiz-basic-info">
          <div className="form-group">
            <label>Quiz Title *</label>
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => handleQuizChange("title", e.target.value)}
              placeholder="e.g., Waste Management Basics"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={quiz.description}
              onChange={(e) => handleQuizChange("description", e.target.value)}
              placeholder="Brief description of the quiz content..."
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={quiz.category}
                onChange={(e) => handleQuizChange("category", e.target.value)}
              >
                <option value="waste-management">♻️ Waste Management</option>
                <option value="energy">⚡ Energy</option>
                <option value="water">💧 Water Conservation</option>
                <option value="biodiversity">🌿 Biodiversity</option>
                <option value="climate">🌍 Climate Change</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={quiz.difficulty}
                onChange={(e) => handleQuizChange("difficulty", e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        <div className="questions-section">
          <h3>Questions</h3>
          
          {quiz.questions.map((question, qIndex) => (
            <div key={qIndex} className="question-card">
              <div className="question-header">
                <h4>Question {qIndex + 1}</h4>
                {quiz.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="remove-question-btn"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  value={question.question}
                  onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                  placeholder="Enter your question here..."
                  rows="2"
                  required
                />
              </div>

              <div className="options-grid">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="option-group">
                    <label>Option {String.fromCharCode(65 + oIndex)} *</label>
                    <div className="option-input-group">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                        required
                      />
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctAnswer === oIndex}
                        onChange={() => handleQuestionChange(qIndex, "correctAnswer", oIndex)}
                        title="Mark as correct answer"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Points for this question</label>
                <input
                  type="number"
                  value={question.points}
                  onChange={(e) => handleQuestionChange(qIndex, "points", parseInt(e.target.value) || 5)}
                  min="1"
                  max="20"
                />
              </div>
            </div>
          ))}

          <button type="button" onClick={addQuestion} className="add-question-btn">
            + Add Another Question
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="create-btn">
            {loading ? "Creating..." : "Create Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateQuiz;