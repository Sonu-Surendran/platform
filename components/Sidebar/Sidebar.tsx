import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Settings,
  Cable,
  Table2,
  FileText
} from 'lucide-react';
import { SidebarItemType } from '@/types';
import { PacManGame } from '@/components/EasterEgg/PacManGame';
import { useState } from 'react';

interface SidebarProps {
  activeItem: SidebarItemType;
  setActiveItem: (item: SidebarItemType) => void;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, setActiveItem, isOpen = true }) => {
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (e.detail === 3) {
      setShowEasterEgg(true);
    }
  };

  const menuItems = [
    { type: SidebarItemType.DASHBOARD, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { type: SidebarItemType.CIRCUIT_INVENTORY, icon: <Cable size={20} />, label: 'Circuit Inventory' },
    { type: SidebarItemType.MATRIX_COMPARISON, icon: <Table2 size={20} />, label: 'Matrix Comparison' },
    { type: SidebarItemType.DEALS, icon: <Briefcase size={20} />, label: 'Deals Management' },
    { type: SidebarItemType.REPORTS, icon: <BarChart3 size={20} />, label: 'Analytics' },
    { type: SidebarItemType.MIC_POM, icon: <FileText size={20} />, label: 'MIC POM' },
    { type: SidebarItemType.SETTINGS, icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <aside className={`fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 dark:bg-charcoal-900 text-white transition-all duration-300 border-r border-transparent dark:border-charcoal-800 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo Area */}
      <div
        className="flex h-20 items-center gap-3 px-6 border-b border-slate-800 dark:border-charcoal-800 cursor-pointer select-none"
        onClick={handleLogoClick}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-blue-900/30 overflow-hidden p-1.5">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/NTT_Data_logo.svg/512px-NTT_Data_logo.svg.png"
            alt="NTT Data"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white dark:text-charcoal-50">NTT DATA</h1>
          <p className="text-xs text-slate-400 dark:text-charcoal-50 opacity-60">MIC PLATFORM</p>
        </div>
      </div>

      {showEasterEgg && <PacManGame onClose={() => setShowEasterEgg(false)} />}

      {/* Navigation */}
      <nav className="mt-8 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeItem === item.type;
          return (
            <button
              key={item.type}
              onClick={() => setActiveItem(item.type)}
              className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 
                ${isActive
                  ? 'bg-pastel-blue dark:bg-charcoal-brand text-white shadow-lg shadow-blue-900/50 dark:shadow-cyan-900/30'
                  : 'text-slate-400 dark:text-gray-400 hover:bg-slate-800 dark:hover:bg-charcoal-800 hover:text-white dark:hover:text-charcoal-50'
                }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-gray-400 group-hover:text-white dark:group-hover:text-charcoal-50'}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Snippet */}
      <div className="absolute bottom-8 left-0 w-full px-6">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-800/50 dark:bg-charcoal-800/50 p-3 backdrop-blur-sm border border-slate-700/50 dark:border-charcoal-800">
          <img
            src="https://picsum.photos/40/40"
            alt="User"
            className="h-10 w-10 rounded-full border-2 border-slate-600 dark:border-charcoal-700 object-cover"
          />
          <div className="overflow-hidden">
            <p className="truncate text-sm font-semibold text-white dark:text-charcoal-50">Rinzler</p>
            <p className="truncate text-xs text-slate-400 dark:text-gray-400">Senior Engineer</p>
          </div>
        </div>
      </div>
    </aside >
  );
};