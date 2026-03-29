import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

/**
 * Shared full-screen layout: soft eco gradient, blurred blobs, “Back to Home”.
 */
export default function AuthShell({ children, formClassName = "max-w-md" }) {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-16 sm:py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/95 via-[#F0FAF4] to-white" />
      {/* Blobs: bottom-heavy + top-right accent so the form area stays readable */}
      <div className="absolute -bottom-32 left-1/4 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full bg-emerald-300/35 blur-[100px] pointer-events-none" />
      <div className="absolute top-8 right-0 md:right-[8%] w-[22rem] h-[22rem] rounded-full bg-teal-200/30 blur-[88px] pointer-events-none" />
      <div className="absolute top-[42%] -left-32 w-72 h-72 rounded-full bg-lime-200/20 blur-[72px] pointer-events-none" />
      <div className="absolute bottom-[18%] right-[12%] w-56 h-56 rounded-full bg-emerald-400/18 blur-[64px] pointer-events-none" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_75%_15%,rgba(16,185,129,0.14),transparent_55%)] pointer-events-none"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-gray-600 bg-white/55 backdrop-blur-xl border border-white/70 shadow-sm hover:bg-white/80 hover:text-[#2D332F] hover:border-emerald-200/70 hover:shadow-md transition-all duration-300 ease-out"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={2} />
          Back to Home
        </Link>
      </motion.div>

      <div className={`relative z-10 w-full ${formClassName}`}>{children}</div>
    </div>
  );
}
