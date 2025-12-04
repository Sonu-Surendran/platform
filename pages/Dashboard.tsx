import React, { useEffect, useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { 
  Activity, 
  DollarSign, 
  Server, 
  MoreHorizontal,
  Clock,
  AlertCircle,
  Zap,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { StatCard } from '@/components/StatCard/StatCard';
import { DealRecord, DealNote } from '@/types';
import { generateDummyDeals } from '@/services/dealService';

// --- Components ---

// Updated GlassCard with Charcoal Dark Mode support
const GlassCard = ({ children, className = '', title, action }: { children?: React.ReactNode, className?: string, title?: string, action?: React.ReactNode }) => (
  <div className={`flex flex-col rounded-3xl bg-white/70 dark:bg-charcoal-800/70 backdrop-blur-xl border border-white/60 dark:border-charcoal-700/60 shadow-lg dark:shadow-black/50 p-6 transition-all duration-300 ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-6 flex-none">
        {title && <h3 className="text-slate-700 dark:text-charcoal-50 font-semibold text-lg">{title}</h3>}
        {action}
      </div>
    )}
    <div className="flex-1 w-full min-h-0 relative">
      {children}
    </div>
  </div>
);

interface DashboardProps {
  onNavigateToDeal: (dealId: string) => void;
  onFilterDeals: (status: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToDeal, onFilterDeals }) => {
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [isActionPanelOpen, setIsActionPanelOpen] = useState(false);

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem('deals_data');
    if (saved) {
      try {
        setDeals(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing deals data", e);
      }
    } else {
      const dummy = generateDummyDeals();
      setDeals(dummy);
      localStorage.setItem('deals_data', JSON.stringify(dummy));
    }
  }, []);

  // Handle MIC Status Update
  const handleUpdateMicStatus = (dealId: string, newStatus: string) => {
    const updatedDeals = deals.map(d => d.id === dealId ? { ...d, micStatusAccess: newStatus } : d);
    setDeals(updatedDeals);
    localStorage.setItem('deals_data', JSON.stringify(updatedDeals));
  };

  // --- Metrics Calculation ---
  const metrics = useMemo(() => {
    const totalCircuits = deals.reduce((acc, curr) => acc + (curr.noCircuits || 0), 0);
    const totalMRC = deals.reduce((acc, curr) => acc + (curr.mcnMicAcv || 0), 0); 
    const totalNRC = deals.reduce((acc, curr) => acc + (curr.micAcv || 0), 0); 
    return { totalCircuits, totalMRC, totalNRC };
  }, [deals]);

  // --- Pipeline Data Calculation ---
  const pipelineData = useMemo(() => {
    const stages = ['Pipeline', 'Qualified', 'Proposed', 'Negotiating', 'Closed Won'];
    return stages.map(stage => ({
      name: stage,
      value: deals.filter(d => d.dealStatus === stage).length
    }));
  }, [deals]);

  // --- Activity Feed Calculation ---
  const activityFeed = useMemo(() => {
    const allActivities = deals.flatMap(deal => 
      deal.notes.map(note => ({
        ...note,
        dealId: deal.id,
        dealName: deal.accountName,
        dealStatus: deal.dealStatus
      }))
    );
    return allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  }, [deals]);

  // --- Pending Reviews Calculation ---
  const pendingReviews = useMemo(() => {
    return deals.filter(d => d.micStatusAccess === 'Review');
  }, [deals]);

  // --- Static Data for other charts ---
  const revenueData = [
    { name: 'Jan', value: 4000, value2: 2400 },
    { name: 'Feb', value: 3000, value2: 1398 },
    { name: 'Mar', value: 2000, value2: 9800 },
    { name: 'Apr', value: 2780, value2: 3908 },
    { name: 'May', value: 1890, value2: 4800 },
    { name: 'Jun', value: 2390, value2: 3800 },
    { name: 'Jul', value: 3490, value2: 4300 },
  ];

  const productMixData = [
    { name: 'DIA', value: 400 },
    { name: 'MPLS', value: 300 },
    { name: 'SD-WAN', value: 300 },
    { name: 'Cloud', value: 200 },
  ];

  const regionData = [
    { name: 'NAM', value: 4000 },
    { name: 'EMEA', value: 3000 },
    { name: 'APAC', value: 2000 },
    { name: 'LATAM', value: 1000 },
  ];

  const COLORS = ['#00ADB5', '#789DBC', '#C9E9D2', '#FFE3E3', '#f59e0b']; 

  const getTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } catch (e) {
      return 'Unknown';
    }
  };

  return (
    <div className="h-full relative overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
      
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-charcoal-50">Overview</h2>
            <p className="text-slate-500 dark:text-gray-400 mt-1">Welcome back, here's what's happening today.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white dark:bg-charcoal-800 text-slate-600 dark:text-charcoal-50 text-sm font-medium rounded-xl shadow-sm border border-slate-200 dark:border-charcoal-700 hover:bg-slate-50 dark:hover:bg-charcoal-700 transition-colors">Export Report</button>
            <button onClick={() => onNavigateToDeal('new')} className="px-4 py-2 bg-pastel-blue dark:bg-charcoal-brand text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/20 dark:shadow-cyan-500/20 hover:bg-opacity-90 transition-colors">New Deal</button>
          </div>
        </div>

        {/* Top Metrics Cards - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Circuit Count" 
            value={metrics.totalCircuits.toLocaleString()} 
            trend="12.5%" 
            trendUp={true} 
            icon={<Server size={24} className="text-pastel-blue dark:text-charcoal-brand" />} 
            colorClass="text-pastel-blue dark:text-charcoal-brand"
          />
          <StatCard 
            title="Sum of MRC (USD)" 
            value={`$${metrics.totalMRC.toLocaleString()}`} 
            trend="8.2%" 
            trendUp={true} 
            icon={<Activity size={24} className="text-emerald-500 dark:text-emerald-400" />} 
            colorClass="text-emerald-500 dark:text-emerald-400"
          />
          <StatCard 
            title="Sum of NRC (USD)" 
            value={`$${metrics.totalNRC.toLocaleString()}`} 
            trend="2.4%" 
            trendUp={false} 
            icon={<DollarSign size={24} className="text-rose-500 dark:text-purple-400" />} 
            colorClass="text-rose-500 dark:text-purple-400"
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)] pb-8">
          
          {/* BIG CHART 1: Revenue Trend */}
          <GlassCard className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 h-[400px]" title="Revenue & Forecast (MRC)">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ADB5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00ADB5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9E9D2" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#C9E9D2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="value" stroke="#00ADB5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" name="Actual" />
                <Area type="monotone" dataKey="value2" stroke="#C9E9D2" strokeWidth={3} fillOpacity={1} fill="url(#colorValue2)" name="Forecast" />
                <Legend iconType="circle" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* BIG CHART 2: Pipeline Funnel */}
          <GlassCard className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 h-[400px]" title="Pipeline Stages" action={<button className="text-slate-400 hover:text-slate-600 dark:hover:text-charcoal-50"><MoreHorizontal size={20}/></button>}>
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} layout="vertical" barSize={24}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} itemStyle={{ color: '#1e293b' }} />
                <Bar 
                  dataKey="value" 
                  radius={[0, 10, 10, 0]} 
                  onClick={(data) => onFilterDeals(data.name)}
                  cursor="pointer"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* SMALL CHART 1: Product Mix */}
          <GlassCard className="col-span-1 h-[280px]" title="Product Mix">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productMixData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {productMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} itemStyle={{ color: '#1e293b' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}/>
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* SMALL CHART 2: Regional Sales */}
          <GlassCard className="col-span-1 h-[280px]" title="Regional Sales">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip cursor={{fill: '#f8fafc', opacity: 0.1}} contentStyle={{ borderRadius: '8px', border: 'none' }} itemStyle={{ color: '#1e293b' }} />
                <Bar dataKey="value" fill="#00ADB5" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* SMALL CHART 3: Recent Activity Feed */}
          <GlassCard className="col-span-1 md:col-span-2 h-[280px]" title="Recent Activity" action={<Clock size={16} className="text-slate-400"/>}>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar h-full">
              {activityFeed.length > 0 ? activityFeed.map((activity, i) => (
                <div 
                  key={`${activity.dealId}-${i}`} 
                  onClick={() => onNavigateToDeal(activity.dealId)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-charcoal-700/50 transition-colors border border-transparent hover:border-pastel-blue/20 dark:hover:border-charcoal-700 cursor-pointer group"
                >
                  <div className="h-10 w-10 rounded-full bg-pastel-blue/20 dark:bg-charcoal-brand/20 flex items-center justify-center text-pastel-blue dark:text-charcoal-brand font-bold text-xs flex-none group-hover:scale-110 transition-transform">
                    {activity.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-charcoal-50 truncate">{activity.dealName}</h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{activity.text}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-none ml-2">
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold 
                          ${activity.dealStatus === 'Closed Won' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                            activity.dealStatus === 'Closed Lost' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                       {activity.dealStatus}
                     </span>
                     <span className="text-xs font-medium text-slate-400 whitespace-nowrap">{getTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              )) : (
                 <div className="text-center text-slate-400 text-sm mt-10">No recent activity.</div>
              )}
            </div>
          </GlassCard>

          {/* SMALL CHART 4: Priority Queue */}
          <GlassCard className="col-span-1 h-[280px]" title="Priority Queue">
            <div className="relative h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{name: 'High', value: 30}, {name: 'Med', value: 50}, {name: 'Low', value: 20}]}
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#FFE3E3" /> {/* Pink/High */}
                    <Cell fill="#f59e0b" /> {/* Amber/Med */}
                    <Cell fill="#00ADB5" /> {/* Teal/Low */}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} itemStyle={{ color: '#1e293b' }} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" iconSize={8} wrapperStyle={{ right: 0 }} />
                </PieChart>
              </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-14">
                 <div className="text-center">
                   <span className="text-2xl font-bold text-slate-700 dark:text-charcoal-50">12</span>
                   <p className="text-xs text-slate-400">Critical</p>
                 </div>
               </div>
            </div>
          </GlassCard>

          {/* SMALL CHART 5: SLA Compliance */}
          <GlassCard className="col-span-1 h-[280px]" title="Avg SLA Compliance">
             <div className="flex flex-col h-full">
               <div className="flex-1 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[{v: 98}, {v: 99}, {v: 97}, {v: 99}, {v: 99.5}, {v: 99.9}]}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                     <Tooltip cursor={{stroke: '#cbd5e1'}} contentStyle={{ borderRadius: '8px', border: 'none' }} itemStyle={{ color: '#1e293b' }} />
                     <Line type="step" dataKey="v" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 0}} />
                  </LineChart>
                </ResponsiveContainer>
               </div>
              <div className="flex-none mt-2 text-center pb-1">
                <span className="text-3xl font-bold text-slate-800 dark:text-charcoal-50">99.9%</span>
                <span className="text-xs text-emerald-500 ml-2 font-medium">Target Met</span>
              </div>
             </div>
          </GlassCard>

          {/* SMALL CHART 6: Pending Actions (MIC Reviews) */}
          <GlassCard className="col-span-1 md:col-span-2 h-[280px]" title="Pending Actions" action={<AlertCircle size={16} className="text-amber-500"/>}>
             <div className="flex flex-col h-full">
               <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                 {pendingReviews.length > 0 ? (
                   pendingReviews.slice(0, 4).map((deal, i) => (
                     <div key={deal.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-charcoal-900/40 border border-white dark:border-charcoal-700 transition-colors hover:bg-white dark:hover:bg-charcoal-800/60">
                       <div className="min-w-0 flex-1 mr-3">
                         <p className="text-sm font-medium text-slate-700 dark:text-charcoal-50 truncate">{deal.accountName}</p>
                         <p className="text-xs text-slate-400 truncate">Pending MIC Review</p>
                       </div>
                       <span className="px-2 py-1 rounded-md text-xs font-bold flex-none bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">Review</span>
                     </div>
                   ))
                 ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                      <CheckCircle2 size={16} className="mr-2 text-emerald-500"/> All caught up!
                    </div>
                 )}
               </div>
               <div className="flex-none pt-2">
                  <button 
                    onClick={() => setIsActionPanelOpen(true)}
                    disabled={pendingReviews.length === 0}
                    className="w-full py-2 text-sm font-medium text-pastel-blue dark:text-charcoal-brand bg-pastel-blue/10 dark:bg-charcoal-brand/10 hover:bg-pastel-blue/20 dark:hover:bg-charcoal-brand/20 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    View All {pendingReviews.length} Reviews
                  </button>
               </div>
             </div>
          </GlassCard>

        </div>
      </div>

      {/* MIC Status Action Drawer */}
      {isActionPanelOpen && (
        <>
          <div 
            className="absolute inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsActionPanelOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[400px] bg-white dark:bg-charcoal-800 border-l border-slate-200 dark:border-charcoal-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
             
             <div className="p-6 border-b border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-900 flex justify-between items-center">
               <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-charcoal-50 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500"/> MIC Reviews
                  </h3>
                  <p className="text-xs text-slate-500">{pendingReviews.length} deals pending action</p>
               </div>
               <button onClick={() => setIsActionPanelOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-charcoal-700 rounded-full transition-colors text-slate-500">
                 <X size={20} />
               </button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-white dark:bg-charcoal-800">
               {pendingReviews.length > 0 ? pendingReviews.map(deal => (
                 <div key={deal.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-900 border border-slate-100 dark:border-charcoal-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-charcoal-50">{deal.accountName}</h4>
                        <p className="text-xs text-slate-400 font-mono">{deal.id}</p>
                      </div>
                      <span className="text-xs font-medium text-slate-500 bg-slate-200 dark:bg-charcoal-700 px-2 py-0.5 rounded">
                        {deal.requestType}
                      </span>
                    </div>
                    
                    <div className="mb-3 text-xs text-slate-600 dark:text-gray-400">
                      <p>Carrier: {deal.carrierName}</p>
                      <p>Circuits: {deal.noCircuits}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-charcoal-700">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Update MIC Status</label>
                      <div className="flex gap-2">
                        <select 
                          value={deal.micStatusAccess}
                          onChange={(e) => handleUpdateMicStatus(deal.id, e.target.value)}
                          className="flex-1 text-sm bg-white dark:bg-charcoal-800 border border-slate-300 dark:border-charcoal-600 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-pastel-blue dark:focus:ring-charcoal-brand outline-none"
                        >
                          <option value="Review">Review</option>
                          <option value="Feasible">Feasible</option>
                          <option value="Not Feasible">Not Feasible</option>
                          <option value="Pending">Pending</option>
                        </select>
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                          <AlertCircle size={16} />
                        </div>
                      </div>
                    </div>
                 </div>
               )) : (
                 <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                   <CheckCircle2 size={48} className="mb-4 text-emerald-500 opacity-50" />
                   <p className="font-medium">All reviews complete!</p>
                 </div>
               )}
             </div>
          </div>
        </>
      )}

    </div>
  );
};