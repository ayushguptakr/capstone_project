import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function XPFloat({ amount, x, y }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: -30, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 1.1 }}
      transition={{ duration: 0.95, ease: "easeOut" }}
      className="absolute font-bold text-lg tracking-tight"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
    >
      <span className="bg-gradient-to-r from-[#22c55e] to-[#86efac] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(34,197,94,0.35)]">
        +{amount} XP
      </span>
      <motion.span
        aria-hidden
        initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.85, 0], x: [0, 8, 14], y: [0, -10, -16], scale: [0.8, 1, 0.85] }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="ml-1 inline-block text-emerald-400"
      >
        <Sparkles className="w-4 h-4" />
      </motion.span>
    </motion.div>
  );
}
