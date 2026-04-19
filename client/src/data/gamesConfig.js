/**
 * gamesConfig.js — Central registry for all EcoQuest mini-games.
 * Used by MiniGames hub and GamePlayer for dynamic routing.
 */
const gamesConfig = [
  {
    id: "eco-memory",
    name: "Eco Memory Match",
    desc: "Match pairs of eco-icons and learn cool nature facts with every match!",
    difficulty: "easy",
    duration: "3-5 min",
    xp: 350,
    categories: ["learning", "quick"],
    section: "trending",
    gradient: "from-violet-500 to-indigo-600",
    playable: true,
    unlockLevel: 1,
    ecoImpact: { type: "trees", value: 0.02, label: "0.02 trees saved" },
    route: "/mini-game/eco-memory"
  },
  {
    id: "waste-sorting",
    name: "Sort & Recycle",
    desc: "Sort waste items into the right bins — recycle, compost, or landfill!",
    difficulty: "medium",
    duration: "2-4 min",
    xp: 450,
    categories: ["action", "quick"],
    section: "trending",
    gradient: "from-emerald-500 to-teal-600",
    playable: true,
    unlockLevel: 1,
    ecoImpact: { type: "waste", value: 1.2, label: "1.2 kg waste diverted" },
    route: "/mini-game/waste-sorting"
  },
  {
    id: "trivia-race",
    name: "Eco Word Scramble",
    desc: "Unscramble environmental words and discover amazing eco-facts!",
    difficulty: "hard",
    duration: "4-6 min",
    xp: 600,
    categories: ["quiz", "learning"],
    section: "learn",
    gradient: "from-amber-500 to-orange-600",
    playable: true,
    unlockLevel: 1,
    ecoImpact: { type: "co2", value: 0.5, label: "0.5 kg CO₂ awareness" },
    route: "/mini-game/trivia-race"
  },
  {
    id: "climate-hero",
    name: "Eco Chain Reaction",
    desc: "Connect environmental causes to real-world effects — learn how everything is linked!",
    difficulty: "medium",
    duration: "3-5 min",
    xp: 525,
    categories: ["learning", "action"],
    section: "learn",
    gradient: "from-sky-500 to-blue-600",
    playable: true,
    unlockLevel: 1,
    ecoImpact: { type: "water", value: 5, label: "5L water knowledge" },
    route: "/mini-game/climate-hero"
  },
  {
    id: "plant-growth",
    name: "Carbon Footprint Quiz",
    desc: "Guess the CO₂ impact of daily activities — can you estimate like a climate scientist?",
    difficulty: "medium",
    duration: "3-5 min",
    xp: 450,
    categories: ["quiz", "learning"],
    section: "quick",
    gradient: "from-lime-500 to-green-600",
    playable: true,
    unlockLevel: 1,
    ecoImpact: { type: "co2", value: 0.8, label: "0.8 kg CO₂ tracked" },
    route: "/mini-game/plant-growth"
  },
  {
    id: "ecosystem-builder",
    name: "Ecosystem Builder",
    desc: "Build a balanced ecosystem by choosing species — learn what makes nature thrive!",
    difficulty: "easy",
    duration: "2-4 min",
    xp: 400,
    categories: ["learning"],
    section: "learn",
    gradient: "from-cyan-500 to-teal-600",
    playable: false,
    unlockLevel: 5,
    ecoImpact: { type: "trees", value: 0.05, label: "0.05 trees planted" },
    route: null
  },
  {
    id: "eco-speed-round",
    name: "Eco Speed Round",
    desc: "Quick-fire eco challenges for rapid XP boosts and reflex training.",
    difficulty: "medium",
    duration: "1-3 min",
    xp: 275,
    categories: ["quick", "action"],
    section: "quick",
    gradient: "from-rose-500 to-pink-600",
    playable: false,
    unlockLevel: 8,
    ecoImpact: { type: "waste", value: 0.3, label: "0.3 kg waste awareness" },
    route: null
  },
  {
    id: "eco-habit",
    name: "Eco Habit Challenge",
    desc: "Test your sustainability IQ through real-life scenarios with streak multipliers!",
    difficulty: "medium",
    duration: "3-5 min",
    xp: 500,
    categories: ["quiz", "learning", "quick"],
    section: "trending",
    gradient: "from-emerald-500 to-green-600",
    playable: true,
    unlockLevel: 1,
    ecoImpact: { type: "co2", value: 1.5, label: "1.5 kg CO₂ awareness" },
    route: "/mini-game/eco-habit"
  }
];

export default gamesConfig;
