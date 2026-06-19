import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pickaxe, Sparkles } from 'lucide-react';
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
  // 3D-like spinning tracks
  const tracks = [
    { delay: 0, duration: 10, reverse: false },
    { delay: 0.2, duration: 15, reverse: true },
    { delay: 0.4, duration: 20, reverse: false },
  ];

  return (
    <div className="relative w-48 h-48 mb-6 flex items-center justify-center scale-90 sm:scale-100">
      {/* 3D Spinning Tracks */}
      {tracks.map((track, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-white/[0.03]"
          style={{
            inset: `${i * 8}px`,
            borderStyle: i % 2 === 0 ? 'dotted' : 'dashed',
            borderWidth: '2px',
          }}
          animate={{ rotate: track.reverse ? -360 : 360 }}
          transition={{
            duration: track.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Pulsing Core Glow when active */}
      {isMining && !canClaim && (
        <motion.div
          className="absolute inset-0 rounded-full bg-brand/10 blur-xl pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Ready Glow when claimable */}
      {canClaim && (
        <motion.div
          className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl pointer-events-none"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Main Progress SVG */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" style={{ zIndex: 5 }}>
        <circle cx="96" cy="96" r="92" className="fill-none stroke-white/5" strokeWidth="2" />
        <motion.circle
          cx="96" cy="96" r="92"
          className={cn("fill-none", canClaim ? "stroke-amber-400" : "stroke-brand-light")}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 92}
          strokeDashoffset={2 * Math.PI * 92 * (1 - progress / 100)}
          initial={false}
          animate={{ strokeDashoffset: 2 * Math.PI * 92 * (1 - progress / 100) }}
          transition={{ ease: "linear", duration: 1 }}
          style={{
            filter: isMining ? 'drop-shadow(0 0 8px rgba(var(--color-brand-light), 0.5))' : 'none'
          }}
        />
      </svg>
      
      {/* Central Module */}
      <div className="absolute inset-0 m-auto w-[130px] h-[130px] rounded-full bg-black/60 shadow-[inset_0_0_40px_rgba(0,0,0,0.9),0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-col items-center justify-center border border-white/[0.08] z-10 overflow-hidden">
        
        {/* Inner ambient glow */}
        {isMining && !canClaim && (
          <div className="absolute inset-0 bg-brand/10 mix-blend-screen" />
        )}

        <AnimatePresence mode="wait">
          {isMining && !canClaim ? (
            <motion.div 
              key="mining"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center z-10 relative"
            >
              <Pickaxe className="w-7 h-7 text-brand-light/90 mb-2" strokeWidth={1.5} />
              
              {/* Animated processing rings behind the icon */}
              <motion.div
                className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-brand-light/30"
                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />

              <div className="text-[18px] font-mono tracking-widest text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                {formatTime(timeLeft)}
              </div>
            </motion.div>
          ) : canClaim ? (
            <motion.div
              key="claim"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center z-10"
            >
              <Sparkles className="w-8 h-8 text-amber-400 mb-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" strokeWidth={1.5} />
              <div className="text-[13px] font-bold text-amber-400 tracking-[0.25em]">REWARD</div>
            </motion.div>
          ) : (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center z-10"
            >
              <Pickaxe className="w-7 h-7 text-white/20 mb-2" strokeWidth={1.5} />
              <div className="text-[11px] font-semibold text-white/30 tracking-[0.2em] uppercase">Standby</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
