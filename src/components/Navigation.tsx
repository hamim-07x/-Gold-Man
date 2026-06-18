import React from 'react';
import { Home, Wallet, Briefcase, Users, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface NavigationProps {
  currentTab: string;
  onChange: (tab: string) => void;
}

export function Navigation({ currentTab, onChange }: NavigationProps) {
  const tabs = [
    { id: 'dashboard', icon: Home },
    { id: 'wallet', icon: Wallet },
    { id: 'earn', icon: Briefcase },
    { id: 'friends', icon: Users }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 flex justify-between items-end z-40 pointer-events-none">
      
      {/* Main Nav Container */}
      <div className="glass-card rounded-[24px] px-4 py-2 flex items-center justify-between gap-4 pointer-events-auto flex-1 mr-3 h-[56px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative p-1.5 rounded-full transition-all duration-300 flex flex-col items-center justify-center w-10 h-10",
                isActive ? "text-brand-light" : "text-white/40 hover:text-white/70"
              )}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2 : 1.5} />
              {isActive && (
                <motion.div 
                  layoutId="navIndicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-light shadow-[0_0_8px_theme(colors.brand.light)]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => onChange('profile')}
        className={cn(
          "w-[56px] h-[56px] rounded-[24px] flex items-center justify-center transition-all active:scale-95 pointer-events-auto backdrop-blur-[40px] @supports(backdrop-filter:blur(40px)){backdrop-saturate-150} border-[0.5px] border-white/10 shadow-[inner_0_1px_1px_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.4)] flex-shrink-0",
          currentTab === 'profile' 
            ? "bg-brand text-white" 
            : "bg-[#2563eb]/20 text-brand-light hover:bg-[#2563eb]/30"
        )}
      >
        <UserPlus className="w-[22px] h-[22px]" strokeWidth={1.5} />
      </button>

    </div>
  );
}
