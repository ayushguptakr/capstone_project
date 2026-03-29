import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const easeOut = [0.22, 1, 0.36, 1];

const variantClass = {
  primary:
    "bg-gradient-to-r from-[#2E7D32] via-eco-primary to-[#66BB6A] text-white shadow-lg shadow-emerald-500/35 hover:shadow-xl hover:shadow-emerald-400/50",
  secondary:
    "border-2 border-gray-200/90 bg-white/95 text-[#2D332F] hover:border-emerald-300/70 hover:bg-emerald-50/60 hover:shadow-md",
  cta:
    "bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-100 text-[#3E2723] shadow-lg shadow-amber-900/15 hover:shadow-xl hover:shadow-amber-800/30",
};

export default function AnimatedButton({ children, to, href, variant = "primary", className = "" }) {
  const base =
    "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-display font-bold text-base sm:text-lg transition-shadow";
  const combined = `${base} ${variantClass[variant] || variantClass.primary} ${className}`;

  const motionProps = {
    className: `${combined} cursor-pointer`,
    whileHover: { scale: 1.03, y: -3, transition: { duration: 0.35, ease: easeOut } },
    whileTap: { scale: 0.96 },
  };

  if (to) {
    return (
      <Link to={to} className="inline-flex w-full sm:w-auto justify-center">
        <motion.span {...motionProps}>{children}</motion.span>
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className="inline-flex w-full sm:w-auto justify-center">
        <motion.span {...motionProps}>{children}</motion.span>
      </a>
    );
  }
  return (
    <motion.button type="button" {...motionProps}>
      {children}
    </motion.button>
  );
}
