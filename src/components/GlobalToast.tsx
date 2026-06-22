import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { Check, ShieldAlert, Bell, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
// Note: audio is now played in the store, no need to play it here

export function GlobalToast() {
  const { toast, hideToast } = useAppStore();

  return (
    <AnimatePresence>
      {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-2 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[380px] p-3 rounded-[1.5rem] bg-white/90 backdrop-blur-3xl border border-black/5 shadow-2xl z-[200] flex items-start gap-3 overflow-hidden pointer-events-auto cursor-pointer"
            onClick={hideToast}
          >
             <div className={cn(
                 "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border",
                 toast.type === 'error' ? 'bg-rose-50 text-rose-500 border-rose-100' : 
                 toast.type === 'success' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 
                 'bg-brand/5 text-brand border-brand/10'
             )}>
                 {toast.type === 'error' && <ShieldAlert className="w-5 h-5" />}
                 {toast.type === 'success' && <Check className="w-5 h-5" strokeWidth={3} />}
                 {toast.type === 'info' && <Bell className="w-5 h-5" />}
             </div>
             <div className="flex flex-col flex-1 pt-0.5 pb-1">
                 {toast.title ? (
                   <>
                     <div className="text-[13px] font-black text-gray-900 tracking-wide uppercase">
                       {toast.title}
                     </div>
                     <div className="text-xs text-gray-600 line-clamp-2 mt-0.5 leading-relaxed font-medium">
                         {toast.message}
                     </div>
                   </>
                 ) : (
                   <div className="text-[13px] font-black text-gray-900 tracking-wide self-center pt-2.5">
                       {toast.message}
                   </div>
                 )}
             </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
