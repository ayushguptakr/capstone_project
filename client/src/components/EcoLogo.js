import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { getSkinById } from "../data/sproutySkins";

const SIZE_MAP = {
  sm: "w-7 h-7",
  md: "w-10 h-10",
  lg: "w-20 h-20",
};

export function EcoLogo({
  className,
  size,
  withText = false,
  showTagline = true,
  animated = true,
  currentXp = 0,
  mood = "idle",
  equippedSkins = {}
}) {
  const resolvedClassName = className || SIZE_MAP[size] || SIZE_MAP.md;
  // Resolve equipped skins to their render functions
  const skinLayers = useMemo(() => {
    const layers = [];
    const order = ["evolution", "accessory", "hat", "effect"];
    for (const cat of order) {
      const id = equippedSkins?.[cat];
      if (id) {
        const skin = getSkinById(id);
        if (skin?.render) layers.push({ key: id, render: skin.render });
      }
    }
    return layers;
  }, [equippedSkins]);
  const prevXpRef = useRef(currentXp);
  const [isAnimatingXP, setIsAnimatingXP] = useState(false);
  const [isAnimatingMood, setIsAnimatingMood] = useState(false);
  const prevMoodRef = useRef("idle");

  // Controllers for decoupling complex idle/reaction overlaps
  const pulseControls = useAnimation();       // Parent wrapper pop/glow
  const floatControls = useAnimation();       // Svg soft hover
  const blinkControls = useAnimation();       // Independent eye closing
  const leafControls = useAnimation();        // Independent sprout wiggle
  const pupilControls = useAnimation();       // Dark pupil dilate on happy
  const ringControls = useAnimation();        // XP ring
  const xpSparkleControls = useAnimation();   // XP explicit sparkle

  // IDLE ANIMATION LOOPS
  useEffect(() => {
    let blinkTimeout = null;
    let isActive = true;

    if (animated) {
      // Float
      floatControls.start({
        y: [0, -4, 0],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      });

      // Leaf Wiggle
      leafControls.start({
        rotate: [-6, 6, -6],
        transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
      });

      // Initial Ring Fill
      ringControls.start({
        pathLength: 1,
        transition: { duration: 1.5, ease: "easeInOut", delay: 0.2 }
      });

      // Randomized Eye Blink Loop
      const blinkLoop = async () => {
        while (isActive) {
          const delay = 3500 + Math.random() * 2500;
          // eslint-disable-next-line no-loop-func
          blinkTimeout = setTimeout(() => {}, 0);
          // eslint-disable-next-line no-loop-func
          await new Promise(r => { blinkTimeout = setTimeout(r, delay); });
          if (!isActive) break;
          await blinkControls.start({
            scaleY: [1, 0.1, 1],
            transition: { duration: 0.15, ease: "easeInOut" }
          });
        }
      };
      blinkLoop();

    } else {
      floatControls.set({ y: 0 });
      leafControls.set({ rotate: 0 });
      blinkControls.set({ scaleY: 1 });
      ringControls.set({ pathLength: 1 });
    }

    return () => {
      isActive = false;
      if (blinkTimeout) clearTimeout(blinkTimeout);
    };
  }, [animated, floatControls, leafControls, blinkControls, ringControls]);

  // XP REACTION SEQUENCE
  useEffect(() => {
    if (currentXp > prevXpRef.current && !isAnimatingXP) {
      setIsAnimatingXP(true);
      
      const runSequence = async () => {
        // 1. Ring Action (Fills around)
        ringControls.start({
          pathLength: [0, 1],
          transition: { duration: 0.4, ease: "easeOut" }
        });
        
        // 2. Pulse container glow and scale
        pulseControls.start({
          scale: [1, 1.1, 1],
          filter: [
            "drop-shadow(0px 0px 0px rgba(34,197,94,0))",
            "drop-shadow(0px 0px 14px rgba(34,197,94,0.75))",
            "drop-shadow(0px 0px 0px rgba(34,197,94,0))"
          ],
          transition: { duration: 0.5, ease: "easeOut" }
        });

        // 3. Wide Happy Eyes
        pupilControls.start({
          scale: [1, 1.4, 1],
          transition: { duration: 0.4, ease: "easeInOut" }
        });

        // 4. Sparkle Pop (slight delay to peak intensity)
        setTimeout(() => {
          xpSparkleControls.start({
            opacity: [0, 1, 0],
            scale: [0.8, 1.3, 1],
            transition: { duration: 0.4, ease: "easeInOut" }
          });
        }, 150);

        // Unlock
        setTimeout(() => setIsAnimatingXP(false), 800);
      };
      
      runSequence();
    }
    prevXpRef.current = currentXp;
  }, [currentXp, isAnimatingXP, ringControls, pulseControls, pupilControls, xpSparkleControls]);

  // MOOD REACTION SEQUENCE (Quiz Feedback)
  useEffect(() => {
    if (mood === prevMoodRef.current || mood === "idle" || isAnimatingMood) return;
    setIsAnimatingMood(true);
    prevMoodRef.current = mood;

    if (mood === "correct") {
      // 1. Celebratory bounce
      pulseControls.start({
        scale: [1, 1.1, 1],
        filter: [
          "drop-shadow(0px 0px 0px rgba(34,197,94,0))",
          "drop-shadow(0px 0px 16px rgba(34,197,94,0.7))",
          "drop-shadow(0px 0px 0px rgba(34,197,94,0))"
        ],
        transition: { duration: 0.5, ease: "easeOut" }
      });
      // 2. Leaf goes wild
      leafControls.start({
        rotate: [-12, 12, -12, 8, -8, 6, -6],
        transition: { duration: 0.6, ease: "easeInOut" }
      }).then(() => {
        if (animated) leafControls.start({
          rotate: [-6, 6, -6],
          transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        });
      });
      // 3. Happy wide eyes
      pupilControls.start({
        scale: [1, 1.4, 1],
        transition: { duration: 0.4, ease: "easeInOut" }
      });
      // 4. Sparkle burst
      setTimeout(() => {
        xpSparkleControls.start({
          opacity: [0, 1, 0],
          scale: [0.8, 1.3, 1],
          transition: { duration: 0.35, ease: "easeInOut" }
        });
      }, 120);
    }

    if (mood === "wrong") {
      // 1. Gentle shrink & tilt (never punishing)
      pulseControls.start({
        scale: [1, 0.95, 1],
        rotate: [0, -5, 0],
        transition: { duration: 0.5, ease: "easeInOut" }
      });
      // 2. Slow sympathetic blink
      blinkControls.start({
        scaleY: [1, 0.1, 0.1, 1],
        transition: { duration: 0.4, ease: "easeInOut" }
      });
      // 3. Leaf droops slightly
      leafControls.start({
        rotate: [-2, 2, -2],
        transition: { duration: 0.5, ease: "easeInOut" }
      }).then(() => {
        if (animated) leafControls.start({
          rotate: [-6, 6, -6],
          transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        });
      });
    }

    // Reset mood lock
    setTimeout(() => {
      setIsAnimatingMood(false);
      prevMoodRef.current = "idle";
    }, 700);
  }, [mood, isAnimatingMood, pulseControls, leafControls, pupilControls, xpSparkleControls, blinkControls, animated]);

  return (
    <div className={`relative flex items-center gap-3 ${withText ? "group cursor-pointer" : ""}`}>
      {/* Container tracking XP Pulses & Hover Tilts */}
      <motion.div
        animate={pulseControls}
        whileHover={
          withText
            ? {
                scale: 1.08,
                rotate: 3,
                filter: "drop-shadow(0px 8px 16px rgba(74,222,128,0.3))",
              }
            : {}
        }
        className={`flex-shrink-0 relative ${resolvedClassName}`}
      >
        {/* Container tracking natural idle float */}
        <motion.div className="w-full h-full" animate={floatControls}>
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="sprout-body" x1="20" y1="20" x2="80" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#D9F9E6" />
                <stop offset="100%" stopColor="#86EFAC" />
              </linearGradient>
              <linearGradient id="ring-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#A3E635" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
            </defs>

            {/* SPROUTY BODY */}
            {/* The droplet character squircle */}
            <path d="M 50 30 C 74 30 84 52 84 70 C 84 88 68 96 50 96 C 32 96 16 88 16 70 C 16 52 26 30 50 30 Z" fill="url(#sprout-body)" />

            {/* SPROUT STEM FLOWER (Leaf Wiggle Group) */}
            <motion.g animate={leafControls} style={{ transformOrigin: "50px 30px" }}>
              <path d="M 50 32 Q 48 18 56 12" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <path d="M 56 12 C 68 8 72 20 56 22 C 50 20 52 14 56 12 Z" fill="#22C55E"/>
            </motion.g>

            {/* BLUSH CHEEKS */}
            <circle cx="28" cy="70" r="5.5" fill="#4ADE80" opacity="0.6"/>
            <circle cx="72" cy="70" r="5.5" fill="#4ADE80" opacity="0.6"/>

            {/* EYES BLINK GROUP */}
            <motion.g animate={blinkControls} style={{ transformOrigin: "50px 60px" }}>
              {/* Eye Whites */}
              <circle cx="36" cy="62" r="8" fill="#FFFFFF"/>
              <circle cx="64" cy="62" r="8" fill="#FFFFFF"/>
              {/* Dark Pupils (XP Reaction target) */}
              <motion.circle cx="38" cy="62" r="4" fill="#064E3B" animate={pupilControls} style={{ transformOrigin: "38px 62px" }}/>
              <motion.circle cx="62" cy="62" r="4" fill="#064E3B" animate={pupilControls} style={{ transformOrigin: "62px 62px" }}/>
              {/* Gloss / Catchlight */}
              <circle cx="39" cy="60" r="1.5" fill="#FFFFFF"/>
              <circle cx="63" cy="60" r="1.5" fill="#FFFFFF"/>
            </motion.g>

            {/* SMILE */}
            <path d="M 46 72 Q 50 76 54 72" stroke="#064E3B" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

            {/* EQUIPPED SKIN OVERLAYS */}
            {skinLayers.map((layer) => (
              <g key={layer.key}>{layer.render()}</g>
            ))}

            {/* OUTER PROGRESS RING (XP Feedback) */}
            <motion.circle
              cx="50" cy="63" r="45"
              stroke="url(#ring-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={ringControls}
              style={{ rotate: -90, transformOrigin: "50px 63px" }}
            />

            {/* XP REACTIVE SPARKLE */}
            <motion.path
               d="M 85 20 Q 88 30 98 33 Q 88 36 85 46 Q 82 36 72 33 Q 82 30 85 20 Z"
               fill="#FEF08A"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={xpSparkleControls}
               style={{ transformOrigin: "85px 33px" }}
            />

          </svg>
        </motion.div>
      </motion.div>

      {/* TEXT COMPOSITING */}
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
          {showTagline && (
            <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#5E9F57] mt-0.5 opacity-90">
              Play for the Planet
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function EcoLoader({ className = "w-24 h-24", text = "Playing for the Planet..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAF7] gap-8 p-6">
      <div className={`relative ${className}`}>
        
        {/* Breathing Glow Aura behind mascot */}
        <motion.div
           className="absolute inset-0 rounded-full bg-emerald-400/25 blur-[18px]"
           animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
           transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Deep Bouncing Helicopter Loader Sprouty */}
        <motion.div
           className="w-full h-full relative z-10"
           animate={{ y: [0, -14, 0] }}
           transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-xl">
            <defs>
              <linearGradient id="load-body" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#A3E635" />
                <stop offset="100%" stopColor="#16A34A" />
              </linearGradient>
            </defs>

            {/* HELICOPTER SPINNING LEAF */}
            <motion.g 
              style={{ transformOrigin: "50px 30px" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.25, repeat: Infinity, ease: "linear" }}
            >
              {/* Center stem pole */}
              <line x1="50" y1="32" x2="50" y2="15" stroke="#14532D" strokeWidth="4" strokeLinecap="round" />
              {/* Blade 1 */}
              <path d="M 50 15 C 65 10 75 18 50 20 Z" fill="#BBF7D0"/>
              {/* Blade 2 */}
              <path d="M 50 15 C 35 10 25 18 50 20 Z" fill="#BBF7D0"/>
            </motion.g>

            {/* BODY */}
            <path d="M 50 30 C 74 30 84 52 84 70 C 84 88 68 96 50 96 C 32 96 16 88 16 70 C 16 52 26 30 50 30 Z" fill="url(#load-body)" opacity="0.95"/>
            
            <circle cx="28" cy="70" r="5" fill="#14532D" opacity="0.25"/>
            <circle cx="72" cy="70" r="5" fill="#14532D" opacity="0.25"/>

            {/* CLOSED HAPPY EYES (Loading concentration!) */}
            <path d="M 32 60 Q 36 55 40 60" stroke="#064E3B" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M 60 60 Q 64 55 68 60" stroke="#064E3B" strokeWidth="3" strokeLinecap="round" fill="none"/>

            <path d="M 46 70 Q 50 76 54 70" stroke="#064E3B" strokeWidth="3" strokeLinecap="round" fill="none"/>
          </svg>
        </motion.div>
      </div>

      <motion.div
         animate={{ opacity: [0.5, 1, 0.5], y: [0, -3, 0] }}
         transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
         className="flex flex-col items-center gap-1.5"
      >
         <span className="font-display font-bold text-2xl text-[#2D332F] tracking-tight">
            <span className="text-[#16A34A]">Eco</span>Quest
         </span>
         <span className="text-sm font-bold uppercase tracking-widest text-[#5E9F57]">{text}</span>
      </motion.div>
    </div>
  );
}

/**
 * A standalone quiz companion Sprouty.
 * Renders larger, centered, with a text caption below.
 * Accepts `mood` ("idle" | "correct" | "wrong") to trigger reactions.
 */
export function SproutyQuizBuddy({ mood = "idle", caption = "" }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <EcoLogo className="w-20 h-20" animated={true} mood={mood} />
      <AnimatePresence mode="wait">
        {caption && (
          <motion.p
            key={caption}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className={`text-sm font-bold text-center select-none ${
              mood === "correct" ? "text-emerald-600" : mood === "wrong" ? "text-gray-500" : "text-gray-600"
            }`}
          >
            {caption}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
