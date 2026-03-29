import { motion } from "framer-motion";

const variants = {
  easy: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  hard: "bg-red-100 text-red-800 border-red-300",
  default: "bg-eco-secondary/20 text-eco-primaryDark border-eco-secondary/40",
};

export default function Badge({ children, variant = "default", className = "" }) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center px-3 py-1 rounded-xl
        text-sm font-semibold border-2
        ${variants[variant] || variants.default}
        ${className}
      `}
    >
      {children}
    </motion.span>
  );
}
