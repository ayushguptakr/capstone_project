import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#4CAF50", "#FFD54F", "#4FC3F7", "#FFB74D", "#81C784"];
const PARTICLE_COUNT = 50;

export default function Confetti({ show, onComplete }) {
  const [particles] = useState(() =>
    Array.from({ length: PARTICLE_COUNT }, () => ({
      id: Math.random(),
      x: Math.random() * 100 - 50,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.3,
      size: 8 + Math.random() * 8,
      rotation: Math.random() * 360,
    }))
  );

  useEffect(() => {
    if (show && onComplete) {
      const t = setTimeout(onComplete, 2000);
      return () => clearTimeout(t);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 flex justify-center">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 0, x: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [0, -300],
                x: [0, p.x],
                rotate: [0, p.rotation + 360],
              }}
              transition={{
                duration: 1.5,
                delay: p.delay,
                ease: "easeOut",
              }}
              className="absolute top-1/2 left-1/2 rounded-sm"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
