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
    <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-between items-end z-40 pointer-events-none">
      
      {/* Main Nav Container */}
      <div className="glass-card rounded-[2rem] px-6 py-4 flex items-center justify-between gap-6 pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative p-2 rounded-full transition-colors",
                isActive ? "text-brand-light" : "text-white/40 hover:text-white/60"
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <motion.div 
                  layoutId="navIndicator"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-light"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Floating Action Button for Profile or specific action */}
      <button 
        onClick={() => onChange('profile')}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95 pointer-events-auto shadow-2xl",
          currentTab === 'profile' 
            ? "bg-brand text-white" 
            : "bg-[#2A2B3D] text-brand-light"
        )}
      >
        <UserPlus className="w-6 h-6" strokeWidth={2} />
      </button>

    </div>
  );
}
