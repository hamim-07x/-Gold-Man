import React from 'react';
import { LayoutTemplate, WalletCards, Flame, UsersRound, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface NavigationProps {
  currentTab: string;
  onChange: (tab: string) => void;
}

export function Navigation({ currentTab, onChange }: NavigationProps) {
  const tabs = [
    { id: 'dashboard', icon: LayoutTemplate, color: 'text-brand-light' },
    { id: 'wallet', icon: WalletCards, color: 'text-[#4aa5ff]' },
    { id: 'earn', icon: Flame, color: 'text-glow-pink' },
    { id: 'friends', icon: UsersRound, color: 'text-accent-light' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 flex justify-between items-end z-40 pointer-events-none">
      
      {/* Main Nav Container */}
      <div className="bg-black/40 backdrop-blur-3xl border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-3xl px-4 py-2 flex items-center justify-between gap-4 pointer-events-auto flex-1 mr-3 h-[60px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative p-1.5 rounded-full transition-all duration-300 flex flex-col items-center justify-center w-12 h-12 active:scale-95 group",
                isActive ? `bg-white/[0.08] shadow-inner shadow-black/50 ${tab.color}` : "text-white/40 hover:bg-white/[0.02]"
              )}
            >
              <Icon className={cn("w-5 h-5", !isActive && "group-hover:text-white/60")} strokeWidth={isActive ? 2 : 1.5} />
              {isActive && (
                <motion.div 
                  layoutId="navIndicator"
                  className={cn("absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]", `bg-current`)}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => {
           window.dispatchEvent(new CustomEvent('open-admin-direct'));
        }}
        className={cn(
          "w-[60px] h-[60px] rounded-3xl flex items-center justify-center transition-all active:scale-95 pointer-events-auto backdrop-blur-3xl border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex-shrink-0 group",
          currentTab === 'admin' 
            ? "bg-brand/40 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]" 
            : "bg-black/40 text-white/50 hover:bg-white/10"
        )}
      >
        <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" strokeWidth={1.5} />
      </button>

    </div>
  );
}
