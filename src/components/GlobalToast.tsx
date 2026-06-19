import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export function GlobalToast() {
  const { toast, hideToast } = useAppStore();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-4 left-4 right-4 z-[100] flex justify-center pointer-events-none"
        >
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-3xl border pointer-events-auto",
              toast.type === 'success' && "bg-emerald-500/10 border-emerald-500/20 shadow-[0_4px_24px_rgba(16,185,129,0.3)]",
              toast.type === 'error' && "bg-red-500/10 border-red-500/20 shadow-[0_4px_24px_rgba(239,68,68,0.3)]",
              toast.type === 'info' && "bg-white/10 border-white/20 shadow-[0_4px_24px_rgba(255,255,255,0.1)]"
            )}
            onClick={hideToast}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-white/70" />}
            
            <span className={cn(
              "text-sm font-medium tracking-wide",
              toast.type === 'success' && "text-emerald-100",
              toast.type === 'error' && "text-red-100",
              toast.type === 'info' && "text-white"
            )}>
              {toast.message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
