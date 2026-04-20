import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { ProgressBar, EcoLoader, SproutyQuizBuddy } from "../components";
import QuizRewardModal from "../components/quiz/QuizRewardModal";
import useFeedback from "../hooks/useFeedback";
import useSound from "../hooks/useSound";
import { apiRequest } from "../api/httpClient";
import { useAlert } from "../components/ui/AlertProvider";

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

  const [sproutyMood, setSproutyMood] = useState("idle");
  const [sproutyCaption, setSproutyCaption] = useState("");
  const { triggerXPFromEvent, triggerSuccess } = useFeedback();
  const [attemptId] = useState(() => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const { playClick } = useSound();
  const { showAlert } = useAlert();

  useEffect(() => {
    apiRequest(`/api/quizzes/${id}`, { retries: 1 })
      .then((data) => {
        setQuiz(data);
        if (data) setAnswers(new Array(data.questions.length).fill(null));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnswerSelect = (idx) => {
    playClick();
    setSelectedAnswer(idx);
    const next = [...answers];
    next[currentQuestion] = { selectedAnswer: idx };
    setAnswers(next);

    // Check correctness for Sprouty reaction
    const question = quiz?.questions?.[currentQuestion];
    if (question) {
      const isCorrect = idx === question.correctAnswer;
      setSproutyMood(isCorrect ? "correct" : "wrong");
      setSproutyCaption(
        isCorrect
          ? ["Great job!", "You got it!", "Amazing!", "Eco genius!"][Math.floor(Math.random() * 4)]
          : ["Keep trying!", "Almost there!", "You can do it!", "Don't give up!"][Math.floor(Math.random() * 4)]
      );
      // Auto-reset after animation
      setTimeout(() => {
        setSproutyMood("idle");
        setSproutyCaption("");
      }, 1500);
    }
  };

  const handleNext = () => {
    playClick();
    setSproutyMood("idle");
    setSproutyCaption("");
    if (currentQuestion < (quiz?.questions?.length || 1) - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(answers[currentQuestion + 1]?.selectedAnswer ?? null);
    }
  };

  const handlePrevious = () => {
    playClick();
    setSproutyMood("idle");
    setSproutyCaption("");
    if (currentQuestion > 0) {
      setCurrentQuestion((q) => q - 1);
      setSelectedAnswer(answers[currentQuestion - 1]?.selectedAnswer ?? null);
    }
  };

  const handleSubmit = async (e) => {
    playClick();
    if (answers.some((a) => a === null)) {
      showAlert({ type: "warning", message: "Please answer all questions before submitting." });
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiRequest("/api/quizzes/submit", {
        method: "POST",
        body: { quizId: id, attemptId, answers },
        retries: 0,
      });
      setResult(data);
      triggerSuccess();
      triggerXPFromEvent(data.score ?? 0, e, { y: window.innerHeight * 0.48 });
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <EcoLoader text="Loading Quiz..." />;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center text-gray-600">Quiz not found</div>;

  if (result) {
    return (
      <QuizRewardModal
        show={true}
        score={result.score}
        totalPossible={result.totalPossible}
        percentage={result.percentage}
        masteryData={result.mastery}
        onPlayAgain={() => window.location.reload()}
        onClose={() => navigate("/quizzes")}
      />
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display font-bold text-xl text-gray-800 mb-2">{quiz.title}</h1>
          <ProgressBar value={currentQuestion + 1} max={quiz.questions.length} label={`Question ${currentQuestion + 1} of ${quiz.questions.length}`} />
        </div>

        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl p-6 shadow-card border-2 border-eco-pale"
        >
          <h2 className="font-display font-semibold text-lg text-gray-800 mb-6">{question.question}</h2>

          {/* Sprouty Quiz Buddy */}
          <div className="flex justify-center mb-5">
            <SproutyQuizBuddy mood={sproutyMood} caption={sproutyCaption} />
          </div>

          <div className="space-y-3">
            {question.options.map((opt, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswerSelect(idx)}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition font-body flex items-center gap-3
                  ${selectedAnswer === idx ? "border-eco-primary bg-eco-pale" : "border-gray-200 hover:border-eco-mint"}`}
              >
                <span className="w-8 h-8 rounded-full bg-eco-primary/20 text-eco-primary font-bold flex items-center justify-center">
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-300 text-gray-600 font-semibold disabled:opacity-50"
          >
            ← Previous
          </motion.button>
          {currentQuestion === quiz.questions.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={submitting || selectedAnswer === null}
              className="flex-1 py-3 rounded-2xl bg-eco-primary text-white font-bold disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="flex-1 py-3 rounded-2xl bg-eco-primary text-white font-bold disabled:opacity-50"
            >
              Next →
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TakeQuiz;
