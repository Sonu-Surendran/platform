import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Download,
  Briefcase,
  SlidersHorizontal,
  FileText,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';
import { DealRecord, DealNote } from '@/types';
import * as XLSX from 'xlsx';
import { DealDrawer } from '@/components/DealDrawer/DealDrawer';
import { AdvancedFilterPanel } from '@/components/AdvancedFilterPanel/AdvancedFilterPanel';
import { fetchDeals, createDeal, updateDeal, deleteDeal } from '@/services/api';


// Column Definitions for Resizable Table
interface ColumnDef {
  key: keyof DealRecord | 'notes_count';
  label: string;
  minWidth: number;
}

const COLUMNS: ColumnDef[] = [
  { key: 'accountName', label: 'Account Name', minWidth: 150 },
  { key: 'dealStatus', label: 'Deal Status', minWidth: 120 },
  { key: 'salesforceId', label: 'SF ID', minWidth: 100 },
  { key: 'requestType', label: 'Request Type', minWidth: 140 },
  { key: 'mcnMicAcv', label: 'ACV (Total)', minWidth: 120 },
  { key: 'mcnStatus', label: 'MCN Status', minWidth: 120 },
  { key: 'micStatusAccess', label: 'MIC Status', minWidth: 120 },
  { key: 'carrierName', label: 'Carrier', minWidth: 120 },
  { key: 'saLead', label: 'SA Lead', minWidth: 120 },
  { key: 'targetDateSales', label: 'Target Date', minWidth: 120 },
  { key: 'notes_count', label: 'Notes', minWidth: 80 },
];

interface DealsManagementProps {
  targetDealId?: string | null;
  onResetTargetId?: () => void;
  initialFilterStatus?: string | null;
  onResetFilterStatus?: () => void;
}

export const DealsManagement: React.FC<DealsManagementProps> = ({
  targetDealId,
  onResetTargetId,
  initialFilterStatus,
  onResetFilterStatus
}) => {
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [editingDeal, setEditingDeal] = useState<DealRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Multi-select Filters
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedMicStatuses, setSelectedMicStatuses] = useState<string[]>([]);
  const [selectedRequestTypes, setSelectedRequestTypes] = useState<string[]>([]);

  // Date Filters
  const [dateFilters, setDateFilters] = useState({
    submissionStart: '',
    submissionEnd: '',
    targetStart: '',
    targetEnd: ''
  });

  // Table State (Resizing & Selection)
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [selectedDealIds, setSelectedDealIds] = useState<Set<string>>(new Set());

  // Resizing Ref
  const resizingRef = useRef<{ key: string, startX: number, startWidth: number } | null>(null);

  // Initialize Data & Widths
  useEffect(() => {
    const loadDeals = async () => {
      try {
        const data = await fetchDeals();
        setDeals(data);
      } catch (error) {
        console.error("Failed to fetch deals:", error);
      }
    };
    loadDeals();

    // Initialize column widths
    const defaults: Record<string, number> = {};
    COLUMNS.forEach(col => defaults[col.key] = col.minWidth);
    setColWidths(defaults);
  }, []);

  // --- Resizing Logic ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const { key, startX, startWidth } = resizingRef.current;
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff); // Minimum 50px
      setColWidths(prev => ({ ...prev, [key]: newWidth }));
    };

    const handleMouseUp = () => {
      if (resizingRef.current) {
        resizingRef.current = null;
        document.body.style.cursor = 'default';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResizing = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = { key, startX: e.clientX, startWidth: colWidths[key] };
    document.body.style.cursor = 'col-resize';
  };

  // --- Deep Linking & Filtering ---
  useEffect(() => {
    if (targetDealId && deals.length > 0) {
      const foundDeal = deals.find(d => d.id === targetDealId);
      if (foundDeal) {
        setEditingDeal({ ...foundDeal });
        setIsDrawerOpen(true);
        if (onResetTargetId) onResetTargetId();
      }
    }
  }, [targetDealId, deals, onResetTargetId]);

  useEffect(() => {
    if (initialFilterStatus) {
      setSelectedStatuses([initialFilterStatus]);
      setShowAdvancedFilters(true);
      if (onResetFilterStatus) onResetFilterStatus();
    }
  }, [initialFilterStatus, onResetFilterStatus]);

  // --- Filter Logic ---
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch =
        deal.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.salesforceId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedRequestTypes.length === 0 || selectedRequestTypes.includes(deal.requestType);

      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(deal.dealStatus);
      const matchesMicStatus = selectedMicStatuses.length === 0 || selectedMicStatuses.includes(deal.micStatusAccess);

      const matchesSubmissionDate =
        (!dateFilters.submissionStart || deal.submissionDate >= dateFilters.submissionStart) &&
        (!dateFilters.submissionEnd || deal.submissionDate <= dateFilters.submissionEnd);

      const matchesTargetDate =
        (!dateFilters.targetStart || deal.targetDateSales >= dateFilters.targetStart) &&
        (!dateFilters.targetEnd || deal.targetDateSales <= dateFilters.targetEnd);

      return matchesSearch && matchesType && matchesStatus && matchesMicStatus && matchesSubmissionDate && matchesTargetDate;
    });
  }, [deals, searchQuery, selectedRequestTypes, selectedStatuses, selectedMicStatuses, dateFilters]);

  // Calculate available options from data
  const availableRequestTypes = useMemo(() => Array.from(new Set(deals.map(d => d.requestType))).sort(), [deals]);
  // Use preset workflows but fallback to data if missing
  const PRESET_STATUSES = ['Pipeline', 'Qualified', 'Proposed', 'Negotiating', 'Closed Won', 'Closed Lost'];
  const availableStatuses = useMemo(() => {
    const fromData = Array.from(new Set(deals.map(d => d.dealStatus)));
    return Array.from(new Set([...PRESET_STATUSES, ...fromData]));
  }, [deals]);

  const PRESET_MIC_STATUSES = ['Feasible', 'Not Feasible', 'Review', 'Pending'];
  const availableMicStatuses = useMemo(() => {
    const fromData = Array.from(new Set(deals.map(d => d.micStatusAccess)));
    return Array.from(new Set([...PRESET_MIC_STATUSES, ...fromData]));
  }, [deals]);

  // --- Actions ---
  const handleRowClick = (deal: DealRecord) => {
    setEditingDeal({ ...deal });
    setIsDrawerOpen(true);
  };

  const handleSaveDeal = async (updatedDeal: DealRecord) => {
    try {
      const exists = deals.some(d => d.id === updatedDeal.id);
      let savedDeal;
      if (exists) {
        // Update
        savedDeal = updatedDeal; // Optimistic update
        await updateDeal(updatedDeal.id, updatedDeal);
        setDeals(deals.map(d => d.id === updatedDeal.id ? updatedDeal : d));
      } else {
        // Create
        savedDeal = updatedDeal;
        await createDeal(updatedDeal);
        setDeals([updatedDeal, ...deals]);
      }
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Failed to save deal:", error);
      alert("Failed to save deal. Please try again.");
    }
  };

  const handleAddNote = (dealToUpdate: DealRecord, noteText: string) => {
    const note: DealNote = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'Alex Morgan',
      text: noteText,
      timestamp: new Date().toISOString()
    };
    const updatedDeal = { ...dealToUpdate, notes: [note, ...dealToUpdate.notes] };
    const exists = deals.some(d => d.id === updatedDeal.id);
    let updatedDeals;
    if (exists) {
      updatedDeals = deals.map(d => d.id === updatedDeal.id ? updatedDeal : d);
    } else {
      updatedDeals = [updatedDeal, ...deals];
    }
    setDeals(updatedDeals);
    setEditingDeal(updatedDeal);
    localStorage.setItem('deals_data', JSON.stringify(updatedDeals));
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(deals.map(d => ({
      ...d,
      notes: d.notes.map(n => `[${n.timestamp}] ${n.author}: ${n.text}`).join(' | ')
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deals");
    XLSX.writeFile(wb, "Deals_Export.xlsx");
  };

  // --- Selection Actions ---
  const toggleSelectAll = () => {
    if (selectedDealIds.size === filteredDeals.length && filteredDeals.length > 0) {
      setSelectedDealIds(new Set());
    } else {
      setSelectedDealIds(new Set(filteredDeals.map(d => d.id)));
    }
  };

  const toggleRowSelection = (id: string) => {
    const newSet = new Set(selectedDealIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedDealIds(newSet);
  };

  const handleDeleteSelected = async () => {
    if (selectedDealIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedDealIds.size} deals?`)) {
      try {
        // Sequential delete for simplicity, Promise.all for speed
        await Promise.all([...selectedDealIds].map((id: string) => deleteDeal(id)));

        const newDeals = deals.filter(d => !selectedDealIds.has(d.id));
        setDeals(newDeals);
        setSelectedDealIds(new Set());
      } catch (error) {
        console.error("Failed to delete deals:", error);
        alert("Some deals could not be deleted.");
      }
    }
  };

  // --- Advanced Filter Helpers ---
  const toggleStatusSelection = (status: string) => {
    setSelectedStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };
  const toggleMicStatusSelection = (status: string) => {
    setSelectedMicStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };
  const toggleRequestTypeSelection = (type: string) => {
    setSelectedRequestTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };
  const clearAdvancedFilters = () => {
    setSelectedStatuses([]);
    setSelectedMicStatuses([]);
    setSelectedRequestTypes([]);
    setDateFilters({ submissionStart: '', submissionEnd: '', targetStart: '', targetEnd: '' });
  };

  const activeFiltersCount = selectedStatuses.length + selectedMicStatuses.length + selectedRequestTypes.length + (dateFilters.submissionStart ? 1 : 0) + (dateFilters.targetStart ? 1 : 0);

  return (
    <div className="flex flex-col h-full relative overflow-hidden">

      {/* Top Bar */}
      <div className="p-4 md:p-6 border-b border-slate-200 dark:border-charcoal-700 bg-white/50 dark:bg-charcoal-900/50 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center backdrop-blur-sm flex-none relative z-20">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-charcoal-50 flex items-center gap-2">
            <Briefcase className="text-pastel-blue dark:text-charcoal-brand" />
            Deals Management
          </h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Track pipeline, approvals, and solution design status.</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">

          {/* Search */}
          <div className="relative flex-1 xl:flex-none xl:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search Account or SF ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 rounded-xl text-sm text-slate-700 dark:text-charcoal-50 focus:ring-2 focus:ring-pastel-blue dark:focus:ring-charcoal-brand outline-none"
            />
          </div>

          {/* Advanced Filter Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-medium
               ${showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-pastel-blue/10 dark:bg-charcoal-brand/10 border-pastel-blue dark:border-charcoal-brand text-pastel-blue dark:text-charcoal-brand'
                : 'bg-white dark:bg-charcoal-800 border-slate-200 dark:border-charcoal-700 text-slate-600 dark:text-charcoal-50 hover:bg-slate-50 dark:hover:bg-charcoal-700'
              }`}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pastel-blue dark:bg-charcoal-brand text-[10px] text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="w-px h-8 bg-slate-300 dark:bg-charcoal-700 mx-1 hidden xl:block"></div>

          {/* Delete Button (Visible only when rows selected) */}
          {selectedDealIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-all animate-in zoom-in duration-200"
              title="Delete Selected"
            >
              <Trash2 size={20} />
            </button>
          )}

          <button onClick={handleExport} className="p-2 bg-slate-100 dark:bg-charcoal-700 rounded-xl text-slate-600 dark:text-charcoal-50 hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-colors" title="Export Excel">
            <Download size={20} />
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-pastel-blue dark:bg-charcoal-brand text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:bg-opacity-90 transition-all"
            onClick={() => {
              const newDeal: DealRecord = {
                id: `DL-${Date.now()}`,
                accountName: 'New Client',
                requestType: 'New Site',
                mcnStatus: 'Draft',
                micStatusAccess: 'Review',
                dealStatus: 'Pipeline',
                carrierName: 'Pending',
                submissionDate: new Date().toISOString().split('T')[0],
                atpDate: '',
                committedQuoteDate: '',
                targetDateSales: '',
                solutionCompletionDate: '',
                noRequotes: 0,
                saLead: 'Unassigned',
                ddLead: 'Unassigned',
                salesforceId: '',
                solutionSummary: '',
                noCircuits: 0,
                avgCircuitCost: 0,
                circuitValue: 0,
                mcnMicAcv: 0,
                micAcv: 0,
                pmRequired: false,
                serviceActivationRequired: false,
                dealSummary: '',
                notes: []
              };
              setEditingDeal(newDeal);
              setIsDrawerOpen(true);
            }}
          >
            <Plus size={18} /> New Deal
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AdvancedFilterPanel
        isVisible={showAdvancedFilters}
        // Statuses
        availableStatuses={availableStatuses}
        selectedStatuses={selectedStatuses}
        toggleStatus={toggleStatusSelection}
        // MIC Statuses
        availableMicStatuses={availableMicStatuses}
        selectedMicStatuses={selectedMicStatuses}
        toggleMicStatus={toggleMicStatusSelection}
        // Request Types
        availableRequestTypes={availableRequestTypes}
        selectedRequestTypes={selectedRequestTypes}
        toggleRequestType={toggleRequestTypeSelection}
        // Dates
        dateFilters={dateFilters}
        setDateFilters={setDateFilters}
        onClear={clearAdvancedFilters}
      />

      {/* Main Table Area with Resizable Columns */}
      <div className="flex-1 min-h-0 overflow-hidden p-4 md:p-6">
        <div className="h-full rounded-3xl bg-white/70 dark:bg-charcoal-800/70 border border-white/60 dark:border-charcoal-700/60 shadow-lg backdrop-blur-xl overflow-auto custom-scrollbar">
          <div className="w-full inline-block min-w-full align-middle relative">
            <table className="w-full text-left border-collapse table-fixed" style={{ minWidth: '100%' }}>
              <thead className="bg-slate-50/90 dark:bg-charcoal-900/90 sticky top-0 z-10 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                <tr>
                  {/* Checkbox Column */}
                  <th className="p-4 border-b border-r border-slate-200 dark:border-charcoal-700 w-[50px] text-center sticky left-0 z-20 bg-slate-50/90 dark:bg-charcoal-900/90">
                    <button onClick={toggleSelectAll} className="flex items-center justify-center text-slate-400 hover:text-pastel-blue">
                      {selectedDealIds.size > 0 && selectedDealIds.size === filteredDeals.length ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </th>

                  {/* Dynamic Resizable Columns */}
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className="p-4 border-b border-r border-slate-200 dark:border-charcoal-700 relative group select-none"
                      style={{ width: colWidths[col.key], minWidth: col.minWidth }}
                    >
                      <span className="truncate block">{col.label}</span>
                      {/* Drag Handle */}
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-pastel-blue dark:hover:bg-charcoal-brand z-10"
                        onMouseDown={(e) => startResizing(col.key, e)}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-charcoal-800 text-sm">
                {filteredDeals.length > 0 ? filteredDeals.map((deal) => {
                  const isSelected = selectedDealIds.has(deal.id);
                  return (
                    <tr
                      key={deal.id}
                      className={`transition-colors group ${isSelected ? 'bg-blue-50/80 dark:bg-charcoal-700/60' : 'hover:bg-blue-50/30 dark:hover:bg-charcoal-700/30'}`}
                    >
                      {/* Checkbox Cell */}
                      <td className="p-4 border-r border-slate-100 dark:border-charcoal-800 text-center sticky left-0 bg-inherit z-10">
                        <button onClick={() => toggleRowSelection(deal.id)} className={`flex items-center justify-center ${isSelected ? 'text-pastel-blue' : 'text-slate-300 hover:text-slate-400'}`}>
                          {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </td>

                      {/* Dynamic Cells */}
                      {COLUMNS.map(col => (
                        <td
                          key={col.key}
                          className="p-4 border-r border-slate-100 dark:border-charcoal-800 truncate cursor-pointer"
                          onClick={() => handleRowClick(deal)}
                        >
                          {col.key === 'dealStatus' ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold inline-block truncate max-w-full
                                ${deal.dealStatus === 'Closed Won' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                deal.dealStatus === 'Closed Lost' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                              {deal.dealStatus}
                            </span>
                          ) : col.key === 'micStatusAccess' ? (
                            <span className={`px-2 py-1 rounded-md text-xs font-medium inline-block truncate max-w-full
                                ${deal.micStatusAccess === 'Feasible' ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' :
                                deal.micStatusAccess === 'Not Feasible' ? 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20' :
                                  deal.micStatusAccess === 'Review' ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' :
                                    'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-charcoal-900'}`}>
                              {deal.micStatusAccess}
                            </span>
                          ) : col.key === 'mcnMicAcv' ? (
                            <span className="font-medium text-slate-800 dark:text-charcoal-50">${deal.mcnMicAcv.toLocaleString()}</span>
                          ) : col.key === 'accountName' ? (
                            <span className="font-semibold text-slate-800 dark:text-charcoal-50">{deal.accountName}</span>
                          ) : col.key === 'notes_count' ? (
                            <div className="flex items-center gap-1 text-slate-400 dark:text-gray-500">
                              <FileText size={14} /> {deal.notes.length}
                            </div>
                          ) : (
                            <span className="text-slate-600 dark:text-gray-300">{String(deal[col.key as keyof DealRecord] || '')}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={COLUMNS.length + 1} className="p-12 text-center text-slate-500 dark:text-gray-400">
                      No deals found matching the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Editable Side Drawer */}
      {editingDeal && (
        <DealDrawer
          isOpen={isDrawerOpen}
          deal={editingDeal}
          onClose={() => setIsDrawerOpen(false)}
          onSave={handleSaveDeal}
          onAddNote={handleAddNote}
        />
      )}
    </div>
  );
};