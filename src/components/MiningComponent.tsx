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
    <div className="w-full flex flex-col gap-2">
      {/* Visual Header */}
      <div className="flex justify-between items-end px-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-bold">Node Status</span>
          <span className={cn(
            "text-[12px] font-mono font-bold tracking-wider",
             canClaim ? "text-amber-500 drop-shadow-sm" : 
             isMining ? "text-brand drop-shadow-sm" : "text-gray-300"
          )}>
             {canClaim ? "REWARD READY" : isMining ? "MINING" : "STANDBY"}
          </span>
        </div>
        {isMining && !canClaim && (
          <div className="text-[10px] font-mono font-bold text-gray-500 bg-black/5 px-2 py-1 rounded-lg border border-black/5">
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Modern Loader Bar */}
      <div className="relative w-full h-4 rounded-full bg-gray-100 border border-black/5 overflow-hidden shadow-inner">
        {/* The Progress Fill */}
        <motion.div
           initial={false}
           animate={{ width: `${progress}%` }}
           transition={{ ease: "linear", duration: 1 }}
           className={cn(
             "h-full rounded-full relative overflow-hidden flex items-center justify-end px-2",
             canClaim ? "bg-amber-400 shadow-sm" : "bg-brand shadow-sm"
           )}
        >
            {/* Shimmer effect inside the bar */}
            {(isMining || canClaim) && (
              <motion.div
                className="absolute top-0 bottom-0 left-0 w-[50px] bg-white/40 skew-x-12 blur-[2px]"
                animate={{ x: ['-200%', '500%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              />
            )}
        </motion.div>
      </div>
    </div>
  );
}
