import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ActionButton({
  to,
  href,
  onClick,
  icon: Icon,
  children,
  variant = "primary",
  className = "",
}) {
  const base = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition";
  const variants = {
    primary: "bg-eco-primary text-white hover:bg-eco-primaryDark shadow-soft",
    secondary: "border-2 border-eco-primary text-eco-primary hover:bg-eco-pale",
    outline: "border-2 border-gray-300 text-gray-700 hover:border-eco-primary hover:text-eco-primary",
  };
  const btn = (
    <motion.span
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </motion.span>
  );

  if (to) return <Link to={to} className="inline-flex">{btn}</Link>;
  if (href) return <a href={href}>{btn}</a>;
  return (
    <button type="button" onClick={onClick} className="cursor-pointer border-0 bg-transparent p-0 inline-flex">
      {btn}
    </button>
  );
}
