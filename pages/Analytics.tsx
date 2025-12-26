import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  Upload,
  FileText,
  DollarSign,
  Server,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Circuit, DealRecord, MicPomRecord } from '@/types';
import { UploadModal } from '@/components/UploadModal/UploadModal';

const GlassCard = ({ title, children, className = '' }: { title: string, children?: React.ReactNode, className?: string }) => (
  <div className={`flex flex-col rounded-3xl bg-white/70 dark:bg-charcoal-800/70 backdrop-blur-xl border border-white/60 dark:border-charcoal-700/60 shadow-lg p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-slate-800 dark:text-charcoal-50 mb-4">{title}</h3>
    <div className="flex-1 min-h-0 w-full relative">
      {children}
    </div>
  </div>
);

export const Analytics: React.FC = () => {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Data
  // Load Data
  useEffect(() => {
    // Database integration will replace this.
    setCircuits([]);
    setDeals([]);
  }, []);

  // --- Chart Calculations ---

  // 1. Spend by Country (Top 5)
  const spendByCountry = useMemo(() => {
    const countryMap: Record<string, number> = {};
    circuits.forEach(c => {
      const country = c.country || 'Unknown';
      const cost = c.mrcUsd || 0;
      countryMap[country] = (countryMap[country] || 0) + cost;
    });
    return Object.entries(countryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [circuits]);

  // 2. Carrier Share (By Circuit Count)
  const carrierShare = useMemo(() => {
    const carrierMap: Record<string, number> = {};
    circuits.forEach(c => {
      const carrier = c.carrierPartner || 'Unknown';
      carrierMap[carrier] = (carrierMap[carrier] || 0) + 1;
    });
    return Object.entries(carrierMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [circuits]);

  // 3. Deal Velocity (Avg days to close) - Simulation based on deals
  const dealVelocity = useMemo(() => {
    // Generate simulated trend
    return [
      { name: 'Q1', avgDays: 45 },
      { name: 'Q2', avgDays: 42 },
      { name: 'Q3', avgDays: 38 },
      { name: 'Q4', avgDays: 35 },
    ];
  }, [deals]);

  // 4. Combined Financial Projection (Existing MRC + Potential Deal MRC)
  const financialProjection = useMemo(() => {
    const currentTotalMRC = circuits.reduce((sum, c) => sum + (c.mrcUsd || 0), 0);
    const pipelineMRC = deals.filter(d => d.dealStatus !== 'Closed Lost').reduce((sum, d) => sum + (d.mcnMicAcv || 0) / 12, 0); // Approx monthly

    return [
      { name: 'Jan', current: currentTotalMRC, projected: currentTotalMRC + (pipelineMRC * 0.1) },
      { name: 'Feb', current: currentTotalMRC, projected: currentTotalMRC + (pipelineMRC * 0.25) },
      { name: 'Mar', current: currentTotalMRC, projected: currentTotalMRC + (pipelineMRC * 0.4) },
      { name: 'Apr', current: currentTotalMRC, projected: currentTotalMRC + (pipelineMRC * 0.6) },
      { name: 'May', current: currentTotalMRC, projected: currentTotalMRC + (pipelineMRC * 0.8) },
      { name: 'Jun', current: currentTotalMRC, projected: currentTotalMRC + pipelineMRC },
    ];
  }, [circuits, deals]);

  const COLORS = ['#00ADB5', '#789DBC', '#C9E9D2', '#FFE3E3', '#f59e0b', '#8b5cf6'];

  const handleUploadSubmit = (formData: any, invoiceName: string, contractName: string) => {
    setIsSubmitting(true);

    // Database integration will replace this.
    setTimeout(() => {
      setIsSubmitting(false);
      setIsUploadModalOpen(false);
      alert("Database integration required for upload.");
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">

      {/* Header */}
      <div className="flex-none p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-charcoal-50">Analytics & Reports</h2>
          <p className="text-slate-500 dark:text-gray-400 mt-1">Cross-module insights from Inventory and Deals.</p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-pastel-blue dark:bg-charcoal-brand text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:bg-opacity-90 transition-all hover:-translate-y-0.5"
        >
          <Upload size={18} />
          <span>Upload Bill / Contract</span>
        </button>
      </div>

      {/* Main Dashboard Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-0 space-y-6">

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-3xl bg-white/60 dark:bg-charcoal-800/60 border border-white/60 dark:border-charcoal-700 backdrop-blur-md flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Inventory Spend</p>
              <h4 className="text-xl font-bold text-slate-800 dark:text-charcoal-50">
                ${circuits.reduce((sum, c) => sum + (c.mrcUsd || 0), 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">/mo</span>
              </h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/60 dark:bg-charcoal-800/60 border border-white/60 dark:border-charcoal-700 backdrop-blur-md flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Server size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Active Circuits</p>
              <h4 className="text-xl font-bold text-slate-800 dark:text-charcoal-50">{circuits.length}</h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/60 dark:bg-charcoal-800/60 border border-white/60 dark:border-charcoal-700 backdrop-blur-md flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Active Deals</p>
              <h4 className="text-xl font-bold text-slate-800 dark:text-charcoal-50">{deals.filter(d => !d.dealStatus.includes('Closed')).length}</h4>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/60 dark:bg-charcoal-800/60 border border-white/60 dark:border-charcoal-700 backdrop-blur-md flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pipeline Value</p>
              <h4 className="text-xl font-bold text-slate-800 dark:text-charcoal-50">
                ${deals.reduce((sum, d) => sum + (d.mcnMicAcv || 0), 0).toLocaleString()}
              </h4>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
          <GlassCard title="Inventory Spend by Country (Top 5)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendByCountry} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} itemStyle={{ color: '#1e293b' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {spendByCountry.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard title="Financial Forecast (Current vs Projected)">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialProjection} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ADB5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00ADB5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9E9D2" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#C9E9D2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Area type="monotone" dataKey="current" stroke="#00ADB5" fillOpacity={1} fill="url(#colorCurrent)" name="Current Spend" />
                <Area type="monotone" dataKey="projected" stroke="#C9E9D2" fillOpacity={1} fill="url(#colorProj)" name="Forecasted Spend" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[350px]">
          <GlassCard title="Carrier Share (By Count)">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={carrierShare}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {carrierShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard title="Deal Velocity Trend (Avg Days)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dealVelocity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Line type="monotone" dataKey="avgDays" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Quick Upload Widget */}
          <GlassCard title="Recent Uploads">
            <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-charcoal-900 border border-slate-100 dark:border-charcoal-700">
                  <div className="p-2 bg-white dark:bg-charcoal-800 rounded-lg shadow-sm">
                    <FileText size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-charcoal-50">Invoice_Oct_{i}.pdf</p>
                    <p className="text-xs text-slate-500">Uploaded by Alex • 2h ago</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};