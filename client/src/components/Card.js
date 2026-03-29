import { motion } from "framer-motion";

export default function Card({ children, className = "", onClick, hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        bg-white rounded-3xl p-6 shadow-card
        border-2 border-eco-pale/50
        transition-shadow duration-300
        ${onClick ? "cursor-pointer" : ""}
        ${hover ? "hover:shadow-card-hover hover:border-eco-primary/20" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
