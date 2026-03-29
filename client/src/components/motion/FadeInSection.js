import React from "react";
import { motion } from "framer-motion";

const easeOut = [0.22, 1, 0.36, 1];

/**
 * Fades + slides content in when scrolled into view.
 */
export default function FadeInSection({
  children,
  className = "",
  delay = 0,
  y = 28,
  as: Component = motion.section,
  once = true,
  margin = "-48px",
}) {
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin }}
      transition={{ duration: 0.55, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </Component>
  );
}
