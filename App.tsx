import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { CircuitInventory } from '@/pages/CircuitInventory';
import { MatrixComparison } from '@/pages/MatrixComparison';
import { DealsManagement } from '@/pages/DealsManagement';
import { Analytics } from '@/pages/Analytics';
import { MicPom } from '@/pages/MicPom';
import { SidebarItemType } from '@/types';
import { Sun, Moon, Search, Bell } from 'lucide-react';

function App() {
  const [activeItem, setActiveItem] = useState<SidebarItemType>(SidebarItemType.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [targetDealId, setTargetDealId] = useState<string | null>(null);
  const [targetFilterStatus, setTargetFilterStatus] = useState<string | null>(null);

  const handleNavigateToDeal = (dealId: string) => {
    setActiveItem(SidebarItemType.DEALS);
    setTargetDealId(dealId);
    setTargetFilterStatus(null); // Clear filter if opening specific deal
  };

  const handleNavigateToDealsWithFilter = (status: string) => {
    setActiveItem(SidebarItemType.DEALS);
    setTargetFilterStatus(status);
    setTargetDealId(null); // Clear specific deal deep link
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-300 overflow-hidden ${isDarkMode ? 'dark bg-charcoal-900' : 'bg-pastel-cream'}`}>
      {/* Sidebar Navigation */}
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      {/* Main Content Area */}
      <main className="ml-64 flex-1 h-full transition-all duration-300 bg-pastel-cream dark:bg-charcoal-900 text-slate-900 dark:text-charcoal-50 flex flex-col overflow-hidden">
        {/* Top decorative gradient bar/glow */}
        <div className="sticky top-0 z-30 h-20 w-full bg-pastel-cream/80 dark:bg-charcoal-900/90 backdrop-blur-md border-b border-white/50 dark:border-charcoal-800 flex items-center justify-between px-6 md:px-8 shadow-sm transition-colors duration-300 flex-none">
           <div className="flex items-center gap-2 text-slate-400 dark:text-gray-400 text-sm">
             <span>Home</span>
             <span>/</span>
             <span className="text-slate-800 dark:text-charcoal-50 font-medium">{activeItem}</span>
           </div>
           
           <div className="flex items-center gap-4">
             {/* Search Bar */}
             <div className="relative group hidden md:block">
               <input 
                 type="text" 
                 placeholder="Search deals, clients..." 
                 className="h-10 w-64 rounded-full border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-4 text-sm text-slate-700 dark:text-charcoal-50 shadow-sm focus:border-pastel-blue focus:outline-none focus:ring-2 focus:ring-pastel-blue/20 dark:focus:ring-charcoal-brand/30 transition-all"
               />
               <Search className="absolute right-3 top-2.5 h-5 w-5 text-slate-400 group-focus-within:text-pastel-blue dark:group-focus-within:text-charcoal-brand transition-colors" />
             </div>

             {/* Theme Toggle */}
             <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="h-10 w-10 rounded-full bg-white dark:bg-charcoal-800 flex items-center justify-center text-slate-500 dark:text-gray-400 shadow-sm border border-slate-200 dark:border-charcoal-700 hover:text-pastel-blue dark:hover:text-charcoal-brand transition-all"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
             >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             {/* Notifications */}
             <button className="h-10 w-10 rounded-full bg-white dark:bg-charcoal-800 flex items-center justify-center text-slate-500 dark:text-gray-400 shadow-sm border border-slate-200 dark:border-charcoal-700 hover:text-pastel-blue dark:hover:text-charcoal-brand transition-colors relative">
               <Bell size={20} />
               <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-pastel-pink dark:bg-charcoal-brand border border-white dark:border-charcoal-800"></span>
             </button>
           </div>
        </div>

        {/* Dynamic Content */}
        <div className="relative z-10 flex-1 min-h-0 overflow-hidden">
          {activeItem === SidebarItemType.DASHBOARD && (
            <Dashboard 
              onNavigateToDeal={handleNavigateToDeal} 
              onFilterDeals={handleNavigateToDealsWithFilter}
            />
          )}
          {activeItem === SidebarItemType.CIRCUIT_INVENTORY && <CircuitInventory />}
          {activeItem === SidebarItemType.MATRIX_COMPARISON && <MatrixComparison />}
          {activeItem === SidebarItemType.DEALS && (
            <DealsManagement 
              targetDealId={targetDealId} 
              onResetTargetId={() => setTargetDealId(null)} 
              initialFilterStatus={targetFilterStatus}
              onResetFilterStatus={() => setTargetFilterStatus(null)}
            />
          )}
          {activeItem === SidebarItemType.REPORTS && <Analytics />}
          {activeItem === SidebarItemType.MIC_POM && <MicPom />}
          
          {![SidebarItemType.DASHBOARD, SidebarItemType.CIRCUIT_INVENTORY, SidebarItemType.MATRIX_COMPARISON, SidebarItemType.DEALS, SidebarItemType.REPORTS, SidebarItemType.MIC_POM].includes(activeItem) && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-300 dark:text-charcoal-800">Module Under Construction</h2>
                <p className="text-slate-400 dark:text-gray-500 mt-2">The {activeItem} view is coming soon.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;