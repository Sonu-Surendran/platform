import React, { useState, memo, Suspense, lazy, useEffect } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Settings,
  Cable,
  Table2,
  FileText,
  RefreshCw,
  ListChecks,
  ChevronDown,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { SidebarItemType } from '@/types';

// Lazy load the Easter Egg game - rarely used
const PacManGame = lazy(() => import('@/components/EasterEgg/PacManGame').then(module => ({ default: module.PacManGame })));

interface SidebarProps {
  activeItem: SidebarItemType;
  setActiveItem: (item: SidebarItemType) => void;
  isOpen?: boolean;
}

type MenuItem = {
  type?: SidebarItemType;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
};

export const Sidebar: React.FC<SidebarProps> = memo(({ activeItem, setActiveItem, isOpen = true }) => {
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Tracker', 'Change Order']); // Default expanded

  // Animation States
  const [isIntro, setIsIntro] = useState(true);
  const [showIntroText, setShowIntroText] = useState(false);
  const [showSidebarContent, setShowSidebarContent] = useState(false);

  useEffect(() => {
    // Start animation sequence
    const sequence = async () => {
      // 1. Fade in text
      setTimeout(() => setShowIntroText(true), 500);

      // 2. Wait, then fade out text
      setTimeout(() => setShowIntroText(false), 3500);

      // 3. Start shrinking sidebar (transition takes ~1s)
      setTimeout(() => setIsIntro(false), 4000);

      // 4. Show actual sidebar content after shrink
      setTimeout(() => setShowSidebarContent(true), 4800);
    };

    sequence();
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (e.detail === 3) {
      setShowEasterEgg(true);
    }
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  const menuItems: MenuItem[] = [
    { type: SidebarItemType.DASHBOARD, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    {
      label: 'Tracker',
      icon: <FolderOpen size={20} />,
      children: [
        { type: SidebarItemType.DEALS, icon: <Briefcase size={20} />, label: 'Deals Management' },
        { type: SidebarItemType.ACTIVE_ONBOARD_CIRCUITS, icon: <Cable size={20} />, label: 'Active Inventory' },
      ]
    },
    { type: SidebarItemType.MATRIX_COMPARISON, icon: <Table2 size={20} />, label: 'Matrix Comparison' },
    {
      label: 'Change Order',
      icon: <RefreshCw size={20} />,
      children: [
        { type: SidebarItemType.CHANGE_TRACKER, icon: <ListChecks size={20} />, label: 'Change Tracker' },
        { type: SidebarItemType.CHANGE_MANAGEMENT, icon: <FileText size={20} />, label: 'Request Forum' },
      ]
    },
    { type: SidebarItemType.MIC_POM, icon: <FileText size={20} />, label: 'MIC POM' },
    { type: SidebarItemType.REPORTS, icon: <BarChart3 size={20} />, label: 'Analytics' },
    { type: SidebarItemType.CIRCUIT_INVENTORY, icon: <Cable size={20} />, label: 'Circuit Cost Catalog' },
    { type: SidebarItemType.SETTINGS, icon: <Settings size={20} />, label: 'Settings' },
  ];

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isParent = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.includes(item.label);
    const isActive = item.type === activeItem;

    // Check if any child is active to highlight parent
    const isChildActive = isParent && item.children?.some(child => child.type === activeItem);

    const paddingLeft = depth * 12 + 16; // Indentation

    if (isParent) {
      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleGroup(item.label)}
            className={`group flex w-full items-center gap-3 rounded-xl py-2.5 pr-4 text-sm font-medium transition-all duration-200
              ${isChildActive
                ? 'text-white'
                : 'text-slate-400 dark:text-gray-400 hover:text-white dark:hover:text-charcoal-50'
              }`}
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <span className={isChildActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'}>
              {item.icon}
            </span>
            <span className="flex-1 text-left">{item.label}</span>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isExpanded && (
            <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              {item.children?.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.type || item.label}
        onClick={() => item.type && setActiveItem(item.type)}
        className={`group flex w-full items-center gap-3 rounded-xl py-2.5 pr-4 text-sm font-medium transition-all duration-200 
          ${isActive
            ? 'bg-pastel-blue dark:bg-charcoal-brand text-white shadow-lg shadow-blue-900/50 dark:shadow-cyan-900/30'
            : 'text-slate-400 dark:text-gray-400 hover:bg-slate-800 dark:hover:bg-charcoal-800 hover:text-white dark:hover:text-charcoal-50'
          }`}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-gray-500 group-hover:text-white dark:group-hover:text-charcoal-50'}>
          {item.icon}
        </span>
        {item.label}
        {isActive && (
          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        )}
      </button>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 h-screen bg-slate-900 dark:bg-charcoal-900 text-white transition-all duration-[800ms] ease-in-out border-r border-transparent dark:border-charcoal-800 flex flex-col shadow-2xl
      ${isIntro ? 'w-full' : (isOpen ? 'w-64' : 'w-0 -translate-x-full')}
      ${!isIntro && !isOpen ? 'opacity-0 md:opacity-100' : 'opacity-100'} 
      `}
    >
      {/* Intro Overlay Content */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-700 ${showIntroText ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col items-center transform transition-transform duration-1000">
          <h1 className="text-6xl font-black tracking-tighter text-white mb-6 animate-in slide-in-from-bottom-10 fade-in duration-1000">
            NTT DATA
          </h1>
          <div className="h-1 w-32 bg-blue-500 rounded-full mb-6 mx-auto animate-in zoom-in duration-1000 delay-300 fill-mode-backwards"></div>
          <p className="text-2xl font-light text-slate-300 tracking-widest uppercase animate-in slide-in-from-bottom-5 fade-in duration-1000 delay-500 fill-mode-backwards">
            Realizing a Sustainable Future
          </p>
        </div>
      </div>

      {/* Main Sidebar Content */}
      <div className={`flex flex-col h-full w-full transition-opacity duration-500 ${showSidebarContent ? 'opacity-100' : 'opacity-0'}`}>
        {/* Logo Area - Fixed at top */}
        <div
          className="flex-none flex h-20 items-center gap-3 px-6 border-b border-slate-800 dark:border-charcoal-800 cursor-pointer select-none"
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

        {showEasterEgg && (
          <Suspense fallback={null}>
            <PacManGame onClose={() => setShowEasterEgg(false)} />
          </Suspense>
        )}

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar mt-4 px-3 space-y-1 pb-4">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        {/* User Profile Snippet - Fixed at bottom */}
        <div className="flex-none p-4">
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
      </div>
    </aside >
  );
});