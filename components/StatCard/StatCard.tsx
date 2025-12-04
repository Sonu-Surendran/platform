import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  colorClass: string; // Tailwind text color class
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon, colorClass }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-charcoal-800/70 p-6 shadow-lg dark:shadow-black/40 backdrop-blur-xl border border-white/50 dark:border-charcoal-700/50 transition-transform hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-pastel-blue/10 to-white/0 blur-2xl dark:from-charcoal-brand/10"></div>
      
      <div className="flex items-start justify-between">
        <div className={`rounded-2xl p-3 bg-white/80 dark:bg-charcoal-900/50 shadow-sm ${colorClass}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'bg-pastel-green/50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-pastel-pink/50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'} px-2 py-1 rounded-full backdrop-blur-sm`}>
          {trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trend}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium tracking-wide uppercase">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 dark:text-charcoal-50 mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
};