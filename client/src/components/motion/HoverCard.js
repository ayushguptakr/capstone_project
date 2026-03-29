import React from "react";
import { motion } from "framer-motion";

const easeOut = [0.22, 1, 0.36, 1];

/** Card hover: scale + lift + soft press on tap. */
export default function HoverCard({ children, className = "", scale = 1.03, y = -6 }) {
  return (
    <motion.div
      whileHover={{ scale, y, transition: { duration: 0.35, ease: easeOut } }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
