import React from "react";
import { motion } from "framer-motion";
import IconBox from "./IconBox";

export default function IconCard({
  icon: Icon,
  title,
  desc,
  action,
  color = "green",
  onClick,
  delay = 0,
}) {
  const Wrapper = onClick ? motion.div : motion.div;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={onClick ? { scale: 1.02, y: -4 } : {}}
      onClick={onClick}
      className={`
        bg-white rounded-2xl p-6 shadow-card border-2 border-eco-pale
        transition hover:shadow-card-hover hover:border-eco-primary/20
        ${onClick ? "cursor-pointer" : ""}
      `}
    >
      <IconBox color={color} size="lg" className="mb-4 rounded-2xl">
        <Icon className="w-8 h-8" strokeWidth={2} />
      </IconBox>
      <h3 className="font-display font-bold text-lg text-gray-800 mb-2">{title}</h3>
      {desc && <p className="text-gray-500 text-sm mb-4">{desc}</p>}
      {action}
    </motion.div>
  );
}
