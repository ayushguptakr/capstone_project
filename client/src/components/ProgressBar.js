import { motion } from "framer-motion";

export default function ProgressBar({ value, max = 100, label, color = "eco-primary", showLabel = true }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      {(label || showLabel) && (
        <div className="flex justify-between text-sm font-semibold text-gray-600 mb-1">
          <span>{label}</span>
          {showLabel && <span>{Math.round(percent)}%</span>}
        </div>
      )}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: "#4CAF50" }}
        />
      </div>
    </div>
  );
}
