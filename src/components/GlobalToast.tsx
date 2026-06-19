import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { Check, ShieldAlert, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
// Note: audio is now played in the store, no need to play it here

export function GlobalToast() {
  const { toast, hideToast } = useAppStore();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm p-4 rounded-[1.5rem] bg-black/60 backdrop-blur-3xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-[100] flex items-center gap-4 overflow-hidden pointer-events-auto"
            onClick={hideToast}
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/0 pointer-events-none" />
             <div className={cn(
                 "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border relative z-10",
                 toast.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 
                 toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 
                 'bg-brand/20 border-brand/30 text-brand-light shadow-[0_0_15px_rgba(139,92,246,0.3)]'
             )}>
                 {toast.type === 'error' && <ShieldAlert className="w-5 h-5" />}
                 {toast.type === 'success' && <Check className="w-5 h-5" strokeWidth={3} />}
                 {toast.type === 'info' && <Bell className="w-5 h-5" />}
             </div>
             <div className="flex-1 relative z-10">
                 <div className="text-[14px] font-bold text-white/90 tracking-wide drop-shadow-md">
                   {toast.title || (toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Notification')}
                 </div>
                 <div className="text-[12px] text-white/60 mt-0.5">{toast.message}</div>
             </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
