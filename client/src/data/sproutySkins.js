import React from "react";

/**
 * Sprouty Skins Registry
 * Each skin is a pure SVG overlay rendered inside viewBox="0 0 100 100".
 * The `render` function returns JSX that layers on top of Sprouty's base body.
 */

// ─── HATS ────────────────────────────────────────────────
const HATS = [
  {
    id: "party-hat",
    name: "Party Hat",
    type: "hat",
    rarity: "common",
    costXP: 150,
    icon: "PartyPopper",
    render: () => (
      <g>
        <path d="M 50 5 L 40 28 L 60 28 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5"/>
        <circle cx="50" cy="5" r="3" fill="#EF4444"/>
        <path d="M 38 28 L 62 28" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
      </g>
    ),
  },
  {
    id: "explorer-hat",
    name: "Explorer Hat",
    type: "hat",
    rarity: "rare",
    costXP: 350,
    icon: "Compass",
    render: () => (
      <g>
        <ellipse cx="50" cy="26" rx="22" ry="5" fill="#92400E" />
        <path d="M 35 26 C 35 14 65 14 65 26" fill="#A16207"/>
        <path d="M 35 26 L 32 28 L 68 28 L 65 26" fill="#92400E"/>
      </g>
    ),
  },
  {
    id: "crown",
    name: "Royal Crown",
    type: "hat",
    rarity: "legendary",
    costXP: 800,
    icon: "Crown",
    render: () => (
      <g>
        <path d="M 34 28 L 37 12 L 43 22 L 50 8 L 57 22 L 63 12 L 66 28 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
        <rect x="34" y="26" width="32" height="5" rx="2" fill="#F59E0B"/>
        <circle cx="43" cy="14" r="2" fill="#EF4444"/>
        <circle cx="50" cy="10" r="2.5" fill="#3B82F6"/>
        <circle cx="57" cy="14" r="2" fill="#22C55E"/>
      </g>
    ),
  },
  {
    id: "leaf-crown",
    name: "Nature Crown",
    type: "hat",
    rarity: "epic",
    costXP: 500,
    icon: "Leaf",
    render: () => (
      <g>
        <path d="M 32 28 C 30 18 42 12 50 10 C 58 12 70 18 68 28" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round"/>
        <path d="M 36 22 C 38 16 34 14 36 22 Z" fill="#22C55E"/>
        <path d="M 50 12 C 52 6 48 6 50 12 Z" fill="#22C55E"/>
        <path d="M 64 22 C 62 16 66 14 64 22 Z" fill="#22C55E"/>
      </g>
    ),
  },
];

// ─── ACCESSORIES ─────────────────────────────────────────
const ACCESSORIES = [
  {
    id: "round-glasses",
    name: "Round Glasses",
    type: "accessory",
    rarity: "common",
    costXP: 120,
    icon: "Glasses",
    render: () => (
      <g>
        <circle cx="36" cy="62" r="10" fill="none" stroke="#334155" strokeWidth="2"/>
        <circle cx="64" cy="62" r="10" fill="none" stroke="#334155" strokeWidth="2"/>
        <path d="M 46 62 L 54 62" stroke="#334155" strokeWidth="2"/>
      </g>
    ),
  },
  {
    id: "star-badge",
    name: "Star Badge",
    type: "accessory",
    rarity: "rare",
    costXP: 300,
    icon: "Star",
    render: () => (
      <g>
        <path d="M 75 75 L 77 80 L 82 80 L 78 83 L 80 88 L 75 85 L 70 88 L 72 83 L 68 80 L 73 80 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="0.8"/>
      </g>
    ),
  },
  {
    id: "bow-tie",
    name: "Bow Tie",
    type: "accessory",
    rarity: "common",
    costXP: 100,
    icon: "Ribbon",
    render: () => (
      <g>
        <path d="M 42 80 L 50 76 L 58 80 L 50 84 Z" fill="#EF4444"/>
        <circle cx="50" cy="80" r="2.5" fill="#FCA5A5"/>
      </g>
    ),
  },
  {
    id: "scarf",
    name: "Eco Scarf",
    type: "accessory",
    rarity: "epic",
    costXP: 450,
    icon: "Wind",
    render: () => (
      <g>
        <path d="M 25 78 Q 50 72 75 78 Q 50 84 25 78 Z" fill="#86EFAC" opacity="0.85"/>
        <path d="M 70 78 Q 75 85 72 92" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" fill="none"/>
      </g>
    ),
  },
];

// ─── EFFECTS ─────────────────────────────────────────────
const EFFECTS = [
  {
    id: "sparkle-aura",
    name: "Sparkle Aura",
    type: "effect",
    rarity: "rare",
    costXP: 400,
    icon: "Sparkles",
    render: () => (
      <g opacity="0.8">
        <circle cx="15" cy="45" r="2" fill="#FEF08A"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/></circle>
        <circle cx="85" cy="50" r="1.5" fill="#FEF08A"><animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="0.4s" repeatCount="indefinite"/></circle>
        <circle cx="20" cy="80" r="1.5" fill="#FEF08A"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.8s" repeatCount="indefinite"/></circle>
        <circle cx="80" cy="35" r="2" fill="#FEF08A"><animate attributeName="opacity" values="0;1;0" dur="1.6s" begin="1s" repeatCount="indefinite"/></circle>
      </g>
    ),
  },
  {
    id: "leaf-trail",
    name: "Leaf Trail",
    type: "effect",
    rarity: "common",
    costXP: 200,
    icon: "TreePine",
    render: () => (
      <g opacity="0.7">
        <path d="M 10 90 C 14 86 12 84 10 90 Z" fill="#4ADE80"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/></path>
        <path d="M 88 85 C 92 81 90 79 88 85 Z" fill="#86EFAC"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.5s" begin="0.5s" repeatCount="indefinite"/></path>
        <path d="M 8 70 C 12 66 10 64 8 70 Z" fill="#BBF7D0"><animate attributeName="opacity" values="0.2;0.7;0.2" dur="2.8s" begin="1s" repeatCount="indefinite"/></path>
      </g>
    ),
  },
  {
    id: "rainbow-glow",
    name: "Rainbow Glow",
    type: "effect",
    rarity: "legendary",
    costXP: 900,
    icon: "Rainbow",
    render: () => (
      <g>
        <circle cx="50" cy="63" r="46" fill="none" strokeWidth="3" opacity="0.35">
          <animate attributeName="stroke" values="#EF4444;#F59E0B;#22C55E;#3B82F6;#8B5CF6;#EF4444" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.2;0.45;0.2" dur="2.5s" repeatCount="indefinite"/>
        </circle>
      </g>
    ),
  },
  {
    id: "eco-shield",
    name: "Eco Shield",
    type: "effect",
    rarity: "epic",
    costXP: 600,
    icon: "Shield",
    render: () => (
      <g>
        <path d="M 50 8 C 30 15 12 30 12 55 C 12 80 50 98 50 98 C 50 98 88 80 88 55 C 88 30 70 15 50 8 Z" fill="none" stroke="#22C55E" strokeWidth="2" opacity="0.3">
          <animate attributeName="opacity" values="0.15;0.35;0.15" dur="3s" repeatCount="indefinite"/>
        </path>
      </g>
    ),
  },
];

// ─── EVOLUTIONS ──────────────────────────────────────────
const EVOLUTIONS = [
  {
    id: "golden-sprouty",
    name: "Golden Sprouty",
    type: "evolution",
    rarity: "legendary",
    costXP: 1000,
    icon: "Sun",
    // Override the body fill gradient
    bodyGradient: ["#FEF08A", "#F59E0B"],
    render: () => (
      <g>
        <path d="M 50 30 C 74 30 84 52 84 70 C 84 88 68 96 50 96 C 32 96 16 88 16 70 C 16 52 26 30 50 30 Z" fill="url(#evo-golden)" opacity="0.8"/>
        <defs>
          <linearGradient id="evo-golden" x1="20" y1="20" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
  {
    id: "ocean-sprouty",
    name: "Ocean Sprouty",
    type: "evolution",
    rarity: "epic",
    costXP: 700,
    icon: "Waves",
    bodyGradient: ["#BAE6FD", "#0EA5E9"],
    render: () => (
      <g>
        <path d="M 50 30 C 74 30 84 52 84 70 C 84 88 68 96 50 96 C 32 96 16 88 16 70 C 16 52 26 30 50 30 Z" fill="url(#evo-ocean)" opacity="0.8"/>
        <defs>
          <linearGradient id="evo-ocean" x1="20" y1="20" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
  {
    id: "fire-sprouty",
    name: "Fire Sprouty",
    type: "evolution",
    rarity: "epic",
    costXP: 700,
    icon: "Flame",
    bodyGradient: ["#FED7AA", "#F97316"],
    render: () => (
      <g>
        <path d="M 50 30 C 74 30 84 52 84 70 C 84 88 68 96 50 96 C 32 96 16 88 16 70 C 16 52 26 30 50 30 Z" fill="url(#evo-fire)" opacity="0.8"/>
        <defs>
          <linearGradient id="evo-fire" x1="20" y1="20" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
  {
    id: "crystal-sprouty",
    name: "Crystal Sprouty",
    type: "evolution",
    rarity: "legendary",
    costXP: 1200,
    icon: "Diamond",
    bodyGradient: ["#E0E7FF", "#818CF8"],
    render: () => (
      <g>
        <path d="M 50 30 C 74 30 84 52 84 70 C 84 88 68 96 50 96 C 32 96 16 88 16 70 C 16 52 26 30 50 30 Z" fill="url(#evo-crystal)" opacity="0.8"/>
        <defs>
          <linearGradient id="evo-crystal" x1="20" y1="20" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EEF2FF" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
];

// ─── COMBINED REGISTRY ───────────────────────────────────
export const SPROUTY_SKINS = [...HATS, ...ACCESSORIES, ...EFFECTS, ...EVOLUTIONS];

export const SKIN_CATEGORIES = [
  { key: "hat", label: "Hats", icon: "Crown" },
  { key: "accessory", label: "Accessories", icon: "Gem" },
  { key: "effect", label: "Effects", icon: "Sparkles" },
  { key: "evolution", label: "Evolutions", icon: "Zap" },
];

export function getSkinById(id) {
  return SPROUTY_SKINS.find((s) => s.id === id) || null;
}

export function getSkinsByType(type) {
  return SPROUTY_SKINS.filter((s) => s.type === type);
}

export const RARITY_COLORS = {
  common: { border: "#9CA3AF", bg: "bg-gray-100", text: "text-gray-700", glow: "" },
  rare: { border: "#3B82F6", bg: "bg-blue-50", text: "text-blue-700", glow: "shadow-[0_0_12px_rgba(59,130,246,0.35)]" },
  epic: { border: "#8B5CF6", bg: "bg-purple-50", text: "text-purple-700", glow: "shadow-[0_0_12px_rgba(139,92,246,0.35)]" },
  legendary: { border: "#F59E0B", bg: "bg-amber-50", text: "text-amber-700", glow: "shadow-[0_0_16px_rgba(245,158,11,0.45)]" },
};
