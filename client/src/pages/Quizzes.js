import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Recycle, Zap, Droplet, Sprout, Globe, BookOpen, ListChecks, ArrowLeft } from "lucide-react";
import { Badge, IconBox } from "../components";
import { apiRequest } from "../api/httpClient";

const categoryIcons = {
  "waste-management": Recycle,
  energy: Zap,
  water: Droplet,
  biodiversity: Sprout,
  climate: Globe,
};

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest("/api/quizzes")
      .then(setQuizzes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-eco-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-eco-primary flex items-center gap-2">
              <IconBox color="blue" size="sm"><Brain className="w-5 h-5" strokeWidth={2} /></IconBox>
              Eco Quizzes
            </h1>
            <p className="text-gray-600 mt-1">Test your knowledge & earn XP!</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-eco-primary text-white font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </motion.button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {quizzes.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500 bg-white rounded-3xl shadow-card">
              No quizzes yet. Check back soon!
            </div>
          ) : (
            quizzes.map((quiz, i) => {
              const CatIcon = categoryIcons[quiz.category] || BookOpen;
              return (
                <motion.div
                  key={quiz._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/quiz/${quiz._id}`)}
                  className="bg-white rounded-3xl p-6 shadow-card border-2 border-eco-pale/50 cursor-pointer hover:shadow-card-hover"
                >
                  <div className="flex items-start justify-between mb-3">
                    <IconBox color="blue" size="lg" className="rounded-2xl">
                      <CatIcon className="w-10 h-10" strokeWidth={2} />
                    </IconBox>
                    <Badge variant={(quiz.difficulty || "easy").toLowerCase()}>{quiz.difficulty || "Easy"}</Badge>
                  </div>
                  <h3 className="font-display font-bold text-lg text-gray-800 mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><ListChecks className="w-4 h-4" /> {quiz.questions?.length || 0} questions</span>
                    <span className="font-semibold text-eco-primary">+{quiz.totalPoints || 0} XP</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-2xl bg-eco-secondary text-white font-bold"
                  >
                    Start Quiz
                  </motion.button>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Quizzes;
