import React from "react";
import { motion } from "framer-motion";
import IconBox from "./IconBox";

export default function StatCard({ icon: Icon, value, label, color = "green", className = "" }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`
        bg-white rounded-2xl p-4 shadow-card border-2 border-eco-pale/50
        flex items-center gap-3
        ${className}
      `}
    >
      <IconBox color={color} size="md">
        <Icon className="w-5 h-5" strokeWidth={2} />
      </IconBox>
      <div>
        <div className="font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </motion.div>
  );
}
