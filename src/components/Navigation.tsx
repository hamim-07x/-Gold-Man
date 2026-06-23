import React from 'react';
import { LayoutDashboard, Wallet, Trophy, Users, Store } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { playClickSound } from '../lib/audio';

interface NavigationProps {
  currentTab: string;
  onChange: (tab: string) => void;
}

export function Navigation({ currentTab, onChange }: NavigationProps) {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Mine', color: 'text-brand' },
    { id: 'wallet', icon: Wallet, label: 'Wallet', color: 'text-black' },
    { id: 'earn', icon: Trophy, label: 'Earn', color: 'text-accent' },
    { id: 'friends', icon: Users, label: 'Mates', color: 'text-brand-light' },
    { id: 'marketplace', icon: Store, label: 'Shop', color: 'text-[#EEA013]' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom z-40 pointer-events-none flex justify-center">
      
      {/* Floating Pill Navigation */}
      <div className="bg-white/60 backdrop-blur-3xl p-1.5 flex items-center justify-between pointer-events-auto rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 min-w-[320px] max-w-sm w-full mx-auto relative overflow-hidden">
        
        {/* Active Tab Background indicator */}
        <div className="absolute inset-y-1.5 transition-all duration-500 ease-spring" style={{
           width: `${100 / tabs.length}%`,
           left: `${(tabs.findIndex(t => t.id === currentTab) >= 0 ? tabs.findIndex(t => t.id === currentTab) : 0) * (100 / tabs.length)}%`
        }}>
           <div className="w-full h-full bg-white rounded-[1.5rem] shadow-sm border border-black/[0.02]" />
        </div>

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                onChange(tab.id);
              }}
              className="relative transition-all duration-300 flex flex-col items-center justify-center flex-1 h-[54px] active:scale-95 group z-10"
            >
              <Icon className={cn("w-[22px] h-[22px] mb-1 transition-all duration-300", isActive ? tab.color : "text-gray-400 group-hover:text-gray-600")} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[9px] font-bold tracking-wide transition-all duration-300", isActive ? "text-gray-900 opacity-100" : "text-gray-400 opacity-80 group-hover:opacity-100")}>{tab.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
