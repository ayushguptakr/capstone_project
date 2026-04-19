import React, { createContext, useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";
import useSound from "../../hooks/useSound";
import useXPAnimation from "../../hooks/useXPAnimation";
import XPFloat from "../XPFloat";
import { getXPPositionFromEvent } from "../../utils/xpPosition";
import { fetchGamificationMe, syncGamificationActivity } from "../../api/gamificationApi";

export const FeedbackContext = createContext(null);

function burstConfetti(strong = false) {
  const base = {
    spread: strong ? 65 : 42,
    startVelocity: strong ? 36 : 28,
    ticks: strong ? 160 : 110,
    scalar: strong ? 0.9 : 0.7,
    colors: ["#4CAF50", "#FFD54F", "#4FC3F7"],
  };
  confetti({ ...base, particleCount: strong ? 70 : 36, origin: { x: 0.44, y: 0.55 } });
  confetti({ ...base, particleCount: strong ? 70 : 36, origin: { x: 0.56, y: 0.55 } });
}

export default function FeedbackProvider({ children }) {
  const { playXP, playSuccess, playBadge, playLevelUp } = useSound();
  const [levelOverlay, setLevelOverlay] = useState(false);
  const [badgeOverlay, setBadgeOverlay] = useState(null);
  const { xpItems, showXP } = useXPAnimation();
  const lastStreakSyncRef = useRef(0);

  const syncStreakFromServer = useCallback(async () => {
    const now = Date.now();
    if (now - lastStreakSyncRef.current < 3000) return;
    lastStreakSyncRef.current = now;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await syncGamificationActivity();
      const data = await fetchGamificationMe({ limit: 1, offset: 0 });
      const streak = Number(data?.summary?.streakCurrent || 0);
      localStorage.setItem("ecoStreak", String(streak));
      window.dispatchEvent(new CustomEvent("ecoquest:streak-updated", { detail: { streak } }));
    } catch {
      // Never block interaction feedback.
    }
  }, []);

  const triggerXP = useCallback(
    (amount = 0, position) => {
      playXP();
      showXP(amount, position);
      syncStreakFromServer();
    },
    [playXP, showXP, syncStreakFromServer]
  );

  const triggerXPFromEvent = useCallback(
    (amount = 0, event, fallback) => {
      triggerXP(amount, getXPPositionFromEvent(event, fallback));
    },
    [triggerXP]
  );

  const triggerBadgeUnlock = useCallback(
    (badge) => {
      playBadge();
      burstConfetti(false);
      setBadgeOverlay({ title: badge.title || "Badge", Icon: badge.Icon });
      window.setTimeout(() => setBadgeOverlay(null), 3500);
      return badge;
    },
    [playBadge]
  );

  const triggerLevelUp = useCallback(() => {
    playLevelUp();
    setLevelOverlay(true);
    burstConfetti(true);
    window.setTimeout(() => setLevelOverlay(false), 1400);
  }, [playLevelUp]);

  const triggerSuccess = useCallback(() => {
    playSuccess();
  }, [playSuccess]);

  const value = useMemo(
    () => ({ triggerXP, triggerXPFromEvent, triggerBadgeUnlock, triggerLevelUp, triggerSuccess }),
    [triggerXP, triggerXPFromEvent, triggerBadgeUnlock, triggerLevelUp, triggerSuccess]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-0 z-[9999]">
        <AnimatePresence>
          {xpItems.map((t) => (
            <XPFloat key={t.id} amount={t.amount} x={t.x} y={t.y} />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {levelOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[2px]"
            >
              <motion.div
                initial={{ y: 14, scale: 0.95, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: -8, scale: 0.98, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="rounded-3xl bg-white/85 border border-white/80 px-8 py-5 shadow-[0_24px_72px_-24px_rgba(16,185,129,0.45)]"
              >
                <p className="text-2xl font-display font-bold text-emerald-700 flex items-center justify-center gap-2">Level Up! <PartyPopper className="w-6 h-6 text-yellow-500" /></p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {badgeOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[2px]"
            >
              <motion.div
                initial={{ y: 20, scale: 0.9, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: -10, scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="rounded-3xl bg-white/90 border border-white/80 px-8 py-6 shadow-[0_24px_72px_-24px_rgba(16,185,129,0.55)]"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center border border-emerald-200">
                    {badgeOverlay.Icon ? <badgeOverlay.Icon className="w-7 h-7 text-emerald-600" /> : <PartyPopper className="w-7 h-7 text-emerald-600" />}
                  </div>
                  <p className="text-xl font-display font-bold text-gray-800 text-center">
                    You unlocked {badgeOverlay.title}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FeedbackContext.Provider>
  );
}
