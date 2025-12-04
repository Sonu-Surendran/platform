import React from 'react';
import { CheckSquare, Network, CalendarRange, Layers } from 'lucide-react';

interface DateFilters {
  submissionStart: string;
  submissionEnd: string;
  targetStart: string;
  targetEnd: string;
}

interface AdvancedFilterPanelProps {
  isVisible: boolean;
  
  // Statuses
  availableStatuses: string[];
  selectedStatuses: string[];
  toggleStatus: (status: string) => void;
  
  // MIC Statuses
  availableMicStatuses: string[];
  selectedMicStatuses: string[];
  toggleMicStatus: (status: string) => void;

  // Request Types
  availableRequestTypes: string[];
  selectedRequestTypes: string[];
  toggleRequestType: (type: string) => void;

  // Dates
  dateFilters: DateFilters;
  setDateFilters: (filters: DateFilters) => void;
  onClear: () => void;
}

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  isVisible,
  availableStatuses,
  selectedStatuses,
  toggleStatus,
  availableMicStatuses,
  selectedMicStatuses,
  toggleMicStatus,
  availableRequestTypes,
  selectedRequestTypes,
  toggleRequestType,
  dateFilters,
  setDateFilters,
  onClear
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-slate-50/95 dark:bg-charcoal-900/95 border-b border-slate-200 dark:border-charcoal-700 p-4 md:p-6 backdrop-blur-md animate-in slide-in-from-top-2 duration-200 relative z-10 shadow-lg">
      <div className="flex flex-col gap-6">
        
        <div className="flex flex-col xl:flex-row gap-6 md:gap-8 items-start">
          
          {/* Request Type Multi-Select */}
          <div className="flex-1 min-w-[250px]">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-3 block flex items-center gap-2">
              <Layers size={14} /> Request Type
            </label>
            <div className="flex flex-wrap gap-2">
              {availableRequestTypes.map(type => {
                const isSelected = selectedRequestTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleRequestType(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border 
                      ${isSelected 
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' 
                        : 'bg-white dark:bg-charcoal-800 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-charcoal-600 hover:border-indigo-500 dark:hover:border-indigo-500'
                      }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Multi-Select */}
          <div className="flex-1 min-w-[300px]">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-3 block flex items-center gap-2">
              <CheckSquare size={14} /> Deal Status
            </label>
            <div className="flex flex-wrap gap-2">
              {availableStatuses.map(status => {
                const isSelected = selectedStatuses.includes(status);
                return (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border 
                      ${isSelected 
                        ? 'bg-pastel-blue dark:bg-charcoal-brand text-white border-pastel-blue dark:border-charcoal-brand shadow-md' 
                        : 'bg-white dark:bg-charcoal-800 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-charcoal-600 hover:border-pastel-blue dark:hover:border-charcoal-brand'
                      }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 md:gap-8 items-start border-t border-slate-200 dark:border-charcoal-700 pt-6">
          
          {/* MIC Status Multi-Select */}
          <div className="flex-1 min-w-[300px]">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-3 block flex items-center gap-2">
              <Network size={14} /> MIC Status
            </label>
            <div className="flex flex-wrap gap-2">
              {availableMicStatuses.map(status => {
                const isSelected = selectedMicStatuses.includes(status);
                return (
                  <button
                    key={status}
                    onClick={() => toggleMicStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border 
                      ${isSelected 
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md' 
                        : 'bg-white dark:bg-charcoal-800 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-charcoal-600 hover:border-amber-500 dark:hover:border-amber-500'
                      }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Ranges */}
          <div className="flex flex-wrap gap-6">
            <div>
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-3 block flex items-center gap-2">
                  <CalendarRange size={14} /> Submission Date
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={dateFilters.submissionStart}
                    onChange={(e) => setDateFilters({...dateFilters, submissionStart: e.target.value})}
                    className="px-3 py-1.5 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-600 rounded-lg text-sm text-slate-700 dark:text-charcoal-50 focus:ring-1 focus:ring-pastel-blue outline-none"
                  />
                  <span className="text-slate-400">-</span>
                  <input 
                    type="date" 
                    value={dateFilters.submissionEnd}
                    onChange={(e) => setDateFilters({...dateFilters, submissionEnd: e.target.value})}
                    className="px-3 py-1.5 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-600 rounded-lg text-sm text-slate-700 dark:text-charcoal-50 focus:ring-1 focus:ring-pastel-blue outline-none"
                  />
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-3 block flex items-center gap-2">
                  <CalendarRange size={14} /> Target Sales Date
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={dateFilters.targetStart}
                    onChange={(e) => setDateFilters({...dateFilters, targetStart: e.target.value})}
                    className="px-3 py-1.5 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-600 rounded-lg text-sm text-slate-700 dark:text-charcoal-50 focus:ring-1 focus:ring-pastel-blue outline-none"
                  />
                  <span className="text-slate-400">-</span>
                  <input 
                    type="date" 
                    value={dateFilters.targetEnd}
                    onChange={(e) => setDateFilters({...dateFilters, targetEnd: e.target.value})}
                    className="px-3 py-1.5 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-600 rounded-lg text-sm text-slate-700 dark:text-charcoal-50 focus:ring-1 focus:ring-pastel-blue outline-none"
                  />
                </div>
            </div>
          </div>

          <div className="flex items-end self-stretch ml-auto">
            <button 
              onClick={onClear}
              className="px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};