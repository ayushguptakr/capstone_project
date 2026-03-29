import React from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function AuthFloatingLeaf() {
  return (
    <div className="flex justify-center mb-6">
      <motion.div
        className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5E9F57] to-eco-primary text-white border border-white/25 shadow-[0_12px_32px_-8px_rgba(34,197,94,0.45)]"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Leaf className="w-10 h-10" strokeWidth={2.2} />
      </motion.div>
    </div>
  );
}
