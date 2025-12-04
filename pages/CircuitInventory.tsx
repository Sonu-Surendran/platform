import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  MapPin,
  Globe,
  Upload,
  X,
  Server,
  FileText,
  Zap,
  ShieldCheck,
  CreditCard,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Circuit } from '@/types';
import * as XLSX from 'xlsx';

// Helper component for Detail fields
const DetailField = ({ label, value, fullWidth = false, highlight = false }: { label: string, value: string | number | undefined, fullWidth?: boolean, highlight?: boolean }) => (
  <div className={`flex flex-col ${fullWidth ? 'col-span-full' : ''} ${highlight ? 'bg-white dark:bg-charcoal-800 p-2 md:p-3 rounded-xl border border-slate-100 dark:border-charcoal-700 shadow-sm' : ''}`}>
    <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-0.5 md:mb-1.5">{label}</span>
    <span className={`text-xs md:text-sm font-medium break-words ${highlight ? 'text-slate-900 dark:text-charcoal-50 font-bold text-sm md:text-lg' : 'text-slate-700 dark:text-charcoal-50'}`}>
      {value || <span className="text-slate-300 dark:text-gray-700 italic">N/A</span>}
    </span>
  </div>
);

const DetailSection = ({ title, icon, colorClass, children }: { title: string, icon: React.ReactNode, colorClass: string, children?: React.ReactNode }) => (
  <div className="rounded-3xl bg-slate-50/50 dark:bg-charcoal-900/40 border border-slate-200 dark:border-charcoal-700 overflow-hidden flex flex-col h-full">
    <div className={`px-4 py-2 md:px-5 md:py-3 border-b border-slate-100 dark:border-charcoal-700 bg-white/50 dark:bg-charcoal-800/50 flex items-center gap-2`}>
      <div className={`p-1 md:p-1.5 rounded-lg ${colorClass}`}>
        {icon}
      </div>
      <h4 className="font-bold text-sm md:text-base text-slate-700 dark:text-charcoal-50 tracking-tight">{title}</h4>
    </div>
    <div className="p-4 md:p-5 grid grid-cols-2 gap-3 md:gap-4 flex-1">
      {children}
    </div>
  </div>
);

export const CircuitInventory: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<Circuit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filters
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCarrier, setSelectedCarrier] = useState('All');

  // Load data from LocalStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('circuit_inventory_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed)) {
          setInventoryData(parsed);
        }
      } catch (error) {
        console.error("Failed to load inventory data from storage:", error);
      }
    }
  }, []);

  // Excel File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      const parsedCircuits: Circuit[] = (data.slice(1) as any[]).map((row, index) => {
        const get = (idx: number) => row[idx] !== undefined ? String(row[idx]) : '';
        const getNum = (idx: number) => {
          const val = parseFloat(row[idx]);
          return isNaN(val) ? 0 : val;
        };

        return {
          id: `IMP-${1000 + index}`,
          address: get(0),
          city: get(1),
          state: get(2),
          zip: get(3),
          country: get(4),
          term: getNum(5),
          circuitType: get(6),
          dlMbps: get(7),
          ulMbps: get(8),
          quoteType: get(9),
          ipRange: get(10),
          otc: getNum(11),
          mrc: getNum(12),
          currency: get(13),
          carrierPartner: get(14),
          lmp: get(15),
          mttrSla: get(16),
          availabilitySla: get(17),
          timestamp: new Date().toISOString(),
          notes: get(19),
          client: get(20),
          region: get(21),
          usedInCpq: get(22),
          nrcUsd: getNum(23),
          mrcUsd: getNum(24),
        };
      });

      if (parsedCircuits.length > 0) {
        setInventoryData(parsedCircuits);
        // Persist to Local Storage
        localStorage.setItem('circuit_inventory_data', JSON.stringify(parsedCircuits));
        
        // Reset filters
        setSelectedType('All');
        setSelectedCountry('All');
        setSelectedCarrier('All');
        setCurrentPage(1);
      }
    };
    reader.readAsBinaryString(file);
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Derived Data
  const filteredData = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    
    return inventoryData.filter(item => {
      // Search across all properties of the item object
      const matchesSearch = searchQuery === '' || Object.values(item).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(lowerQuery)
      );

      const matchesType = selectedType === 'All' || item.circuitType === selectedType;
      const matchesCountry = selectedCountry === 'All' || item.country === selectedCountry;
      const matchesCarrier = selectedCarrier === 'All' || item.carrierPartner === selectedCarrier;

      return matchesSearch && matchesType && matchesCountry && matchesCarrier;
    });
  }, [inventoryData, searchQuery, selectedType, selectedCountry, selectedCarrier]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const uniqueTypes = ['All', ...new Set(inventoryData.map(item => item.circuitType).filter(Boolean))];
  const uniqueCountries = ['All', ...new Set(inventoryData.map(item => item.country).filter(Boolean))];
  const uniqueCarriers = ['All', ...new Set(inventoryData.map(item => item.carrierPartner).filter(Boolean))];

  return (
    <div className={`h-full flex flex-col relative overflow-hidden ${isFocusMode ? 'p-0 space-y-0' : 'p-3 md:p-6 space-y-3 md:space-y-6'}`}>
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".xlsx, .xls" 
        className="hidden" 
      />

      {/* Header - Hidden in Focus Mode */}
      {!isFocusMode && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 flex-none">
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-charcoal-50">Circuit Inventory</h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 mt-0.5 md:mt-1">Manage and track global connectivity assets.</p>
          </div>
          <div className="flex gap-2 md:gap-3">
             <button 
               onClick={handleImportClick}
               className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-pastel-blue dark:bg-charcoal-brand text-white text-xs md:text-sm font-medium rounded-xl shadow-lg shadow-blue-500/20 dark:shadow-cyan-500/20 hover:bg-opacity-90 transition-colors"
             >
              <Upload size={14} className="md:w-4 md:h-4" />
              Import Excel
            </button>
            <button className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white dark:bg-charcoal-800 text-slate-600 dark:text-charcoal-50 text-xs md:text-sm font-medium rounded-xl shadow-sm border border-slate-200 dark:border-charcoal-700 hover:bg-slate-50 dark:hover:bg-charcoal-700 transition-colors">
              <Download size={14} className="md:w-4 md:h-4" />
              Export CSV
            </button>
            <button 
              onClick={() => setIsFocusMode(true)}
              className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white dark:bg-charcoal-800 text-slate-600 dark:text-charcoal-50 text-xs md:text-sm font-medium rounded-xl shadow-sm border border-slate-200 dark:border-charcoal-700 hover:bg-slate-50 dark:hover:bg-charcoal-700 transition-colors"
              title="Focus Mode"
            >
              <Maximize2 size={14} className="md:w-4 md:h-4" />
              <span className="hidden md:inline">Focus</span>
            </button>
          </div>
        </div>
      )}

      {/* Controls Toolbar - Hidden in Focus Mode */}
      {!isFocusMode && (
        <div className="flex flex-col xl:flex-row gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white/70 dark:bg-charcoal-800/70 border border-white/60 dark:border-charcoal-700/60 shadow-sm backdrop-blur-xl flex-none">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search any field..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-1.5 md:py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-xs md:text-sm text-slate-700 dark:text-charcoal-50 focus:outline-none focus:ring-2 focus:ring-pastel-blue dark:focus:ring-charcoal-brand transition-all"
            />
            <Search className="absolute left-3 top-2 md:top-2.5 text-slate-400 w-4 h-4 md:w-[18px] md:h-[18px]" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-2.5 top-2 md:top-2.5 text-slate-400 z-10 w-3.5 h-3.5 md:w-4 md:h-4" />
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full md:w-auto pl-8 pr-6 md:pl-9 md:pr-8 py-1.5 md:py-2 appearance-none rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-700 dark:text-charcoal-50 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-pastel-blue dark:focus:ring-charcoal-brand cursor-pointer relative"
              >
                {uniqueTypes.slice(0, 10).map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
              </select>
            </div>

            <div className="relative flex-1 md:flex-none">
              <Globe className="absolute left-2.5 top-2 md:top-2.5 text-slate-400 z-10 w-3.5 h-3.5 md:w-4 md:h-4" />
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full md:w-auto pl-8 pr-6 md:pl-9 md:pr-8 py-1.5 md:py-2 appearance-none rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-700 dark:text-charcoal-50 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-pastel-blue dark:focus:ring-charcoal-brand cursor-pointer relative"
              >
                {uniqueCountries.slice(0, 10).map(c => <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>)}
              </select>
            </div>

            <div className="relative flex-1 md:flex-none">
              <MapPin className="absolute left-2.5 top-2 md:top-2.5 text-slate-400 z-10 w-3.5 h-3.5 md:w-4 md:h-4" />
              <select 
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value)}
                className="w-full md:w-auto pl-8 pr-6 md:pl-9 md:pr-8 py-1.5 md:py-2 appearance-none rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-slate-700 dark:text-charcoal-50 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-pastel-blue dark:focus:ring-charcoal-brand cursor-pointer relative"
              >
                {uniqueCarriers.slice(0, 10).map(c => <option key={c} value={c}>{c === 'All' ? 'All Carriers' : c}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className={`flex-1 min-h-0 overflow-hidden flex flex-col ${isFocusMode ? 'bg-white dark:bg-charcoal-900' : 'rounded-3xl bg-white/70 dark:bg-charcoal-800/70 border border-white/60 dark:border-charcoal-700/60 shadow-lg backdrop-blur-xl'}`}>
        
        {isFocusMode && (
          <div className="flex-none flex justify-end px-4 py-2 bg-slate-50 dark:bg-charcoal-900 border-b border-slate-200 dark:border-charcoal-700 z-20">
            <button 
              onClick={() => setIsFocusMode(false)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-charcoal-800 text-slate-700 dark:text-charcoal-50 rounded-full shadow-sm hover:bg-slate-300 dark:hover:bg-charcoal-700 transition-all font-medium text-xs border border-slate-300 dark:border-charcoal-600"
            >
              <Minimize2 size={14} /> Exit Focus
            </button>
          </div>
        )}

        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap">
            <thead className={`bg-slate-50/80 dark:bg-charcoal-900/80 sticky top-0 z-10 backdrop-blur-md ${isFocusMode ? 'shadow-sm' : ''}`}>
              <tr className="border-b border-slate-200 dark:border-charcoal-700">
                {[
                  'Client', 'Circuit ID', 'Address', 'City', 'Country', 'Carrier', 
                  'Type', 'Bandwidth (DL/UL)', 'MRC (USD)', 'NRC (USD)', 'Term (Mo)', 'SLA', 'Actions'
                ].map((header) => (
                  <th key={header} className="px-3 py-2 md:px-6 md:py-4 text-[10px] md:text-xs font-semibold text-slate-600 dark:text-charcoal-50 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-charcoal-800">
              {currentData.length > 0 ? (
                currentData.map((circuit) => (
                  <tr 
                    key={circuit.id} 
                    onClick={() => setSelectedCircuit(circuit)}
                    className="hover:bg-slate-50/50 dark:hover:bg-charcoal-700/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-medium text-slate-800 dark:text-charcoal-50">
                      {circuit.client}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-pastel-blue dark:text-charcoal-brand font-medium">
                      {circuit.id}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-slate-500 dark:text-gray-400 max-w-[140px] md:max-w-[200px] truncate" title={circuit.address}>
                      {circuit.address}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-slate-600 dark:text-charcoal-50">
                      {circuit.city}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-slate-600 dark:text-charcoal-50">
                      {circuit.country}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-slate-100 dark:bg-charcoal-700 text-slate-800 dark:text-charcoal-50 border border-slate-200 dark:border-charcoal-600">
                        {circuit.carrierPartner}
                      </span>
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-slate-600 dark:text-gray-400">
                      {circuit.circuitType}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-slate-600 dark:text-gray-400">
                      {circuit.dlMbps} / {circuit.ulMbps}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-medium text-slate-800 dark:text-charcoal-50">
                      ${circuit.mrcUsd.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-slate-600 dark:text-gray-400">
                      ${circuit.nrcUsd.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-slate-600 dark:text-gray-400">
                      {circuit.term}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4">
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] md:text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md">
                        {circuit.availabilitySla || 'N/A'}
                      </span>
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4">
                      <button className="p-1.5 md:p-2 hover:bg-slate-200 dark:hover:bg-charcoal-700 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-charcoal-50">
                        <MoreHorizontal size={14} className="md:w-4 md:h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-slate-500 dark:text-gray-400 text-sm">
                    {inventoryData.length === 0 ? "No data loaded. Please Import Excel." : "No circuits found matching your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-t border-slate-200 dark:border-charcoal-700 bg-slate-50/50 dark:bg-charcoal-900/50 flex-none">
          <div className="text-xs md:text-sm text-slate-500 dark:text-gray-400 hidden sm:block">
            Showing <span className="font-medium text-slate-700 dark:text-charcoal-50">{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium text-slate-700 dark:text-charcoal-50">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-medium text-slate-700 dark:text-charcoal-50">{filteredData.length}</span> results
          </div>
          <div className="flex items-center gap-1 md:gap-2 ml-auto">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 md:p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-700 text-slate-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} className="md:w-[18px] md:h-[18px]" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                   pageNum = currentPage - 2 + i;
                   if (pageNum > totalPages) pageNum -= (pageNum - totalPages);
                }
                if (pageNum > totalPages || pageNum < 1) return null;
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-7 w-7 md:h-8 md:w-8 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-pastel-blue dark:bg-charcoal-brand text-white'
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-charcoal-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 md:p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-700 text-slate-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} className="md:w-[18px] md:h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal Overlay */}
      {selectedCircuit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-charcoal-800/95 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-charcoal-700 animate-in zoom-in-95 duration-200 custom-scrollbar flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 md:px-8 md:py-6 border-b border-slate-200 dark:border-charcoal-700 bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-md flex-none">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-pastel-blue to-blue-400 dark:from-charcoal-brand dark:to-teal-600 flex items-center justify-center text-white shadow-lg hidden sm:flex">
                  <Server size={20} className="md:w-[28px] md:h-[28px]" />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-charcoal-50 tracking-tight">
                    {selectedCircuit.client}
                  </h3>
                  <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1">
                    <span className="font-mono text-[10px] md:text-xs bg-slate-100 dark:bg-charcoal-900 px-1.5 py-0.5 rounded text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-charcoal-700">
                      ID: {selectedCircuit.id}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] md:text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                      {selectedCircuit.circuitType}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCircuit(null)}
                className="p-1.5 md:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-charcoal-700 text-slate-400 hover:text-slate-600 dark:hover:text-charcoal-50 transition-colors"
              >
                <X size={24} className="md:w-[28px] md:h-[28px]" />
              </button>
            </div>

            {/* Modal Body - Panels Layout */}
            <div className="p-4 md:p-8 space-y-4 md:space-y-8 bg-slate-50/30 dark:bg-charcoal-900/30 flex-1 overflow-y-auto custom-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                
                {/* Panel 1: Location */}
                <DetailSection 
                  title="Location & Site" 
                  icon={<MapPin size={16} className="text-blue-600 dark:text-blue-400 md:w-5 md:h-5" />}
                  colorClass="bg-blue-100 dark:bg-blue-900/40"
                >
                   <DetailField label="Address" value={selectedCircuit.address} fullWidth />
                   <DetailField label="City" value={selectedCircuit.city} />
                   <DetailField label="State/Prov" value={selectedCircuit.state} />
                   <DetailField label="Zip Code" value={selectedCircuit.zip} />
                   <DetailField label="Country" value={selectedCircuit.country} />
                   <DetailField label="Region" value={selectedCircuit.region} />
                </DetailSection>

                {/* Panel 2: Technical Specs */}
                <DetailSection 
                  title="Technical Specs" 
                  icon={<Zap size={16} className="text-amber-600 dark:text-amber-400 md:w-5 md:h-5" />}
                  colorClass="bg-amber-100 dark:bg-amber-900/40"
                >
                   <DetailField label="Bandwidth (DL)" value={selectedCircuit.dlMbps ? `${selectedCircuit.dlMbps} Mbps` : ''} highlight />
                   <DetailField label="Bandwidth (UL)" value={selectedCircuit.ulMbps ? `${selectedCircuit.ulMbps} Mbps` : ''} highlight />
                   <DetailField label="IP Range" value={selectedCircuit.ipRange} fullWidth />
                   <DetailField label="Quote Type" value={selectedCircuit.quoteType} />
                   <DetailField label="Carrier" value={selectedCircuit.carrierPartner} />
                   <DetailField label="Last Mile Provider" value={selectedCircuit.lmp} fullWidth />
                </DetailSection>

                {/* Panel 3: Financials */}
                <DetailSection 
                  title="Financials" 
                  icon={<CreditCard size={16} className="text-emerald-600 dark:text-emerald-400 md:w-5 md:h-5" />}
                  colorClass="bg-emerald-100 dark:bg-emerald-900/40"
                >
                   <DetailField label="USD MRC" value={`$${selectedCircuit.mrcUsd?.toLocaleString()}`} highlight />
                   <DetailField label="USD NRC" value={`$${selectedCircuit.nrcUsd?.toLocaleString()}`} highlight />
                   <DetailField label="Local Currency" value={selectedCircuit.currency} />
                   <DetailField label="Contract Term" value={`${selectedCircuit.term} Months`} />
                   <DetailField label="Local MRC" value={selectedCircuit.mrc?.toLocaleString()} />
                   <DetailField label="Local NRC" value={selectedCircuit.otc?.toLocaleString()} />
                </DetailSection>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                 {/* Panel 4: SLA & Performance */}
                 <DetailSection 
                  title="Service Level Agreement" 
                  icon={<ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400 md:w-5 md:h-5" />}
                  colorClass="bg-indigo-100 dark:bg-indigo-900/40"
                >
                   <div className="col-span-2 grid grid-cols-2 gap-4">
                      <DetailField label="Availability Target" value={selectedCircuit.availabilitySla} highlight />
                      <DetailField label="MTTR Target" value={selectedCircuit.mttrSla} />
                   </div>
                </DetailSection>

                 {/* Panel 5: Metadata */}
                 <DetailSection 
                  title="Notes & Metadata" 
                  icon={<FileText size={16} className="text-slate-600 dark:text-slate-400 md:w-5 md:h-5" />}
                  colorClass="bg-slate-200 dark:bg-slate-700/50"
                >
                   <DetailField label="Last Updated" value={selectedCircuit.timestamp?.split('T')[0]} />
                   <DetailField label="CPQ Reference" value={selectedCircuit.usedInCpq} />
                   <div className="col-span-2 mt-2">
                     <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-1 block">Internal Notes</span>
                     <p className="text-xs md:text-sm text-slate-600 dark:text-gray-300 bg-white dark:bg-charcoal-900 p-2 md:p-3 rounded-xl border border-slate-100 dark:border-charcoal-700 min-h-[60px]">
                       {selectedCircuit.notes || 'No additional notes provided.'}
                     </p>
                   </div>
                </DetailSection>
              </div>

            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white/95 dark:bg-charcoal-900/95 px-4 py-3 md:px-8 md:py-5 border-t border-slate-200 dark:border-charcoal-700 flex justify-end gap-3 rounded-b-3xl backdrop-blur-md flex-none">
              <button 
                onClick={() => setSelectedCircuit(null)}
                className="px-4 py-2 md:px-6 md:py-2.5 bg-slate-100 dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-slate-700 dark:text-charcoal-50 text-xs md:text-sm font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-charcoal-700 transition-colors"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};