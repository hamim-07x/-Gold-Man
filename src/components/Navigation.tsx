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
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dash', color: 'text-brand' },
    { id: 'wallet', icon: Wallet, label: 'Wallet', color: 'text-[#0071e3]' },
    { id: 'earn', icon: Trophy, label: 'Earn', color: 'text-glow-pink' },
    { id: 'friends', icon: Users, label: 'Friends', color: 'text-brand' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 pb-safe-bottom flex justify-between items-end z-40 pointer-events-none max-w-lg mx-auto">
      
      {/* Main Nav Container */}
      <div className="glass-card p-1.5 flex items-center justify-between gap-1 pointer-events-auto flex-1 h-[56px] mr-2">
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
              className={cn(
                "relative rounded-[14px] transition-all duration-300 flex flex-col items-center justify-center flex-1 h-full active:scale-95 group",
                isActive ? `bg-black/5 shadow-sm ${tab.color}` : "text-gray-500 hover:bg-black/[0.03]"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-0.5 transition-transform group-hover:scale-110", !isActive && "group-hover:text-gray-900")} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[9px] font-semibold", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Floating Action Button for Marketplace */}
      <button 
        onClick={() => {
           playClickSound();
           onChange('marketplace');
        }}
        className={cn(
          "w-[56px] h-[56px] glass-card flex flex-col items-center justify-center transition-all active:scale-95 pointer-events-auto flex-shrink-0 group relative overflow-hidden",
          currentTab === 'marketplace' 
            ? "bg-black/5 text-[#1d1d1f]" 
            : "text-gray-500 hover:text-gray-900"
        )}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br transition-opacity duration-300", currentTab === 'marketplace' ? "from-brand/10 to-glow-pink/10 opacity-100" : "from-brand/5 to-transparent opacity-0 group-hover:opacity-100")} />
        <Store className="w-5 h-5 mb-0.5 relative z-10 group-hover:scale-110 group-hover:text-[#1d1d1f] transition-all duration-300" strokeWidth={currentTab === 'marketplace' ? 2.5 : 2} />
        <span className={cn("text-[8px] font-bold relative z-10", currentTab === 'marketplace' ? "opacity-100 text-glow-pink" : "opacity-0 group-hover:opacity-100")}>Shop</span>
      </button>

    </div>
  );
}
