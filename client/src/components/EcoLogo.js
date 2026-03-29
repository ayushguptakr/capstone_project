import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export function EcoLogo({
  className = "w-10 h-10",
  withText = false,
  animated = true,
  currentXp = 0
}) {
  const prevXpRef = useRef(currentXp);
  const [isAnimatingXP, setIsAnimatingXP] = useState(false);

  const containerControls = useAnimation();
  const ringControls = useAnimation();
  const xpSparkleControls = useAnimation();

  // Initial load logic
  useEffect(() => {
    if (animated) {
      containerControls.start({
        scale: [0.9, 1.05, 1],
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" },
      });
      ringControls.start({
        pathLength: 1,
        transition: { duration: 1.5, ease: "easeInOut", delay: 0.2 },
      });
    } else {
      containerControls.set({ scale: 1, opacity: 1 });
      ringControls.set({ pathLength: 1 });
    }
  }, [animated, containerControls, ringControls]);

  // XP change detection
  useEffect(() => {
    if (currentXp > prevXpRef.current && !isAnimatingXP) {
      setIsAnimatingXP(true);
      
      // 1. Ring Fill (0-400ms)
      ringControls.start({
        pathLength: [0, 1],
        transition: { duration: 0.4, ease: "easeOut" }
      });
      
      // 2. Glow Pulse & Micro bump (0-600ms)
      containerControls.start({
        scale: [1, 1.06, 1],
        filter: [
          "drop-shadow(0px 0px 0px rgba(34,197,94,0))",
          "drop-shadow(0px 0px 14px rgba(34,197,94,0.75))",
          "drop-shadow(0px 0px 0px rgba(34,197,94,0))"
        ],
        transition: { duration: 0.6, ease: "easeOut" }
      });

      // 3. Sparkle Flash (Delayed start: 200ms -> 600ms)
      setTimeout(() => {
        xpSparkleControls.start({
          opacity: [0, 1, 0],
          scale: [0.8, 1.3, 1],
          transition: { duration: 0.4, ease: "easeInOut" }
        });
      }, 200);

      // Lock animation state to prevent spam
      setTimeout(() => setIsAnimatingXP(false), 800);
    }
    prevXpRef.current = currentXp;
  }, [currentXp, isAnimatingXP, containerControls, ringControls, xpSparkleControls]);

  const orbFloatVariants = {
    animate: animated
      ? {
          y: [0, -3, 0],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }
      : {},
  };

  const idleSparkleVariants = {
    animate: animated
      ? {
          opacity: [0.6, 1, 0.6],
          scale: [0.8, 1.2, 0.8],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }
      : { opacity: 1, scale: 1 },
  };

  return (
    <div className={`relative flex items-center gap-3 ${withText ? "group cursor-pointer" : ""}`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={containerControls}
        whileHover={
          withText
            ? {
                scale: 1.08,
                rotate: 4,
                filter: "drop-shadow(0px 8px 16px rgba(74,222,128,0.3))",
              }
            : {}
        }
        className={`flex-shrink-0 relative ${className}`}
      >
        <motion.svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          variants={orbFloatVariants}
        >
          {/* Defs */}
          <defs>
            <linearGradient id="eco-globe-grad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
             <linearGradient id="eco-globe-inner" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#BBF7D0" />
              <stop offset="100%" stopColor="#4ADE80" />
            </linearGradient>
            <linearGradient id="eco-land-grad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#14532D" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A3E635" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
          </defs>

          {/* Main Orb Background */}
          <circle cx="50" cy="50" r="42" fill="url(#eco-globe-grad)" />
          
          {/* Inner Glow / Highlight */}
          <circle cx="45" cy="40" r="30" fill="url(#eco-globe-inner)" opacity="0.6" filter="blur(6px)"/>

          {/* Abstract Organic Land Patches */}
          <path
            d="M 28 35 C 45 20 65 38 72 28 C 88 45 68 62 55 78 C 35 75 15 52 28 35 Z"
            fill="url(#eco-land-grad)"
          />
          <path
            d="M 62 65 C 75 52 85 68 68 82 C 52 75 58 58 62 65 Z"
            fill="#16A34A"
            opacity="0.6"
          />
          <path
            d="M 20 55 C 30 45 35 60 25 70 C 15 65 15 58 20 55 Z"
            fill="#22C55E"
            opacity="0.4"
          />

          {/* Outer Progress Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="47"
            stroke="url(#ring-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={ringControls}
            style={{
              rotate: -90,
              transformOrigin: "50% 50%",
            }}
          />

          {/* Sparkle Element (Idle) */}
          <motion.path
            d="M 78 12 Q 80 20 88 22 Q 80 24 78 32 Q 76 24 68 22 Q 76 20 78 12 Z"
            fill="#FEF08A"
            variants={idleSparkleVariants}
            style={{ transformOrigin: "78px 22px" }}
          />
          <motion.path
             d="M 86 32 Q 87 35 90 36 Q 87 37 86 40 Q 85 37 82 36 Q 85 35 86 32 Z"
             fill="#FFF"
             variants={idleSparkleVariants}
             style={{ transformOrigin: "86px 36px", scale: 0.6 }}
          />
          
          {/* XP Reactive Sparkle */}
          <motion.path
             d="M 22 20 Q 25 30 35 33 Q 25 36 22 46 Q 19 36 9 33 Q 19 30 22 20 Z"
             fill="#A3E635"
             initial={{ opacity: 0, scale: 0.8 }}
             animate={xpSparkleControls}
             style={{ transformOrigin: "22px 33px" }}
          />

        </motion.svg>
      </motion.div>

      {/* Embedded Text Overlay */}
      {withText && (
        <div className="flex flex-col justify-center select-none">
          <motion.span 
             className="font-display font-bold text-2xl tracking-tight leading-none origin-left"
             whileHover={{ scale: 1.05 }}
             transition={{ duration: 0.2 }}
          >
            <span className="text-[#16A34A] drop-shadow-sm">Eco</span>
            <span className="text-[#334155] drop-shadow-sm">Quest</span>
          </motion.span>
          <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#5E9F57] mt-0.5 opacity-90">
            Play for the Planet
          </span>
        </div>
      )}
    </div>
  );
}

export function EcoLoader({ className = "w-24 h-24", text = "Play for the Planet..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAF7] gap-8 p-6">
      <div className={`relative ${className}`}>
        {/* Slow Rotating Orb */}
        <motion.div
           className="absolute inset-[15%]"
           animate={{ rotate: 360 }}
           transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-xl">
            <defs>
              <linearGradient id="load-globe" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="100%" stopColor="#15803D" />
              </linearGradient>
              <linearGradient id="load-land" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#14532D" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="46" fill="url(#load-globe)" />
            <path d="M 28 35 C 45 20 65 38 72 28 C 88 45 68 62 55 78 C 35 75 15 52 28 35 Z" fill="url(#load-land)" opacity="0.85" />
          </svg>
        </motion.div>
        
        {/* Fast Spinning Inner Track */}
        <motion.div
           className="absolute inset-[5%]"
           animate={{ rotate: -360 }}
           transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full opacity-30">
             <circle cx="50" cy="50" r="48" stroke="#A3E635" strokeWidth="1" strokeDasharray="8 8" />
          </svg>
        </motion.div>

        {/* Fast Spinning Progress Ring */}
        <motion.div
           className="absolute inset-0"
           animate={{ rotate: 360 }}
           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <circle 
              cx="50" cy="50" r="48" 
              stroke="#22C55E" 
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="180 300"
            />
          </svg>
        </motion.div>
      </div>

      <motion.div
         animate={{ opacity: [0.4, 1, 0.4], y: [0, -2, 0] }}
         transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
         className="flex flex-col items-center gap-1"
      >
         <span className="font-display font-bold text-2xl text-[#2D332F] tracking-tight">
            <span className="text-[#16A34A]">Eco</span>Quest
         </span>
         <span className="text-sm font-bold uppercase tracking-widest text-[#5E9F57]">{text}</span>
      </motion.div>
    </div>
  );
}
