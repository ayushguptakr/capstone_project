import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Loader2 } from "lucide-react";
import { apiRequest } from "../api/httpClient";

/**
 * Sprouty — Intelligence & Guidance Layer ONLY.
 * Receives ALL state from parent. Computes nothing internally.
 */
export default function SproutyCard({ ecoScore = 60, streak = 0, missionsPending = 0, level = 1, xp = 0, contextMessage = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setIsOpen(false);
    }
    function handleEscape(e) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleAI = async (type) => {
    try {
      setIsLoading(true);
      const res = await apiRequest("/api/ai/sprouty", {
        method: "POST",
        body: {
          intent: type,
          userContext: { streak, xp, pendingMissions: missionsPending, ecoScore }
        }
      });
      if (res && res.reply) {
        setAiMessage(res.reply.slice(0, 120));
      }
    } catch (err) {
      setAiMessage("I'm taking a quick nap! Catch you later. 🌿");
    } finally {
      setIsLoading(false);
    }
  };

  // Display priority: AI response > context from engine > fallback
  const displayMessage = aiMessage && !isLoading ? `"${aiMessage}"` : contextMessage;

  return (
    <div className="relative inline-block z-40" ref={popoverRef}>
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50 shadow-md hover:shadow-lg transition-all p-3 sm:pr-6 w-full sm:w-auto text-left overflow-hidden min-w-[280px]"
      >
        <motion.div
           animate={{ scale: [1, 1.05, 1] }}
           transition={{ repeat: Infinity, duration: 2.5 }}
           className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)] shrink-0"
        >
          <Sprout className="text-green-500 w-7 h-7" strokeWidth={2.2} />
        </motion.div>
        
        <div className="flex flex-col pr-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-800 text-lg">Eco Health</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-200 text-green-800">
              {ecoScore}%
            </span>
          </div>
          <span className="text-sm font-medium text-green-700 leading-snug block mt-0.5 sm:max-w-xs transition-opacity delay-75">
            {displayMessage}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-green-600/70 mt-1.5 flex items-center gap-1">
            {isLoading && <Loader2 className="w-3 h-3 animate-spin"/>}
            {isLoading ? "Sprouty is thinking..." : "Active Companion"}
          </span>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute right-0 top-full mt-3 w-[280px] bg-white border border-green-100 shadow-[0_0_40px_-5px_rgba(34,197,94,0.3)] rounded-2xl p-4 z-50 flex flex-col gap-2"
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Ask Sprouty</p>
            <button 
              onClick={() => handleAI("tip")}
              disabled={isLoading}
              className="text-left text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 focus:bg-green-50 px-3 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-wait"
            >
              🌱 Get an Eco Tip
            </button>
            <button 
              onClick={() => handleAI("next")}
              disabled={isLoading}
              className="text-left text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 focus:bg-green-50 px-3 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-wait"
            >
              🎯 What should I do next?
            </button>
            <button 
              onClick={() => handleAI("why")}
              disabled={isLoading}
              className="text-left text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 focus:bg-green-50 px-3 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-wait"
            >
              🌍 Why does this matter?
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
