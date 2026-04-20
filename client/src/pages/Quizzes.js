import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { IconBox } from "../components";
import { apiRequest } from "../api/httpClient";
import QuizHeroCard from "../components/quiz/QuizHeroCard";
import QuizPath from "../components/quiz/QuizPath";
import QuizCardEnhanced from "../components/quiz/QuizCardEnhanced";

// Mirroring Backend's Curriculum for Path Map
const QUIZ_CURRICULUM = ["waste-1", "energy-1", "water-1", "climate-1", "biodiversity-1"];



function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      apiRequest("/api/quizzes"),
      apiRequest("/api/gamification/me")
    ])
    .then(([quizzesData, gamificationData]) => {
      // Sort quizzes matching internal curriculum map, unmapped quizzes go to the end
      const sortedQuizzes = [...quizzesData].sort((a, b) => {
        const idxA = QUIZ_CURRICULUM.indexOf(a.slug || a._id);
        const idxB = QUIZ_CURRICULUM.indexOf(b.slug || b._id);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
      setQuizzes(sortedQuizzes);
      
      if (gamificationData?.summary?.quizProgress) {
        setUserProgress(gamificationData.summary.quizProgress);
      }
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const handlePlayQuiz = (id) => navigate(`/quiz/${id}`);

  // ── Hero Priority Engine ────────────────────────
  let priorityQuiz = null;
  if (quizzes.length > 0) {
    const todayStr = new Date().toDateString();
    
    // 1. Same-day memory retention (Dampens oscillation)
    const activeToday = quizzes.find(q => {
      const prog = userProgress[q.slug || q._id];
      return prog?.lastPlayedAt && new Date(prog.lastPlayedAt).toDateString() === todayStr;
    });

    // 2. In-Progress
    const inProgress = quizzes.find(q => {
      const prog = userProgress[q.slug || q._id];
      return prog && prog.stars < 3 && prog.attempts > 0;
    });

    // 3. Lowest Unlocked (using curriculum array if it aligns, simple fallback otherwise)
    const lowestUnlocked = quizzes.find((q, idx) => {
      const slug = q.slug || q._id;
      const prevSlug = idx > 0 ? (quizzes[idx - 1].slug || quizzes[idx - 1]._id) : null;
      const prog = userProgress[slug];
      const prevProg = prevSlug ? userProgress[prevSlug] : null;

      const isLocked = idx > 0 && (!prevProg || prevProg.stars < 1);
      return !isLocked && (!prog || prog.stars < 3);
    });

    priorityQuiz = activeToday || inProgress || lowestUnlocked || quizzes[0];
  }

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

        {/* Hero Section */}
        {priorityQuiz && !loading && (
          <div className="mb-10">
            <h2 className="font-display font-bold text-lg text-slate-800 mb-4 px-2">Continue Learning</h2>
            <QuizHeroCard 
              quiz={priorityQuiz} 
              progress={userProgress[priorityQuiz.slug || priorityQuiz._id]} 
              onPlay={handlePlayQuiz} 
            />
          </div>
        )}

        {/* Path Section */}
        {quizzes.length > 0 && (
          <div className="mb-12 bg-white/50 rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-display font-bold text-lg text-slate-800 mb-2 text-center">Core Curriculum</h2>
            <p className="text-center text-sm text-slate-500 mb-8 max-w-sm mx-auto">
              Follow the guided track to master environmental concepts and unlock higher difficulties.
            </p>
            <QuizPath quizzes={quizzes} userProgress={userProgress} onPlay={handlePlayQuiz} />
          </div>
        )}

        {/* Explore Section */}
        <div className="mb-6">
          <h2 className="font-display font-bold text-lg text-slate-800 mb-4 px-2">Explore All Quizzes</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {quizzes.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-400 bg-white border border-slate-100 rounded-3xl">
                No active quizzes found. The path is being constructed!
              </div>
            ) : (
              quizzes.map((quiz, i) => {
                const isLocked = i > 0 && (!userProgress[quizzes[i - 1].slug || quizzes[i - 1]._id] || userProgress[quizzes[i - 1].slug || quizzes[i - 1]._id].stars < 1);
                return (
                  <QuizCardEnhanced 
                    key={quiz._id} 
                    quiz={quiz} 
                    progress={userProgress[quiz.slug || quiz._id]} 
                    isLocked={isLocked}
                    onPlay={handlePlayQuiz} 
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quizzes;
