import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import {
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  Star,
  Shield,
  Zap,
  Leaf,
  User as UserIcon,
  Crown,
  Gift,
  Clock,
  ChevronRight,
  TrendingUp,
  Package,
  Target,
} from "lucide-react";
import { Confetti } from "../components";
import { apiRequest } from "../api/httpClient";
import "./EcoStore.css";

/* ─── Category config ───────────────────────────────────── */
const CATEGORIES = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "creatures", label: "Eco Creatures", icon: Leaf },
  { key: "badges", label: "Badges", icon: Shield },
  { key: "power-ups", label: "Power-ups", icon: Zap },
  { key: "eco-rewards", label: "Eco Rewards", icon: Gift },
  { key: "avatars", label: "Hero Avatars", icon: UserIcon },
];

/* ─── Rarity config ─────────────────────────────────────── */
const RARITY = {
  common: {
    label: "Common",
    bg: "from-slate-400 to-slate-500",
    glow: "rgba(100,116,139,0.25)",
    glowSolid: "#94a3b8",
    badge: "bg-slate-100 text-slate-600",
    border: "border-slate-200",
    ring: "ring-slate-300/40",
  },
  rare: {
    label: "Rare",
    bg: "from-sky-400 to-blue-500",
    glow: "rgba(56,189,248,0.35)",
    glowSolid: "#38bdf8",
    badge: "bg-sky-100 text-sky-700",
    border: "border-sky-300",
    ring: "ring-sky-400/40",
  },
  epic: {
    label: "Epic",
    bg: "from-violet-400 to-purple-600",
    glow: "rgba(167,139,250,0.4)",
    glowSolid: "#a78bfa",
    badge: "bg-purple-100 text-purple-700",
    border: "border-purple-300",
    ring: "ring-purple-400/40",
  },
  legendary: {
    label: "Legendary",
    bg: "from-amber-400 to-orange-500",
    glow: "rgba(251,191,36,0.45)",
    glowSolid: "#fbbf24",
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-400",
    ring: "ring-amber-400/50",
  },
};

const PROGRESS_COLORS = {
  common: "from-slate-300 to-slate-500",
  rare: "from-sky-300 to-blue-500",
  epic: "from-violet-300 to-purple-600",
  legendary: "from-amber-300 to-orange-500",
};

/* ─── Audio Helper for Mystery Box ──────────────────────── */
const playMysterySound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch(e) {
    console.error("Audio playback failed", e);
  }
};

/* ─── XP deduction floating component ───────────────────── */
function XPDeductFloat({ amount, x, y }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.7 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -60, -100],
        scale: [0.7, 1.3, 1],
      }}
      transition={{ duration: 1.6, ease: "easeOut" }}
      className="eco-store-xp-deduct"
      style={{ left: x, top: y }}
    >
      −{amount} XP
    </motion.div>
  );
}

/* ─── Toast notification ────────────────────────────────── */
function Toast({ message, iconName, show, onDone }) {
  const IconCmp = Icons[iconName] || Icons.Gift;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          onAnimationComplete={() => {
            setTimeout(() => onDone?.(), 2800);
          }}
          className="eco-store-toast"
        >
          <span className="eco-store-toast-icon">
             <IconCmp className="w-5 h-5 text-white" />
          </span>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Reward Card Component ─────────────────────────────── */
function RewardCard({
  reward,
  userPoints,
  redeeming,
  onRedeem,
  index,
  featured = false,
  mystery = false,
}) {
  const canAfford = userPoints >= reward.pointsCost;
  const inStock = reward.stock === -1 || reward.stock > 0;
  const canRedeem = canAfford && inStock;
  const progressPct = Math.min(100, (userPoints / reward.pointsCost) * 100);
  const rarity = RARITY[reward.rarity] || RARITY.common;
  const progressGrad = PROGRESS_COLORS[reward.rarity] || PROGRESS_COLORS.common;
  
  const IconComponent = Icons[reward.icon] || Icons.Gift;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 260,
        damping: 28,
      }}
      whileHover={{ y: -8, scale: 1.03 }}
      className={[
        "eco-store-card",
        featured && "featured",
        mystery && "mystery",
        !canRedeem && "locked",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--glow": rarity.glow, "--glow-solid": rarity.glowSolid }}
    >
      {/* Locked overlay mapping visible XP requirement */}
      {!canRedeem && !mystery && (
        <div className="eco-store-locked-overlay">
          <Icons.Lock className="w-8 h-8 text-white mb-2 drop-shadow-md" />
          <span className="locked-text">Unlock at {reward.pointsCost.toLocaleString()} XP</span>
        </div>
      )}

      {/* Rarity stripe */}
      <div className={`eco-store-card-stripe bg-gradient-to-r ${rarity.bg}`} />

      {/* Featured badge */}
      {featured && (
        <div className="eco-store-featured-tag">
          <Star className="w-3 h-3" />
          Featured
        </div>
      )}

      {/* Mystery badge */}
      {mystery && (
        <div className="eco-store-mystery-tag">
          <Sparkles className="w-3 h-3" />
          Mystery
        </div>
      )}

      <div className="eco-store-card-body">
        {/* Icon circle with hover bounce */}
        <motion.div
          className={`eco-store-card-icon bg-gradient-to-br ${rarity.bg}`}
          style={{ boxShadow: `0 8px 28px ${rarity.glow}` }}
          whileHover={{ scale: 1.12, rotate: -5, y: -4 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <IconComponent className="w-10 h-10 text-white drop-shadow-md" strokeWidth={1.5} />
        </motion.div>

        {/* Rarity badge */}
        <span className={`eco-store-rarity ${rarity.badge}`}>
          <Crown className="w-3 h-3" />
          {rarity.label}
        </span>

        {/* Title & Description */}
        <h3 className="eco-store-card-title">{reward.name}</h3>
        <p className="eco-store-card-desc">{reward.description}</p>

        {/* Stock indicator */}
        {reward.stock !== -1 && (
          <p className="eco-store-card-stock">
            <Package className="w-3 h-3 inline-block mr-1" />
            {reward.stock > 0 ? `${reward.stock} left` : "Sold out"}
          </p>
        )}

        {/* ─── XP Progress Bar ─────────────────── */}
        {!canAfford && (
          <div className="eco-store-progress-wrap relative z-10">
            <div className="eco-store-progress-labels">
              <span>{userPoints.toLocaleString()} XP</span>
              <span>{reward.pointsCost.toLocaleString()} XP</span>
            </div>
            <div className="eco-store-progress-track">
              <motion.div
                className={`eco-store-progress-bar bg-gradient-to-r ${progressGrad}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>
        )}

        {/* Price + Redeem */}
        <div className="eco-store-card-footer relative z-10">
          <div className="eco-store-card-price">
            <Star className="w-4 h-4 text-amber-500" />
            <span>{reward.pointsCost.toLocaleString()}</span>
            <span className="eco-store-card-price-label">XP</span>
          </div>

          <motion.button
            whileHover={canRedeem ? { scale: 1.08 } : {}}
            whileTap={canRedeem ? { scale: 0.88 } : {}}
            onClick={(e) => onRedeem(reward, e)}
            disabled={!canRedeem || redeeming === reward._id}
            className={`eco-store-card-btn ${
              canRedeem ? "can-redeem" : "cannot-redeem"
            }`}
          >
            {redeeming === reward._id ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="eco-store-btn-spinner"
              />
            ) : canRedeem ? (
              <>
                <Gift className="w-4 h-4" /> Redeem
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" /> Earn XP
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ███  EcoStore — Main Component
   ═══════════════════════════════════════════════════════════ */
export default function EcoStore() {
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [redeeming, setRedeeming] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  // animation state
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", iconName: "" });
  const [xpFloat, setXpFloat] = useState(null);
  
  // Mystery Box Modal State
  const [mysteryResult, setMysteryResult] = useState(null);

  const navigate = useNavigate();

  /* ─── Fetch data ─────────────────────────── */
  const fetchData = useCallback(async () => {
    try {
      const [rewardsData, progData, redemptionsData] = await Promise.all([
        apiRequest("/api/rewards"),
        apiRequest("/api/leaderboard/progress"),
        apiRequest("/api/rewards/my-redemptions")
      ]);
      setRewards(Array.isArray(rewardsData) ? rewardsData : []);
      setUserPoints(progData?.student?.points ?? progData?.points ?? 0);
      setRedemptions(Array.isArray(redemptionsData) ? redemptionsData : []);
    } catch (err) {
      console.error("Failed to load store data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ─── Derived data ──────────────────────── */
  const nextUnlockXP = useMemo(() => {
    const lockedItems = rewards
      .filter((r) => r.pointsCost > userPoints)
      .sort((a, b) => a.pointsCost - b.pointsCost);
    return lockedItems.length > 0
      ? lockedItems[0].pointsCost - userPoints
      : 0;
  }, [rewards, userPoints]);

  const readyToUnlock = useMemo(() => {
    return rewards.filter((r) => {
      const inStock = r.stock === -1 || r.stock > 0;
      const affordable = userPoints >= r.pointsCost;
      const nearlyAffordable = !affordable && r.pointsCost - userPoints <= 50;
      return inStock && (affordable || nearlyAffordable);
    });
  }, [rewards, userPoints]);

  const featuredReward = useMemo(() => {
    const legendaries = rewards.filter(r => r.rarity === "legendary" && (r.stock === -1 || r.stock > 0));
    if (legendaries.length > 0) return legendaries[0];
    const epics = rewards.filter(r => r.rarity === "epic" && (r.stock === -1 || r.stock > 0));
    return epics.length > 0 ? epics[0] : null;
  }, [rewards]);

  /* ─── Collection Progress ────────────────── */
  const collectionProgress = useMemo(() => {
    if (activeCategory === "all" || activeCategory === "power-ups") return null;
    const catRewards = rewards.filter(r => r.category === activeCategory);
    if (catRewards.length === 0) return null;
    
    // Count unique redemptions for this category
    const redeemedIds = new Set(redemptions.map(r => r.reward?._id));
    const owned = catRewards.filter(r => redeemedIds.has(r._id)).length;
    
    return { owned, total: catRewards.length };
  }, [activeCategory, rewards, redemptions]);

  /* ─── Set Page Reset ─────────────────────── */
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  /* ─── Mystery Box (virtual item) ─────────── */
  const mysteryBox = useMemo(
    () => ({
      _id: "__mystery_box__",
      name: "Mystery Box",
      description: "Open for a random reward! Will it be common… or legendary?",
      pointsCost: 100,
      category: "mystery",
      icon: "PackageOpen",
      stock: -1,
      rarity: "rare",
    }),
    []
  );

  /* ─── Redeem handler ─────────────────────── */
  const handleRedeem = async (reward, event) => {
    if (redeeming) return;
    if (userPoints < reward.pointsCost) return;
    if (reward.stock !== -1 && reward.stock <= 0) return;

    const rect = event.currentTarget.getBoundingClientRect();

    let isMysteryBox = reward._id === "__mystery_box__";
    let targetReward = reward;
    
    // Randomize mystery box outcome
    if (isMysteryBox) {
      const eligible = rewards.filter(r => r.stock === -1 || r.stock > 0);
      if (eligible.length === 0) return;
      targetReward = eligible[Math.floor(Math.random() * eligible.length)];
    }

    setRedeeming(reward._id);
    try {
      const data = await apiRequest("/api/rewards/redeem", {
        method: "POST",
        body: { rewardId: targetReward._id },
        retries: 0,
      });

      // Update local state
      setUserPoints(data.updatedPoints ?? userPoints - reward.pointsCost);
      if (targetReward.stock !== -1) {
         setRewards((prev) => prev.map((r) => r._id === targetReward._id ? { ...r, stock: r.stock - 1 } : r));
      }
      
      // Add fake redemption temporarily to UI for collection logic speed
      setRedemptions(prev => [...prev, { reward: targetReward }]);

      // XP floating deduction
      setXpFloat({
        amount: reward.pointsCost,
        x: rect.left + rect.width / 2,
        y: rect.top,
        id: Date.now(),
      });

      if (isMysteryBox) {
        // Trigger Mystery Modal instead of usual toast
        playMysterySound();
        setMysteryResult(targetReward);
        setShowConfetti(true);
      } else {
        setShowConfetti(true);
        setToast({
          show: true,
          message: `You unlocked ${targetReward.name}`,
          iconName: targetReward.icon || "Gift",
        });
      }
      
      // Collection Completion check
      if(!isMysteryBox && targetReward.category) {
         const catRewards = rewards.filter(r => r.category === targetReward.category);
         const currentOwned = new Set(redemptions.map(r => r.reward?._id));
         currentOwned.add(targetReward._id); // include just bought
         const ownedCount = catRewards.filter(r => currentOwned.has(r._id)).length;
         if (ownedCount === catRewards.length && catRewards.length > 0) {
            setTimeout(() => {
               setToast({
                 show: true,
                 message: `Collection Complete! +500 XP Bonus!`,
                 iconName: "Award",
               });
               setUserPoints(prev => prev + 500);
            }, 3500); // Trigger after first toast
         }
      }

    } catch (err) {
      setToast({
        show: true,
        message: err.message || "Redemption failed",
        iconName: "XCircle",
      });
    } finally {
      setRedeeming(null);
    }
  };

  /* ─── Pagination & Filter ─────────────────────── */
  const filtered = activeCategory === "all" ? rewards : rewards.filter((r) => r.category === activeCategory);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedRewards = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="eco-store-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="eco-store-spinner"
        />
        <p className="mt-4 text-gray-500 font-semibold">Loading Eco Store…</p>
      </div>
    );
  }

  return (
    <>

      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />

      <AnimatePresence>
        {xpFloat && (
          <XPDeductFloat key={xpFloat.id} amount={xpFloat.amount} x={xpFloat.x} y={xpFloat.y} />
        )}
      </AnimatePresence>

      <Toast show={toast.show} message={toast.message} iconName={toast.iconName} onDone={() => setToast({ show: false })} />

      {/* ─── MYSTERY BOX MODAL ─── */}
      <AnimatePresence>
        {mysteryResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mystery-box-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`mystery-box-modal-content bg-gradient-to-br ${RARITY[mysteryResult.rarity]?.bg || RARITY.common.bg}`}
            >
              <h2 className="mystery-title">Mystery Reward Unlocked!</h2>
              {React.createElement(Icons[mysteryResult.icon] || Icons.Gift, { 
                className: "mystery-icon w-24 h-24 mb-4 text-white drop-shadow-lg" 
              })}
              <h3 className="text-3xl font-bold text-white mb-2">{mysteryResult.name}</h3>
              <p className="text-white/90 text-center mb-6 px-4">{mysteryResult.description}</p>
              <div className="bg-white/20 backdrop-blur-md rounded-full px-6 py-2 mb-8">
                 <span className="text-white font-bold uppercase tracking-wider">{mysteryResult.rarity}</span>
              </div>
              <button onClick={() => setMysteryResult(null)} className="mystery-close-btn">
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="eco-store-main">
        <div className="eco-store-container">
          
          {/* ─── HERO HEADER ─── */}
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eco-store-hero"
          >
            <div className="eco-store-hero-bg" />
            <div className="eco-store-hero-sparkles" aria-hidden>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="eco-store-sparkle"
                  animate={{ y: [0, -12, 0], opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                  style={{ left: `${12 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
                >
                  ✦
                </motion.span>
              ))}
            </div>

            <div className="eco-store-hero-content">
              <div>
                <div className="eco-store-hero-title-row">
                  <div className="eco-store-hero-icon">
                    <ShoppingBag className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <h1 className="eco-store-hero-title">Eco Store</h1>
                </div>
                <p className="eco-store-hero-sub">Use your XP to unlock awesome rewards! 🌟</p>
                {nextUnlockXP > 0 && (
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="eco-store-hero-motivate">
                    <Target className="w-4 h-4 inline-block mr-1" />
                    Earn <strong>{nextUnlockXP.toLocaleString()} more XP</strong> to unlock a new reward!
                  </motion.p>
                )}
              </div>
              <div className="eco-store-hero-right">
                <motion.div
                  className="eco-store-xp-badge"
                  animate={{ boxShadow: ["0 0 20px rgba(255,213,79,0.15)", "0 0 30px rgba(255,213,79,0.35)", "0 0 20px rgba(255,213,79,0.15)"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Star className="w-5 h-5" />
                  <span className="eco-store-xp-value">{userPoints.toLocaleString()}</span>
                  <span className="eco-store-xp-label">XP</span>
                </motion.div>
                <motion.button onClick={() => navigate("/redemption-history")} className="eco-store-history-btn">
                  <Clock className="w-4 h-4" /> History <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* ─── FEATURED REWARD ─── */}
          {featuredReward && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="eco-store-featured-section">
              <h2 className="eco-store-section-title"><Crown className="w-5 h-5 text-amber-500" /> Featured Reward</h2>
              <div className="eco-store-featured-grid">
                <RewardCard reward={featuredReward} userPoints={userPoints} redeeming={redeeming} onRedeem={handleRedeem} index={0} featured />
              </div>
            </motion.section>
          )}

          {/* ─── READY TO UNLOCK ─── */}
          {readyToUnlock.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="eco-store-ready-section">
              <h2 className="eco-store-section-title"><Sparkles className="w-5 h-5 text-emerald-500" /> Ready to Unlock</h2>
              <div className="eco-store-ready-scroll">
                {readyToUnlock.slice(0, 5).map((r, i) => (
                  <RewardCard key={r._id} reward={r} userPoints={userPoints} redeeming={redeeming} onRedeem={handleRedeem} index={i} />
                ))}
              </div>
            </motion.section>
          )}

          {/* ─── MYSTERY BOX ─── */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="eco-store-mystery-section">
            <h2 className="eco-store-section-title"><Gift className="w-5 h-5 text-violet-500" /> Mystery Box</h2>
            <div className="eco-store-mystery-grid">
              <RewardCard reward={mysteryBox} userPoints={userPoints} redeeming={redeeming} onRedeem={handleRedeem} index={0} mystery />
            </div>
          </motion.section>

          {/* ─── CATEGORY TABS ─── */}
          <motion.nav initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="eco-store-categories">
            {CATEGORIES.map(({ key, label, icon: Icon }) => {
              const active = activeCategory === key;
              const count = key === "all" ? rewards.length : rewards.filter((r) => r.category === key).length;
              return (
                <motion.button key={key} onClick={() => setActiveCategory(key)} className={`eco-store-cat-btn ${active ? "active" : ""}`}>
                  <Icon className="w-4 h-4" strokeWidth={2} />{label}
                  <span className={`eco-store-cat-count ${active ? "active" : ""}`}>{count}</span>
                </motion.button>
              );
            })}
          </motion.nav>

          {/* ─── COLLECTION SYSTEM PROGRESS ─── */}
          {collectionProgress && (
             <div className="eco-store-collection">
                <div className="collection-header">
                   <h3 className="collection-title">Collection Progress</h3>
                   <span className="collection-stats">{collectionProgress.owned} / {collectionProgress.total}</span>
                </div>
                <div className="collection-bar-bg">
                   <motion.div 
                     className="collection-bar-fill"
                     initial={{ width: 0 }}
                     animate={{ width: `${(collectionProgress.owned / collectionProgress.total) * 100}%` }}
                   />
                </div>
                {collectionProgress.owned === collectionProgress.total && (
                   <p className="collection-complete flex items-center justify-center gap-1"><Sparkles className="w-5 h-5 text-yellow-400" /> Collection Complete!</p>
                )}
             </div>
          )}

          {/* ─── ALL REWARDS GRID ─── */}
          <h2 className="eco-store-section-title grid-title"><ShoppingBag className="w-5 h-5 text-emerald-600" /> All Rewards</h2>
          <motion.div layout className="eco-store-grid">
            <AnimatePresence mode="popLayout">
              {paginatedRewards.map((reward, i) => (
                <RewardCard key={reward._id} reward={reward} userPoints={userPoints} redeeming={redeeming} onRedeem={handleRedeem} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* ─── PAGINATION CONTROLS ─── */}
          {totalPages > 1 && (
            <div className="eco-store-pagination">
              <button 
                className="pagination-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                 <ArrowLeft className="w-4 h-4" /> Prev
              </button>
              <div className="pagination-numbers">
                 Page {currentPage} of {totalPages}
              </div>
              <button 
                className="pagination-btn" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                 Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {paginatedRewards.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="eco-store-empty">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold">No rewards in this category yet.</p>
            </motion.div>
          )}

          <motion.button onClick={() => navigate("/dashboard")} className="eco-store-back-btn">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </motion.button>
        </div>
      </main>
    </>
  );
}
