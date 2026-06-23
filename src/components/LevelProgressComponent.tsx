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
      <h2 className="text-gray-400 text-[9px] uppercase tracking-[0.2em] w-full text-center mb-1 flex items-center justify-center gap-1.5 z-10 font-bold">
        <Trophy className="w-3.5 h-3.5 text-brand" /> Rank
      </h2>

      {/* Circular Progress using Recharts */}
      <div className="relative w-[80px] h-[80px] shrink-0 flex items-center justify-center my-1 transform scale-[0.85] sm:scale-100">
        <ResponsiveContainer width="100%" height="100%" className="absolute inset-0 pointer-events-none">
          <PieChart>
            <defs>
              <linearGradient id="levelGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0071e3" />
                <stop offset="100%" stopColor="#34c759" />
              </linearGradient>
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={32}
              outerRadius={40}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={20}
              isAnimationActive={true}
            >
              <Cell key="cell-0" fill="url(#levelGradient)" />
              <Cell key="cell-1" fill="rgba(0,0,0,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
          <span className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mb-0.5 font-bold">Lvl</span>
          <span className="text-2xl font-black text-gray-900 leading-none">
            {currentLevel}
          </span>
        </div>
      </div>

      <div className="flex flex-col w-full z-10 text-center gap-1.5 mt-auto">
        <p className="text-[9px] text-gray-500 leading-relaxed px-1">
          Aim for Lvl <span className="text-brand font-black">{currentLevel + 1}</span> to boost yield
        </p>
        
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-mono border-t border-black/5 pt-1.5 relative">
          <span className="text-brand font-black">{currentLevelXp} <span className="text-[8px] text-gray-400">FIFA Coin</span></span>
          <span className="text-gray-400 font-bold">{LEVEL_THRESHOLD} <span className="text-[8px]">FIFA Coin</span></span>
          {onClick && <ChevronRight className="w-3 h-3 text-gray-400 absolute -right-3 top-2 opacity-0 group-hover:opacity-100 transition-opacity" />}
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
         className="col-span-1 flex flex-col items-center justify-between w-full h-full pb-2 group hover:bg-black/5 rounded-2xl transition-colors px-1"
       >
         {content}
       </motion.button>
     );
  }

  return (
    <motion.div 
      initial={{opacity:0, y:5}} 
      animate={{opacity:1, y:0}} 
      className="col-span-1 flex flex-col items-center justify-between w-full h-full pb-2 px-1"
    >
      {content}
    </motion.div>
  );
}
