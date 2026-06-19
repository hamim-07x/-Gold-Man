import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pickaxe, Sparkles, Timer } from 'lucide-react';
import { cn } from '../lib/utils';

interface MiningComponentProps {
  progress: number;
  timeLeft: number;
  isMining: boolean;
  canClaim: boolean;
  formatTime: (ms: number) => string;
}

export function MiningComponent({
  progress,
  timeLeft,
  isMining,
  canClaim,
  formatTime,
}: MiningComponentProps) {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Visual Header */}
      <div className="flex justify-between items-end px-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Node Status</span>
          <span className={cn(
            "text-[14px] font-mono font-bold tracking-wider",
             canClaim ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" : 
             isMining ? "text-brand-light drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]" : "text-white/20"
          )}>
             {canClaim ? "REWARD READY" : isMining ? "MINING" : "STANDBY"}
          </span>
        </div>
        {isMining && !canClaim && (
          <div className="text-[12px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Modern Loader Bar */}
      <div className="relative w-full h-8 rounded-full bg-black/40 border border-white/[0.05] p-1 overflow-hidden backdrop-blur-xl shadow-inner shadow-black/50">
        {/* Background glow when active */}
        {(isMining || canClaim) && (
          <div className="absolute inset-0 bg-brand/5 blur-md" />
        )}

        {/* The Progress Fill */}
        <motion.div
           initial={false}
           animate={{ width: `${progress}%` }}
           transition={{ ease: "linear", duration: 1 }}
           className={cn(
             "h-full rounded-full relative overflow-hidden flex items-center justify-end px-2",
             canClaim ? "bg-gradient-to-r from-amber-500/20 to-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]" : "bg-gradient-to-r from-brand/20 to-brand-light shadow-[0_0_15px_rgba(167,139,250,0.4)]"
           )}
        >
            {/* Shimmer effect inside the bar */}
            {(isMining || canClaim) && (
              <motion.div
                className="absolute top-0 bottom-0 left-0 w-[50px] bg-white/30 skew-x-12 blur-[2px]"
                animate={{ x: ['-200%', '500%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              />
            )}
        </motion.div>
      </div>
    </div>
  );
}
