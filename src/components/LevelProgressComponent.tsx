import React from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Trophy, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { playClickSound } from '../lib/audio';

interface Props {
  onClick?: () => void;
}

export function LevelProgressComponent({ onClick }: Props) {
  const { currentUser } = useAppStore();
  const xp = currentUser?.xpBalance || 0;
  
  const LEVEL_THRESHOLD = 1000;
  const currentLevel = Math.floor(xp / LEVEL_THRESHOLD) + 1;
  const currentLevelXp = xp % LEVEL_THRESHOLD;
  const remainingXp = LEVEL_THRESHOLD - currentLevelXp;
  
  const data = [
    { name: 'Completed', value: currentLevelXp },
    { name: 'Remaining', value: remainingXp }
  ];

  const content = (
    <>
      <h2 className="text-white/30 text-[9px] uppercase tracking-[0.2em] w-full text-center mb-2 flex items-center justify-center gap-1.5 z-10 font-bold">
        <Trophy className="w-3 h-3 text-amber-500" /> Rank
      </h2>

      {/* Circular Progress using Recharts */}
      <div className="relative w-[90px] h-[90px] shrink-0 flex items-center justify-center my-2 transform scale-[0.85] sm:scale-100">
        <ResponsiveContainer width="100%" height="100%" className="absolute inset-0 pointer-events-none">
          <PieChart>
            <defs>
              <linearGradient id="levelGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={45}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={15}
              isAnimationActive={true}
            >
              <Cell key="cell-0" fill="url(#levelGradient)" />
              <Cell key="cell-1" fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
          <span className="text-[9px] text-white/40 uppercase tracking-widest leading-none mb-1">Lvl</span>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-light to-glow-pink leading-none drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
            {currentLevel}
          </span>
        </div>
      </div>

      <div className="flex flex-col w-full z-10 text-center gap-2 mt-auto">
        <p className="text-[9px] text-white/40 leading-relaxed px-1">
          Aim for Lvl <span className="text-brand-light font-bold drop-shadow-[0_0_5px_rgba(139,92,246,0.6)]">{currentLevel + 1}</span> to boost yield
        </p>
        
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-mono border-t border-white/5 pt-2 relative">
          <span className="text-brand-light font-bold drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]">{currentLevelXp} <span className="text-[8px] text-white/30">XP</span></span>
          <span className="text-white/20">{LEVEL_THRESHOLD} <span className="text-[8px]">XP</span></span>
          {onClick && <ChevronRight className="w-3 h-3 text-white/20 absolute -right-3 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
      </div>
    </>
  );

  if (onClick) {
     return (
       <motion.button 
         onClick={() => { playClickSound(); onClick(); }}
         initial={{opacity:0, y:5}} 
         animate={{opacity:1, y:0}} 
         className="col-span-1 flex flex-col items-center justify-between w-full h-full pb-2 group hover:bg-white/[0.02] rounded-[1rem] transition-colors"
       >
         {content}
       </motion.button>
     );
  }

  return (
    <motion.div 
      initial={{opacity:0, y:5}} 
      animate={{opacity:1, y:0}} 
      className="col-span-1 flex flex-col items-center justify-between w-full h-full pb-2"
    >
      {content}
    </motion.div>
  );
}
