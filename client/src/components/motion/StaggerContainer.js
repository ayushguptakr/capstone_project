import React from "react";
import { motion } from "framer-motion";

const easeOut = [0.22, 1, 0.36, 1];

export const staggerItem = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

export function staggerContainer(stagger = 0.1) {
  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: 0.05 },
    },
  };
}

/**
 * Parent: set variants={staggerContainer(0.1)} initial="hidden" whileInView="show"
 * Children: motion.* with variants={staggerItem}
 */
export default function StaggerContainer({
  children,
  className = "",
  stagger = 0.1,
  once = true,
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer(stagger)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-32px" }}
    >
      {children}
    </motion.div>
  );
}
