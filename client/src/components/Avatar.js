import { motion } from "framer-motion";
import { Sprout, BookOpen, Globe, Trophy } from "lucide-react";

const levelIcons = {
  beginner: Sprout,
  ecoscholar: BookOpen,
  ecohero: Globe,
  climatechampion: Trophy,
};

export default function Avatar({ name, points, level = "beginner", size = "md" }) {
  const sizes = { sm: "w-10 h-10", md: "w-14 h-14", lg: "w-20 h-20" };
  const iconSizes = { sm: "w-5 h-5", md: "w-7 h-7", lg: "w-10 h-10" };
  const Icon = levelIcons[level] || Sprout;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`
        flex items-center justify-center rounded-2xl
        bg-gradient-to-br from-eco-primary to-eco-primaryDark
        text-white shadow-soft
        ${sizes[size]}
      `}
      title={name}
    >
      <Icon className={iconSizes[size]} strokeWidth={2.5} />
    </motion.div>
  );
}
