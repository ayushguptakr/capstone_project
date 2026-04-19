import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

const TOAST_TIMEOUT = 3000;

export default function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showAlert = useCallback(({ type = "info", message, duration = TOAST_TIMEOUT }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast 
              key={toast.id} 
              toast={toast} 
              onRemove={() => removeToast(toast.id)} 
            />
          ))}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  );
}

// Sub-component to track its own hover states and timeout
function Toast({ toast, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  const getStyle = (type) => {
    switch(type) {
      case "error": return { icon: <XCircle className="w-5 h-5 text-red-500" />, bg: "bg-white", border: "border-red-100", bar: "bg-red-500" };
      case "success": return { icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, bg: "bg-white", border: "border-emerald-100", bar: "bg-emerald-500" };
      case "warning": return { icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, bg: "bg-white", border: "border-amber-100", bar: "bg-amber-500" };
      case "info": 
      default: return { icon: <Info className="w-5 h-5 text-indigo-500" />, bg: "bg-white", border: "border-indigo-100", bar: "bg-indigo-500" };
    }
  };

  const style = getStyle(toast.type);

  React.useEffect(() => {
    let interval;
    let timer;
    
    if (!isHovered) {
      const step = 50; 
      const totalSteps = toast.duration / step;
      let currentStep = 0;

      interval = setInterval(() => {
        currentStep++;
        setProgress(100 - (currentStep / totalSteps) * 100);
      }, step);

      timer = setTimeout(() => {
        onRemove();
      }, toast.duration);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isHovered, toast.duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md border border-slate-100 min-w-[300px] max-w-sm ${style.bg}`}
    >
      <div className="shrink-0 mt-0.5">
        {style.icon}
      </div>
      <div className="flex-1 pr-6">
        <p className="text-sm font-semibold text-slate-800 leading-snug">{toast.message}</p>
      </div>
      
      <button 
        onClick={onRemove}
        className="absolute top-4 right-3 text-slate-300 hover:text-slate-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
        <div 
          className={`h-full transition-all duration-75 ease-linear ${style.bar}`} 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </motion.div>
  );
}
