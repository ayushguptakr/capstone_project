import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileBottomNav({ links, playClick }) {
  const { pathname } = useLocation();

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] h-16 sm:h-20 flex items-center justify-around pb-1 sm:pb-3"
    >
      <ul className="flex items-center justify-around w-full max-w-md mx-auto px-1">
        {links.map(({ to, label, icon: Icon, match, badge }) => {
          const isActive = match(pathname);
          
          return (
            <li key={to} className="relative flex-1 min-w-0 flex justify-center h-full">
              <Link
                to={to}
                onClick={playClick}
                className="relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-1 sm:p-2 w-full h-full active:scale-95 transition-transform"
              >
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`p-1.5 sm:p-2.5 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                      isActive 
                        ? "bg-emerald-100 text-emerald-600 shadow-inner" 
                        : "text-slate-400 bg-transparent hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>

                  {/* Optional Glow Effect for Active Tab */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="navGlow"
                        className="absolute inset-0 bg-emerald-400 rounded-2xl -z-10 blur-xl opacity-30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Notification Badge */}
                  {badge > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white"
                    >
                      {badge}
                    </motion.span>
                  )}
                </div>

                <span className={`text-[10px] w-full text-center truncate font-bold tracking-wide transition-colors duration-300 ${isActive ? "text-emerald-700" : "text-slate-400"}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
