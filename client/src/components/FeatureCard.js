import React from "react";
import { motion } from "framer-motion";
import IconBox from "./IconBox";

export default function FeatureCard({ icon: Icon, title, desc, color = "green", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(76, 175, 80, 0.15)" }}
      className="bg-white rounded-3xl p-8 border-2 border-eco-pale shadow-card hover:border-eco-primary/20 transition"
    >
      <IconBox color={color} size="lg" className="mb-4 rounded-2xl">
        <Icon className="w-10 h-10" strokeWidth={2} />
      </IconBox>
      <h3 className="font-display font-bold text-xl text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </motion.div>
  );
}
