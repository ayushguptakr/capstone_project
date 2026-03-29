import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, Recycle, Brain, Globe, Zap, Sprout, BarChart3, Clock3, ArrowRight } from "lucide-react";
import { Badge, EcoQuestNav, IconBox } from "../components";
import useFeedback from "../hooks/useFeedback";
import useSound from "../hooks/useSound";

const games = [
  { id: "eco-memory", Icon: Brain, name: "Eco Memory Match", desc: "Match pairs of eco-icons and learn cool nature facts with every match!", difficulty: "easy", duration: "3-5 min", xpRange: "200-500 XP", playable: true },
  { id: "waste-sorting", Icon: Recycle, name: "Sort & Recycle", desc: "Sort waste items into the right bins - recycle, compost, or landfill!", difficulty: "medium", duration: "2-4 min", xpRange: "300-600 XP", playable: true },
  { id: "trivia-race", Icon: Zap, name: "Eco Word Scramble", desc: "Unscramble environmental words and discover amazing eco-facts!", difficulty: "hard", duration: "4-6 min", xpRange: "400-800 XP", playable: true },
  { id: "climate-hero", Icon: Globe, name: "Eco Chain Reaction", desc: "Connect environmental causes to real-world effects - learn how everything is linked!", difficulty: "medium", duration: "3-5 min", xpRange: "350-700 XP", playable: true },
  { id: "plant-growth", Icon: Sprout, name: "Carbon Footprint Quiz", desc: "Guess the CO₂ impact of daily activities - can you estimate like a climate scientist?", difficulty: "medium", duration: "3-5 min", xpRange: "300-600 XP", playable: true },
  { id: "ecosystem-builder", Icon: Sprout, name: "Ecosystem Builder", desc: "Build a balanced ecosystem by choosing species - learn what makes nature thrive!", difficulty: "easy", duration: "2-4 min", xpRange: "250-550 XP", playable: false },
  { id: "eco-speed-round", Icon: Zap, name: "Eco Speed Round", desc: "Quick-fire eco challenges for rapid XP boosts and reflex training.", difficulty: "medium", duration: "1-3 min", xpRange: "150-400 XP", playable: false },
];

function MiniGames() {
  const navigate = useNavigate();
  const { triggerXPFromEvent } = useFeedback();
  const { playClick } = useSound();

  const xpFromRange = (range) => {
    const m = String(range).match(/(\d+)\s*-\s*(\d+)/);
    if (!m) return 15;
    return Math.round((Number(m[1]) + Number(m[2])) / 40);
  };

  return (
    <div className="min-h-screen bg-[#F6FAF6] pb-20">
      <EcoQuestNav variant="app" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <div>
            <h1 className="font-display font-bold text-3xl text-[#1f2d26] flex items-center gap-2">
              <IconBox color="yellow" size="sm">
                <Gamepad2 className="w-5 h-5" strokeWidth={2} />
              </IconBox>
              Eco Mini-Games
            </h1>
            <p className="text-gray-600 mt-1">Play, learn, and collect XP like the reference design.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {games.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.015, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!g.playable) return;
                playClick();
                navigate(`/mini-game/${g.id}`);
              }}
              className={`bg-white rounded-3xl p-6 border cursor-pointer flex flex-col transition ${
                g.playable ? "border-eco-pale hover:shadow-card-hover" : "border-slate-200 opacity-70"
              }`}
            >
              <IconBox color={g.playable ? "green" : "blue"} size="lg" className="mb-3 rounded-2xl">
                <g.Icon className="w-10 h-10" strokeWidth={2} />
              </IconBox>
              <h3 className="font-display font-bold text-lg text-gray-800 mb-1">{g.name}</h3>
              <p className="text-gray-500 text-sm mb-4 flex-1">{g.desc}</p>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={g.difficulty}>{g.difficulty}</Badge>
                <span className="font-semibold text-eco-primary">{g.xpRange}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="w-3.5 h-3.5" />
                  {g.duration}
                </span>
                <span>{g.playable ? "Available now" : "Coming soon"}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!g.playable) return;
                  playClick();
                  triggerXPFromEvent(xpFromRange(g.xpRange), e);
                  navigate(`/mini-game/${g.id}`);
                }}
                disabled={!g.playable}
                className={`mt-auto w-full py-3 rounded-2xl font-bold inline-flex items-center justify-center gap-2 ${
                  g.playable ? "bg-eco-primary text-white" : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              >
                {g.playable ? (
                  <>
                    Play Now <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  "Coming Soon"
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            playClick();
            navigate("/game-history");
          }}
          className="mt-6 w-full py-3 rounded-2xl border-2 border-eco-secondary text-eco-secondary font-semibold inline-flex items-center justify-center gap-2"
        >
          <BarChart3 className="w-5 h-5" /> View Game History
        </motion.button>
      </div>
    </div>
  );
}

export default MiniGames;
