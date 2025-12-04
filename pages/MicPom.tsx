import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  FileText,
  Download,
  Calendar,
  User,
  Server,
  DollarSign,
  MapPin,
  FileCheck,
  X,
  Building2,
  CreditCard,
  Clock
} from 'lucide-react';
import { MicPomRecord } from '@/types';
import * as XLSX from 'xlsx';

// Helper for Detail Fields in Drawer
const DetailRow = ({ label, value, icon }: { label: string, value: string | number, icon?: React.ReactNode }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-charcoal-900 border border-slate-100 dark:border-charcoal-700">
    {icon && <div className="mt-0.5 text-slate-400 dark:text-charcoal-brand">{icon}</div>}
    <div>
      <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-slate-800 dark:text-charcoal-50 mt-0.5 break-words">{value || '-'}</p>
    </div>
  </div>
);

export const MicPom: React.FC = () => {
  const [data, setData] = useState<MicPomRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MicPomRecord | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mic_pom_data');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse MIC POM data", e);
      }
    }
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.circuitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.carrierName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MIC POM");
    XLSX.writeFile(wb, "MIC_POM_Export.xlsx");
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-none">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-charcoal-50">MIC POM</h2>
          <p className="text-slate-500 dark:text-gray-400 mt-1">Project Order Management - Uploaded Bills & Contracts</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-charcoal-800 text-slate-600 dark:text-charcoal-50 text-sm font-medium rounded-xl shadow-sm border border-slate-200 dark:border-charcoal-700 hover:bg-slate-50 dark:hover:bg-charcoal-700 transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 p-4 rounded-2xl bg-white/70 dark:bg-charcoal-800/70 border border-white/60 dark:border-charcoal-700/60 shadow-sm backdrop-blur-xl flex-none">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search Customer, Carrier, or Circuit ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-sm text-slate-700 dark:text-charcoal-50 focus:outline-none focus:ring-2 focus:ring-pastel-blue dark:focus:ring-charcoal-brand transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 min-h-0 overflow-hidden rounded-3xl bg-white/70 dark:bg-charcoal-800/70 border border-white/60 dark:border-charcoal-700/60 shadow-lg backdrop-blur-xl flex flex-col">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/80 dark:bg-charcoal-900/80 sticky top-0 z-10 backdrop-blur-md">
              <tr className="border-b border-slate-200 dark:border-charcoal-700 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Circuit Details</th>
                <th className="px-6 py-4">Financials</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Documents</th>
                <th className="px-6 py-4">Uploaded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-charcoal-800">
              {filteredData.length > 0 ? (
                filteredData.map((record) => (
                  <tr 
                    key={record.id} 
                    onClick={() => setSelectedRecord(record)}
                    className="hover:bg-slate-50/50 dark:hover:bg-charcoal-700/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-charcoal-50 group-hover:text-pastel-blue dark:group-hover:text-charcoal-brand transition-colors">{record.customerName}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={10} /> {record.country}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-charcoal-50 flex items-center gap-2">
                           <Server size={14} className="text-slate-400"/> {record.circuitId}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{record.carrierName} • {record.carrierCircuitId || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="text-xs text-slate-400 w-8">MRC:</span> ${record.mrc.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400 mt-1">
                          <span className="text-xs text-slate-400 w-8">NRC:</span> ${record.nrc.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600 dark:text-gray-400 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-slate-400"/> Bill: <span className="font-medium text-slate-800 dark:text-charcoal-50">{record.billingDate || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-slate-400"/> HO: <span className="font-medium text-slate-800 dark:text-charcoal-50">{record.handoverDate || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                         <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-xs text-slate-600 dark:text-gray-400 flex items-center gap-1">
                           <FileCheck size={12} /> Inv
                         </span>
                         <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-xs text-slate-600 dark:text-gray-400 flex items-center gap-1">
                           <FileText size={12} /> Ctr
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-500">
                        <p className="font-medium text-slate-700 dark:text-gray-300">{record.uploaderName}</p>
                        <p>{new Date(record.timestamp).toLocaleDateString()}</p>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-gray-400">
                    No records found. Use the Analytics page to upload Bills/Contracts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel Drawer */}
      {selectedRecord && (
        <>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedRecord(null)}
          />
          
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-[500px] bg-white dark:bg-charcoal-800 border-l border-slate-200 dark:border-charcoal-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-900 flex justify-between items-center sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-charcoal-50">{selectedRecord.customerName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedRecord.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-charcoal-700 rounded-full transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-white dark:bg-charcoal-800">
              
              {/* Section: Customer Info */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-charcoal-50">
                  <User size={16} className="text-pastel-blue dark:text-charcoal-brand"/> Customer Details
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <DetailRow label="Address" value={selectedRecord.address} icon={<MapPin size={14}/>} />
                  <div className="grid grid-cols-2 gap-3">
                     <DetailRow label="Country" value={selectedRecord.country} />
                     <DetailRow label="Customer Name" value={selectedRecord.customerName} />
                  </div>
                </div>
              </div>

              {/* Section: Circuit Info */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-charcoal-50">
                  <Server size={16} className="text-pastel-blue dark:text-charcoal-brand"/> Circuit Information
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <DetailRow label="Circuit ID" value={selectedRecord.circuitId} icon={<Server size={14}/>} />
                  <div className="grid grid-cols-2 gap-3">
                    <DetailRow label="Carrier Name" value={selectedRecord.carrierName} icon={<Building2 size={14}/>} />
                    <DetailRow label="Carrier Ckt ID" value={selectedRecord.carrierCircuitId} />
                  </div>
                </div>
              </div>

              {/* Section: Financials */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-charcoal-50">
                  <DollarSign size={16} className="text-pastel-blue dark:text-charcoal-brand"/> Financials
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">MRC (Monthly)</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1">${selectedRecord.mrc.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-charcoal-900 border border-slate-100 dark:border-charcoal-700">
                    <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">NRC (One-Time)</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-gray-300 mt-1">${selectedRecord.nrc.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Section: Dates */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-charcoal-50">
                  <Calendar size={16} className="text-pastel-blue dark:text-charcoal-brand"/> Critical Dates
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow label="Billing Date" value={selectedRecord.billingDate} icon={<Calendar size={14}/>} />
                  <DetailRow label="Handover Date" value={selectedRecord.handoverDate} icon={<Calendar size={14}/>} />
                </div>
              </div>

              {/* Section: Documents */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-charcoal-50">
                  <FileText size={16} className="text-pastel-blue dark:text-charcoal-brand"/> Documentation
                </h4>
                <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-charcoal-900 border border-slate-100 dark:border-charcoal-700 group cursor-pointer hover:bg-blue-50 dark:hover:bg-charcoal-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-charcoal-800 rounded-lg shadow-sm">
                           <FileCheck size={16} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-charcoal-50">{selectedRecord.invoiceFile}</p>
                          <p className="text-xs text-slate-400">Invoice Document</p>
                        </div>
                      </div>
                      <Download size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                   </div>

                   <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-charcoal-900 border border-slate-100 dark:border-charcoal-700 group cursor-pointer hover:bg-blue-50 dark:hover:bg-charcoal-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-charcoal-800 rounded-lg shadow-sm">
                           <FileText size={16} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-charcoal-50">{selectedRecord.contractFile}</p>
                          <p className="text-xs text-slate-400">Contract Document</p>
                        </div>
                      </div>
                      <Download size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                   </div>
                </div>
              </div>

              {/* Metadata Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-charcoal-700 text-xs text-slate-400 flex justify-between items-center">
                <span>Uploaded by <strong className="text-slate-600 dark:text-gray-300">{selectedRecord.uploaderName}</strong></span>
                <span className="flex items-center gap-1"><Clock size={12}/> {new Date(selectedRecord.timestamp).toLocaleString()}</span>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
};