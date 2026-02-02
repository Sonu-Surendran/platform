import React, { useState, useEffect } from 'react';
import { X, Play, Settings2, DollarSign, AlertCircle } from 'lucide-react';
import { CurrencyConfig, ScanConfig } from '@/utils/matrixUtils';

interface ScanMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedCurrencies: string[];
  onProcess: (config: ScanConfig) => void;
}

export const ScanMatrixModal: React.FC<ScanMatrixModalProps> = ({
  isOpen,
  onClose,
  detectedCurrencies,
  onProcess
}) => {
  const [months, setMonths] = useState<number>(12);
  const [targetSiteId, setTargetSiteId] = useState('');
  const [minSla, setMinSla] = useState<string>('');
  
  const [currencyRates, setCurrencyRates] = useState<Record<string, CurrencyConfig>>({});

  // Initialize currency config when detected list changes
  useEffect(() => {
    const initialRates: Record<string, CurrencyConfig> = {};
    detectedCurrencies.forEach(curr => {
      initialRates[curr] = { rate: 1.0, buffer: 0 };
    });
    setCurrencyRates(initialRates);
  }, [detectedCurrencies, isOpen]);

  const handleRateChange = (curr: string, field: keyof CurrencyConfig, value: string) => {
    const numVal = parseFloat(value) || 0;
    setCurrencyRates(prev => ({
      ...prev,
      [curr]: {
        ...prev[curr],
        [field]: numVal
      }
    }));
  };

  const handleSubmit = () => {
    onProcess({
      months,
      targetSiteId: targetSiteId.trim() || undefined,
      minSla: minSla ? parseFloat(minSla) : undefined,
      currencyRates
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-charcoal-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-charcoal-700 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-900 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-charcoal-50 flex items-center gap-2">
            <Settings2 size={20} className="text-pastel-blue dark:text-charcoal-brand"/>
            Scan Parameters
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-charcoal-700 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-6">
          
          {/* Section 1: Core Config */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-charcoal-50">Calculation Settings</label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase mb-1 block">Term (Months)</label>
                <input 
                  type="number" 
                  min="1"
                  value={months}
                  onChange={(e) => setMonths(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pastel-blue"
                />
              </div>
              <div>
                 <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase mb-1 block">Min SLA % (Optional)</label>
                 <input 
                  type="number" 
                  placeholder="e.g. 99.5"
                  value={minSla}
                  onChange={(e) => setMinSla(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pastel-blue"
                />
              </div>
            </div>

            <div>
               <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase mb-1 block">Client-Site ID (Optional)</label>
               <input 
                  type="text" 
                  placeholder="Filter for specific site..."
                  value={targetSiteId}
                  onChange={(e) => setTargetSiteId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pastel-blue"
                />
            </div>
          </div>

          {/* Section 2: Currency Config */}
          {detectedCurrencies.length > 0 ? (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-charcoal-700">
               <div className="flex items-center gap-2 mb-2">
                 <DollarSign size={16} className="text-amber-500"/>
                 <label className="text-sm font-bold text-slate-700 dark:text-charcoal-50">Currency Conversion</label>
               </div>
               <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-200 mb-3 flex gap-2">
                  <AlertCircle size={16} className="flex-none"/>
                  Non-USD currencies detected. Please provide conversion rates to USD.
               </div>

               <div className="space-y-3">
                 {detectedCurrencies.map(curr => (
                   <div key={curr} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-charcoal-900 rounded-xl border border-slate-200 dark:border-charcoal-700">
                      <div className="w-12 font-bold text-slate-700 dark:text-charcoal-50">{curr}</div>
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 uppercase">Rate to USD</label>
                        <input 
                          type="number"
                          step="0.01"
                          placeholder="1.0"
                          value={currencyRates[curr]?.rate || ''}
                          onChange={(e) => handleRateChange(curr, 'rate', e.target.value)}
                          className="w-full p-1 bg-transparent border-b border-slate-300 dark:border-charcoal-600 focus:border-pastel-blue outline-none text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 uppercase">Buffer %</label>
                         <input 
                          type="number"
                          step="0.1"
                          placeholder="0"
                          value={currencyRates[curr]?.buffer || ''}
                          onChange={(e) => handleRateChange(curr, 'buffer', e.target.value)}
                          className="w-full p-1 bg-transparent border-b border-slate-300 dark:border-charcoal-600 focus:border-pastel-blue outline-none text-sm"
                        />
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 dark:border-charcoal-700 text-sm text-slate-400 italic flex items-center gap-2">
               <DollarSign size={16}/> No non-USD currencies detected.
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-900 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl dark:text-gray-300 dark:hover:bg-charcoal-700 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-pastel-blue dark:bg-charcoal-brand text-white font-medium rounded-xl shadow-lg hover:bg-opacity-90 transition-all">
            <Play size={16} /> Process Data
          </button>
        </div>

      </div>
    </div>
  );
};