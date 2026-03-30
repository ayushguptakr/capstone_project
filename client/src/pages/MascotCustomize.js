import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as AllIcons from "lucide-react";
import { Shuffle, Lock, Check, ShoppingBag, ArrowLeft } from "lucide-react";
import { EcoLogo } from "../components";
import { SPROUTY_SKINS, SKIN_CATEGORIES, getSkinsByType, RARITY_COLORS } from "../data/sproutySkins";
import { getStoredUser } from "../utils/authStorage";
import { apiRequest } from "../api/httpClient";
import "./MascotCustomize.css";

function MascotCustomize() {
  const navigate = useNavigate();
  const [user] = useState(() => getStoredUser());
  const [activeTab, setActiveTab] = useState("hat");
  const [equippedSkins, setEquippedSkins] = useState({
    hat: null, accessory: null, effect: null, evolution: null,
  });
  const [ownedSkinIds, setOwnedSkinIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [previewOverride, setPreviewOverride] = useState(null);

  // Load user data and owned skins
  useEffect(() => {
    if (!user) { navigate("/login", { replace: true }); return; }

    const load = async () => {
      try {
        const [meData, redemptionData] = await Promise.all([
          apiRequest("/api/auth/me"),
          apiRequest("/api/rewards/redemptions"),
        ]);
        if (meData?.user?.equippedSkins) {
          setEquippedSkins(meData.user.equippedSkins);
        }
        // Build set of owned skin IDs from redemption history
        const owned = new Set();
        const redemptions = Array.isArray(redemptionData) ? redemptionData : (redemptionData?.redemptions || []);
        for (const r of redemptions) {
          const reward = r.reward || r;
          if (reward?.category === "skins" && reward?.icon) {
            // Match reward icon to skin id
            const matchingSkin = SPROUTY_SKINS.find(s => s.icon === reward.icon || s.name === reward.name);
            if (matchingSkin) owned.add(matchingSkin.id);
          }
        }
        // Also mark all common skins as owned by default (starter kit)
        SPROUTY_SKINS.filter(s => s.rarity === "common").forEach(s => owned.add(s.id));
        setOwnedSkinIds(owned);
      } catch (e) {
        console.error("Failed to load mascot data:", e);
        // Still give common skins
        const owned = new Set();
        SPROUTY_SKINS.filter(s => s.rarity === "common").forEach(s => owned.add(s.id));
        setOwnedSkinIds(owned);
      }
    };
    load();
  }, [user, navigate]);

  const handleEquip = useCallback(async (skinId, type) => {
    if (saving) return;
    const isCurrentlyEquipped = equippedSkins[type] === skinId;
    const newSkinId = isCurrentlyEquipped ? null : skinId;

    setSaving(true);
    setPreviewOverride(null);
    try {
      const data = await apiRequest("/api/auth/skins", {
        method: "PUT",
        body: { category: type, skinId: newSkinId },
      });
      const updatedSkins = data?.user?.equippedSkins || { ...equippedSkins, [type]: newSkinId };
      setEquippedSkins(updatedSkins);
      // Sync to localStorage
      const storedUser = getStoredUser();
      if (storedUser) {
        storedUser.equippedSkins = updatedSkins;
        localStorage.setItem("user", JSON.stringify(storedUser));
      }
    } catch (e) {
      console.error("Failed to update skin:", e);
    } finally {
      setSaving(false);
    }
  }, [equippedSkins, saving]);

  const handleRandomize = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    const newSkins = { ...equippedSkins };
    for (const cat of ["hat", "accessory", "effect", "evolution"]) {
      const available = getSkinsByType(cat).filter(s => ownedSkinIds.has(s.id));
      if (available.length > 0) {
        const pick = available[Math.floor(Math.random() * available.length)];
        newSkins[cat] = pick.id;
        try {
          await apiRequest("/api/auth/skins", {
            method: "PUT",
            body: { category: cat, skinId: pick.id },
          });
        } catch (e) { /* continue */ }
      }
    }
    setEquippedSkins(newSkins);
    const storedUser = getStoredUser();
    if (storedUser) {
      storedUser.equippedSkins = newSkins;
      localStorage.setItem("user", JSON.stringify(storedUser));
    }
    setSaving(false);
  }, [equippedSkins, ownedSkinIds, saving]);

  const currentTabSkins = useMemo(() => getSkinsByType(activeTab), [activeTab]);

  // Preview: show hovered skin temporarily
  const previewSkins = useMemo(() => {
    if (previewOverride) {
      return { ...equippedSkins, [previewOverride.type]: previewOverride.id };
    }
    return equippedSkins;
  }, [equippedSkins, previewOverride]);

  const points = user?.points || 0;

  return (
    <div className="mascot-customize">


      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#2D332F]">
            Customize <span className="text-[#16A34A]">Sprouty</span>
          </h1>
          <p className="text-gray-600 mt-2 text-lg font-body">
            Equip hats, accessories, effects & evolutions
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-8">
          {/* Live Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="preview-card flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-200/30 blur-[30px]" />
              <EcoLogo
                className="w-48 h-48"
                animated={true}
                equippedSkins={previewSkins}
              />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-xl text-[#2D332F]">
                {user?.name || "Eco Hero"}'s Sprouty
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {Object.values(equippedSkins).filter(Boolean).length} items equipped
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRandomize}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-bold text-sm shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" /> Randomize Look
            </motion.button>
          </motion.div>

          {/* Skin Browser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {/* Category Tabs */}
            <div className="category-tabs mb-6">
              {SKIN_CATEGORIES.map((cat) => {
                const Icon = AllIcons[cat.icon] || AllIcons.Sparkles;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveTab(cat.key)}
                    className={`category-tab ${activeTab === cat.key ? "active" : ""}`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2.2} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Skin Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="skin-grid"
              >
                {currentTabSkins.map((skin) => {
                  const isOwned = ownedSkinIds.has(skin.id);
                  const isEquipped = equippedSkins[skin.type] === skin.id;
                  const rarityStyle = RARITY_COLORS[skin.rarity] || RARITY_COLORS.common;
                  const SkinIcon = AllIcons[skin.icon] || AllIcons.Gift;

                  return (
                    <motion.div
                      key={skin.id}
                      whileHover={isOwned ? { scale: 1.04, y: -4 } : {}}
                      onMouseEnter={() => isOwned && setPreviewOverride({ id: skin.id, type: skin.type })}
                      onMouseLeave={() => setPreviewOverride(null)}
                      className={`skin-card ${isEquipped ? "equipped" : ""} ${!isOwned ? "locked" : ""} ${rarityStyle.glow}`}
                      style={{ borderColor: isEquipped ? "#22C55E" : rarityStyle.border + "55" }}
                    >
                      {/* Equipped badge */}
                      {isEquipped && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}

                      {/* Lock overlay */}
                      {!isOwned && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
                          <Lock className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}

                      {/* Preview icon */}
                      <div className="skin-preview-box" style={{ borderColor: rarityStyle.border + "33" }}>
                        <SkinIcon className="w-8 h-8" style={{ color: rarityStyle.border }} strokeWidth={1.8} />
                      </div>

                      {/* Name */}
                      <p className="font-display font-bold text-xs text-[#2D332F] leading-tight">{skin.name}</p>

                      {/* Rarity badge */}
                      <span
                        className={`rarity-badge ${rarityStyle.bg} ${rarityStyle.text}`}
                        style={{ border: `1px solid ${rarityStyle.border}33` }}
                      >
                        {skin.rarity}
                      </span>

                      {/* Action button */}
                      {isOwned ? (
                        <button
                          onClick={() => handleEquip(skin.id, skin.type)}
                          disabled={saving}
                          className={`equip-btn ${isEquipped ? "unequip" : "equip"}`}
                        >
                          {isEquipped ? "Unequip" : "Equip"}
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate("/store")}
                          className="equip-btn locked-btn inline-flex items-center justify-center gap-1"
                        >
                          <ShoppingBag className="w-3 h-3" /> {skin.costXP} XP
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default MascotCustomize;
