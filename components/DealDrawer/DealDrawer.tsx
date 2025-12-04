import React, { useState } from 'react';
import { 
  Save, 
  Briefcase, 
  User, 
  Calendar, 
  DollarSign, 
  Layers, 
  FileText, 
  Send 
} from 'lucide-react';
import { DealRecord, DealNote } from '@/types';

interface DealDrawerProps {
  deal: DealRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDeal: DealRecord) => void;
  onAddNote: (updatedDeal: DealRecord, noteText: string) => void;
}

// Helper Components for Form Fields
const FormField = ({ label, children, className = '' }: { label: string, children?: React.ReactNode, className?: string }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const Input = ({ 
  value, 
  onChange, 
  type = "text", 
  placeholder = "" 
}: { 
  value: string | number; 
  onChange: (val: string | number) => void; 
  type?: string; 
  placeholder?: string; 
}) => (
  <input 
    type={type}
    value={value}
    onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 rounded-xl text-sm text-slate-700 dark:text-charcoal-50 focus:ring-2 focus:ring-pastel-blue dark:focus:ring-charcoal-brand outline-none transition-all"
  />
);

const Select = ({ 
  value, 
  onChange, 
  options 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: string[]; 
}) => (
  <div className="relative">
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-3 pr-8 py-2 bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 rounded-xl text-sm text-slate-700 dark:text-charcoal-50 focus:ring-2 focus:ring-pastel-blue dark:focus:ring-charcoal-brand outline-none transition-all cursor-pointer appearance-none"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  </div>
);

export const DealDrawer: React.FC<DealDrawerProps> = ({ deal, isOpen, onClose, onSave, onAddNote }) => {
  const [editingDeal, setEditingDeal] = useState<DealRecord>(deal);
  const [newNote, setNewNote] = useState('');

  // Sync internal state if prop changes
  React.useEffect(() => {
    setEditingDeal(deal);
  }, [deal]);

  const handleInputChange = (field: keyof DealRecord, value: any) => {
    setEditingDeal(prev => ({ ...prev, [field]: value }));
  };

  const handleNoteSubmit = () => {
    if (newNote.trim()) {
      onAddNote(editingDeal, newNote);
      setNewNote('');
    }
  };

  if (!isOpen) return null;

  // Options
  const statusOptions = ['Pipeline', 'Qualified', 'Proposed', 'Negotiating', 'Closed Won', 'Closed Lost'];
  const typeOptions = ['New Site', 'Upgrade', 'Renewal', 'RFP', 'Move/Add/Change'];
  // We can also pass these as props if they need to be dynamic from the parent
  const leadOptions = ['Alex Morgan', 'Sarah Connor', 'Tony Stark', 'Bruce Wayne', 'Unassigned'];

  return (
    <>
      <div 
        className="absolute inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 bottom-0 w-[600px] bg-white dark:bg-charcoal-800 border-l border-slate-200 dark:border-charcoal-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-900 flex justify-between items-center sticky top-0 z-20">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-charcoal-50">Edit Deal</h3>
              <p className="text-xs text-slate-500">{editingDeal.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-gray-300 dark:hover:bg-charcoal-700 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={() => onSave(editingDeal)} className="flex items-center gap-2 px-4 py-2 bg-pastel-blue dark:bg-charcoal-brand text-white text-sm font-medium rounded-xl shadow-lg hover:bg-opacity-90 transition-all">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-white dark:bg-charcoal-800">
            
            {/* Section 1: General Info */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-charcoal-50 border-b border-slate-100 dark:border-charcoal-700 pb-2">
                <Briefcase size={16} className="text-pastel-blue dark:text-charcoal-brand"/> General Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Account Name" className="col-span-2">
                  <Input value={editingDeal.accountName} onChange={(v) => handleInputChange('accountName', v)} />
                </FormField>
                <FormField label="Salesforce ID">
                  <Input value={editingDeal.salesforceId} onChange={(v) => handleInputChange('salesforceId', v)} />
                </FormField>
                <FormField label="Request Type">
                  <Select value={editingDeal.requestType} onChange={(v) => handleInputChange('requestType', v)} options={typeOptions} />
                </FormField>
                <FormField label="Carrier Name">
                  <Input value={editingDeal.carrierName} onChange={(v) => handleInputChange('carrierName', v)} />
                </FormField>
                <FormField label="Deal Status">
                  <Select value={editingDeal.dealStatus} onChange={(v) => handleInputChange('dealStatus', v)} options={statusOptions} />
                </FormField>
                 <FormField label="Country">
                  <Input value={editingDeal.country || ''} onChange={(v) => handleInputChange('country', v)} placeholder="e.g. United States" />
                </FormField>
              </div>
            </div>

            {/* Section 2: Status & Team */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-charcoal-50 border-b border-slate-100 dark:border-charcoal-700 pb-2">
                <User size={16} className="text-pastel-blue dark:text-charcoal-brand"/> Workflow & Team
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="MCN Status">
                  <Select value={editingDeal.mcnStatus} onChange={(v) => handleInputChange('mcnStatus', v)} options={['Approved', 'Pending', 'Draft', 'Rejected']} />
                </FormField>
                <FormField label="MIC Status">
                  <Select value={editingDeal.micStatusAccess} onChange={(v) => handleInputChange('micStatusAccess', v)} options={['Feasible', 'Not Feasible', 'Review', 'Pending']} />
                </FormField>
                <FormField label="SA Lead">
                  <Select value={editingDeal.saLead} onChange={(v) => handleInputChange('saLead', v)} options={leadOptions} />
                </FormField>
                <FormField label="DD Lead">
                  <Select value={editingDeal.ddLead} onChange={(v) => handleInputChange('ddLead', v)} options={leadOptions} />
                </FormField>
              </div>
            </div>

            {/* Section 3: Dates */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-charcoal-50 border-b border-slate-100 dark:border-charcoal-700 pb-2">
                <Calendar size={16} className="text-pastel-blue dark:text-charcoal-brand"/> Key Dates
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Submission Date">
                  <Input type="date" value={editingDeal.submissionDate} onChange={(v) => handleInputChange('submissionDate', v)} />
                </FormField>
                <FormField label="ATP Date">
                  <Input type="date" value={editingDeal.atpDate} onChange={(v) => handleInputChange('atpDate', v)} />
                </FormField>
                <FormField label="Committed Quote">
                  <Input type="date" value={editingDeal.committedQuoteDate} onChange={(v) => handleInputChange('committedQuoteDate', v)} />
                </FormField>
                <FormField label="Target Sales Date">
                  <Input type="date" value={editingDeal.targetDateSales} onChange={(v) => handleInputChange('targetDateSales', v)} />
                </FormField>
                <FormField label="Solution Completion" className="col-span-2">
                  <Input type="date" value={editingDeal.solutionCompletionDate} onChange={(v) => handleInputChange('solutionCompletionDate', v)} />
                </FormField>
              </div>
            </div>

            {/* Section 4: Financials */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-charcoal-50 border-b border-slate-100 dark:border-charcoal-700 pb-2">
                <DollarSign size={16} className="text-pastel-blue dark:text-charcoal-brand"/> Financials & Metrics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="No. Circuits">
                  <Input type="number" value={editingDeal.noCircuits} onChange={(v) => handleInputChange('noCircuits', v)} />
                </FormField>
                <FormField label="Avg Circuit Cost">
                  <Input type="number" value={editingDeal.avgCircuitCost} onChange={(v) => handleInputChange('avgCircuitCost', v)} />
                </FormField>
                <FormField label="Circuit Value">
                  <Input type="number" value={editingDeal.circuitValue} onChange={(v) => handleInputChange('circuitValue', v)} />
                </FormField>
                <FormField label="Total ACV (MCN+MIC)">
                  <Input type="number" value={editingDeal.mcnMicAcv} onChange={(v) => handleInputChange('mcnMicAcv', v)} />
                </FormField>
                <FormField label="MIC ACV">
                  <Input type="number" value={editingDeal.micAcv} onChange={(v) => handleInputChange('micAcv', v)} />
                </FormField>
                <FormField label="No. Requotes">
                  <Input type="number" value={editingDeal.noRequotes} onChange={(v) => handleInputChange('noRequotes', v)} />
                </FormField>
              </div>
            </div>

            {/* Section 5: Solution Details */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-charcoal-50 border-b border-slate-100 dark:border-charcoal-700 pb-2">
                <Layers size={16} className="text-pastel-blue dark:text-charcoal-brand"/> Solution Details
              </h4>
              
              <div className="flex gap-4 p-4 bg-slate-50 dark:bg-charcoal-900 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingDeal.pmRequired} 
                    onChange={(e) => handleInputChange('pmRequired', e.target.checked)}
                    className="w-4 h-4 rounded text-pastel-blue focus:ring-pastel-blue"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-charcoal-50">PM Required</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingDeal.serviceActivationRequired} 
                    onChange={(e) => handleInputChange('serviceActivationRequired', e.target.checked)}
                    className="w-4 h-4 rounded text-pastel-blue focus:ring-pastel-blue"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-charcoal-50">Activation Required</span>
                </label>
              </div>

              <FormField label="Deal Summary">
                <textarea 
                  value={editingDeal.dealSummary}
                  onChange={(e) => handleInputChange('dealSummary', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 rounded-xl text-sm text-slate-700 dark:text-charcoal-50 focus:ring-2 focus:ring-pastel-blue dark:focus:ring-charcoal-brand outline-none transition-all"
                  rows={3}
                />
              </FormField>
              <FormField label="Solution Summary">
                <textarea 
                  value={editingDeal.solutionSummary}
                  onChange={(e) => handleInputChange('solutionSummary', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 rounded-xl text-sm text-slate-700 dark:text-charcoal-50 focus:ring-2 focus:ring-pastel-blue dark:focus:ring-charcoal-brand outline-none transition-all"
                  rows={3}
                />
              </FormField>
            </div>

            {/* Section 6: Notes */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-charcoal-700">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-charcoal-50">
                <FileText size={16} className="text-pastel-blue dark:text-charcoal-brand"/> Activity Log
              </h4>
              
              <div className="space-y-4 mb-4">
                {editingDeal.notes.map((note) => (
                  <div key={note.id} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-charcoal-700 flex items-center justify-center text-slate-600 dark:text-gray-300 text-xs font-bold flex-none">
                      {note.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{note.author}</span>
                        <span className="text-[10px] text-slate-400">{new Date(note.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-gray-400 bg-slate-50 dark:bg-charcoal-900 p-3 rounded-tr-xl rounded-b-xl border border-slate-100 dark:border-charcoal-700">
                        {note.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add an update note..."
                  className="w-full pl-4 pr-12 py-3 bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 rounded-xl text-sm focus:ring-2 focus:ring-pastel-blue outline-none resize-none"
                  rows={2}
                />
                <button 
                  onClick={handleNoteSubmit}
                  disabled={!newNote.trim()}
                  className="absolute right-3 bottom-3 p-2 bg-pastel-blue dark:bg-charcoal-brand text-white rounded-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

          </div>
      </div>
    </>
  );
};