import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  ArrowRight, 
  AlertCircle,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { HeaderGroup } from '@/types';

// Standard columns required for cost/carrier analysis
const STANDARD_COST_COLUMNS = [
  'MRC',
  'NRC',
  'Currency',
  'LMP',
  'MTTR SLA',
  'Notes'
];

// Fields that must be mapped during import
const REQUIRED_MAPPING_FIELDS = [
  'Client-Site ID', 
  ...STANDARD_COST_COLUMNS
];

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  // This function is called with the calculated new Grid and new HeaderGroups
  onImportComplete: (newGrid: any[][], newGroups: HeaderGroup[], carrierName: string) => void;
  currentGrid: any[][];
  currentHeaderGroups: HeaderGroup[];
}

export const ImportWizard: React.FC<ImportWizardProps> = ({ 
  isOpen, 
  onClose, 
  onImportComplete,
  currentGrid,
  currentHeaderGroups
}) => {
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [importType, setImportType] = useState<'new_cost' | 'existing_cost'>('new_cost');
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [carrierName, setCarrierName] = useState('');
  
  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType: 'create_new' | 'overwrite' | null;
  }>({ isOpen: false, title: '', message: '', actionType: null });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

      if (data.length > 0) {
        const fileHeaders = data[0].map((h: any) => String(h).trim());
        setUploadedHeaders(fileHeaders);
        setUploadedData(data.slice(1));
        
        // Auto-map logic
        const initialMapping: Record<string, string> = {};
        REQUIRED_MAPPING_FIELDS.forEach(reqField => {
          const match = fileHeaders.find(h => {
             const hLower = h.toLowerCase();
             const rLower = reqField.toLowerCase();
             if (hLower === rLower) return true;
             if (reqField === 'Client-Site ID' && (hLower.includes('site id') || hLower.includes('client id') || hLower === 'id')) return true;
             return false;
          });
          if (match) initialMapping[reqField] = match;
        });
        setColumnMapping(initialMapping);
        setImportStep(2);
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const proceedToCarrierName = () => {
    const missing = REQUIRED_MAPPING_FIELDS.filter(col => !columnMapping[col]);
    if (missing.length > 0) {
      alert(`Please map the following columns: ${missing.join(', ')}`);
      return;
    }
    setImportStep(3);
  };

  const handleImportClick = () => {
    const trimmedCarrierName = carrierName.trim();
    if (!trimmedCarrierName) {
      alert("Please enter a Carrier Name.");
      return;
    }

    const existingGroupIndex = currentHeaderGroups.findIndex(g => g.title.trim().toLowerCase() === trimmedCarrierName.toLowerCase());
    const carrierExists = existingGroupIndex !== -1;

    // Check 1: User chose update, but carrier not found
    if (importType === 'existing_cost' && !carrierExists) {
        setConfirmDialog({
            isOpen: true,
            title: 'Carrier Not Found',
            message: `The carrier "${trimmedCarrierName}" does not exist in the current matrix.`,
            actionType: 'create_new'
        });
        return;
    }

    // Check 2: User chose new, but carrier exists
    if (importType === 'new_cost' && carrierExists) {
        setConfirmDialog({
            isOpen: true,
            title: 'Carrier Exists',
            message: `The carrier "${trimmedCarrierName}" already exists in the matrix.`,
            actionType: 'overwrite'
        });
        return;
    }

    // Default path (Update existing matches, or Create new matches)
    const performUpdate = (importType === 'existing_cost');
    executeGridUpdate(performUpdate, trimmedCarrierName);
  };

  const handleConfirmAction = () => {
    const trimmedCarrierName = carrierName.trim();
    
    if (confirmDialog.actionType === 'create_new') {
        // Switch to Create New mode
        executeGridUpdate(false, trimmedCarrierName);
    } else if (confirmDialog.actionType === 'overwrite') {
        // Switch to Overwrite mode
        executeGridUpdate(true, trimmedCarrierName);
    }
    
    setConfirmDialog({ isOpen: false, title: '', message: '', actionType: null });
  };

  const executeGridUpdate = (performUpdate: boolean, trimmedCarrierName: string) => {
    const idColumnName = columnMapping['Client-Site ID'];
    const idColumnIndex = uploadedHeaders.indexOf(idColumnName);

    // Create a map of Existing ID -> Row Index
    const idRowMap = new Map<string, number>();
    currentGrid.forEach((row, index) => {
      const id = String(row[0] || '').trim();
      if (id) idRowMap.set(id, index);
    });
    
    // Check if we have existing IDs. If so, we only update/append to those rows.
    // If NOT (e.g. initial empty grid), we create new rows freely.
    const hasExistingIds = idRowMap.size > 0;

    // Deep copy grid to ensure immutability during edit
    const newGrid = currentGrid.map(row => [...row]);

    if (performUpdate) {
      // --- UPDATE EXISTING CARRIER COLUMNS ---
      const existingGroupIndex = currentHeaderGroups.findIndex(g => g.title.trim().toLowerCase() === trimmedCarrierName.toLowerCase());
      
      // Calculate the starting column index for this carrier group
      let colOffset = 0;
      for (let i = 0; i < existingGroupIndex; i++) {
        colOffset += currentHeaderGroups[i].span;
      }

      // We need to know the width of the updated group to avoid writing out of bounds
      const groupWidth = currentHeaderGroups[existingGroupIndex].span;

      uploadedData.forEach((uploadedRow) => {
        const rowId = String(uploadedRow[idColumnIndex] || '').trim();
        if (!rowId) return;

        const newCostCells = STANDARD_COST_COLUMNS.map(stdCol => {
          const fileColName = columnMapping[stdCol];
          const fileColIndex = uploadedHeaders.indexOf(fileColName);
          return fileColIndex >= 0 ? uploadedRow[fileColIndex] : '';
        });

        // Ensure we only try to update columns that fit within the existing group structure
        const cellsToUpdate = newCostCells.slice(0, groupWidth);

        if (idRowMap.has(rowId)) {
           // Update existing row
           const rowIndex = idRowMap.get(rowId)!;
           const row = newGrid[rowIndex];
           
           // Ensure row has enough cells to cover the update area
           while(row.length < colOffset + cellsToUpdate.length) row.push('');
           
           // Overwrite specific cells
           for(let k = 0; k < cellsToUpdate.length; k++) {
             row[colOffset + k] = cellsToUpdate[k];
           }
        } else if (!hasExistingIds) {
           // Row ID not found in grid AND grid was empty of IDs -> Create new row
           // We need to create a row that fits the current full grid width
           const totalCols = currentHeaderGroups.reduce((sum, g) => sum + g.span, 0);
           const newRow = Array(totalCols).fill('');
           newRow[0] = rowId; // Set ID
           
           // Fill the carrier specific slots
           for(let k = 0; k < cellsToUpdate.length; k++) {
             newRow[colOffset + k] = cellsToUpdate[k];
           }
           newGrid.push(newRow);
        }
      });

      // Pass updated grid but SAME header groups
      onImportComplete(newGrid, currentHeaderGroups, trimmedCarrierName);

    } else {
      // --- CREATE NEW CARRIER COLUMNS ---

      const newGroup: HeaderGroup = {
        title: trimmedCarrierName,
        span: STANDARD_COST_COLUMNS.length,
        subHeaders: STANDARD_COST_COLUMNS
      };

      // Filter out "Extra" columns created by infinite scroll logic to append cleanly
      const validHeaderGroups = currentHeaderGroups.filter(g => g.title !== 'Extra');
      const existingColsCount = validHeaderGroups.flatMap(g => g.subHeaders).length;

      uploadedData.forEach((uploadedRow) => {
        const rowId = String(uploadedRow[idColumnIndex] || '').trim();
        if (!rowId) return;

        const newCostCells = STANDARD_COST_COLUMNS.map(stdCol => {
          const fileColName = columnMapping[stdCol];
          const fileColIndex = uploadedHeaders.indexOf(fileColName);
          return fileColIndex >= 0 ? uploadedRow[fileColIndex] : '';
        });

        if (idRowMap.has(rowId)) {
           const rowIndex = idRowMap.get(rowId)!;
           let currentRow = newGrid[rowIndex];
           
           if (currentRow.length > existingColsCount) {
               currentRow = currentRow.slice(0, existingColsCount);
           } else {
               while(currentRow.length < existingColsCount) currentRow.push('');
           }
           
           // Append new cells
           newGrid[rowIndex] = [...currentRow, ...newCostCells];
        } else if (!hasExistingIds) {
           // Create new row padded to start of new section (only if grid was empty of IDs)
           const newRow = Array(existingColsCount).fill('');
           newRow[0] = rowId;
           newGrid.push([...newRow, ...newCostCells]);
        }
      });

      // Ensure rectangle: Pad all rows to the new total width
      const totalNewCols = existingColsCount + STANDARD_COST_COLUMNS.length;
      newGrid.forEach((row, idx) => {
        if (row.length < totalNewCols) {
          const missing = totalNewCols - row.length;
          newGrid[idx] = [...row, ...Array(missing).fill('')];
        } else if (row.length > totalNewCols) {
          newGrid[idx] = row.slice(0, totalNewCols);
        }
      });

      const newGroups = [...validHeaderGroups, newGroup];
      onImportComplete(newGrid, newGroups, trimmedCarrierName);
    }
    
    // Reset Internal State
    setImportStep(1);
    setCarrierName('');
    setColumnMapping({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white dark:bg-charcoal-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-charcoal-700 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
          
          <div className="px-6 py-4 border-b border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-900 flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-800 dark:text-charcoal-50">Import Cost Matrix</h3>
             <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-charcoal-700 rounded-full"><X size={20}/></button>
          </div>

          <div className="p-6">
             {/* Step 1: Type Selection */}
             {importStep === 1 && (
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <button 
                       onClick={() => setImportType('new_cost')}
                       className={`p-4 rounded-xl border-2 text-center transition-all ${importType === 'new_cost' ? 'border-pastel-blue bg-blue-50 dark:bg-charcoal-brand/10 dark:border-charcoal-brand' : 'border-slate-200 dark:border-charcoal-600'}`}
                     >
                       <div className="font-bold text-slate-800 dark:text-charcoal-50">New Cost</div>
                       <div className="text-xs text-slate-500 mt-1">Add a new Carrier/Quote comparison</div>
                     </button>
                     <button 
                       onClick={() => setImportType('existing_cost')}
                       className={`p-4 rounded-xl border-2 text-center transition-all ${importType === 'existing_cost' ? 'border-pastel-blue bg-blue-50 dark:bg-charcoal-brand/10 dark:border-charcoal-brand' : 'border-slate-200 dark:border-charcoal-600'}`}
                     >
                       <div className="font-bold text-slate-800 dark:text-charcoal-50">Existing Cost</div>
                       <div className="text-xs text-slate-500 mt-1">Update existing data</div>
                     </button>
                  </div>
                  
                  <div className="border-t border-slate-100 dark:border-charcoal-700 pt-4">
                     <label className="block text-sm font-bold text-slate-700 dark:text-charcoal-50 mb-2">Select Excel File</label>
                     <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".xlsx, .xls" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pastel-blue file:text-white hover:file:bg-pastel-blue/90"/>
                  </div>
               </div>
             )}

             {/* Step 2: Mapping */}
             {importStep === 2 && (
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-3 rounded-lg flex gap-3 text-sm text-amber-800 dark:text-amber-200">
                     <AlertCircle size={20} className="flex-none" />
                     <p>We found <strong>{uploadedHeaders.length}</strong> columns. Please map them. <br/><span className="text-xs opacity-80">"Client-Site ID" is required to match rows.</span></p>
                  </div>

                  {REQUIRED_MAPPING_FIELDS.map(stdCol => (
                    <div key={stdCol} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-charcoal-900 rounded-xl border border-slate-100 dark:border-charcoal-700">
                       <div className="flex-1 font-medium text-slate-700 dark:text-charcoal-50 flex items-center gap-2">
                         {stdCol} 
                         {stdCol === 'Client-Site ID' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">KEY</span>}
                       </div>
                       <ArrowRight size={16} className="text-slate-400 mx-4" />
                       <div className="flex-1">
                          <select 
                            value={columnMapping[stdCol] || ''} 
                            onChange={(e) => setColumnMapping(prev => ({...prev, [stdCol]: e.target.value}))}
                            className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800"
                          >
                             <option value="">-- Select Column --</option>
                             {uploadedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                       </div>
                    </div>
                  ))}
               </div>
             )}

             {/* Step 3: Carrier Name */}
             {importStep === 3 && (
                <div className="space-y-4">
                   <label className="block text-sm font-bold text-slate-700 dark:text-charcoal-50">Carrier / Vendor Name</label>
                   <p className="text-xs text-slate-500 mb-2">This will be used as the parent header for the new columns.</p>
                   <input 
                     type="text" 
                     value={carrierName} 
                     onChange={(e) => setCarrierName(e.target.value)}
                     className="w-full p-3 border border-slate-200 dark:border-charcoal-600 rounded-xl bg-slate-50 dark:bg-charcoal-900 focus:ring-2 focus:ring-pastel-blue outline-none"
                     placeholder="e.g. AT&T, Verizon, Quote A..."
                   />
                </div>
             )}
          </div>

          <div className="p-6 border-t border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-900 flex justify-end gap-3">
             {importStep > 1 && (
                <button onClick={() => setImportStep(prev => prev - 1 as any)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Back</button>
             )}
             {importStep === 2 && (
                <button onClick={proceedToCarrierName} className="px-6 py-2 bg-pastel-blue text-white rounded-lg font-medium hover:bg-opacity-90">Next</button>
             )}
             {importStep === 3 && (
                <button onClick={handleImportClick} className="px-6 py-2 bg-pastel-blue text-white rounded-lg font-medium hover:bg-opacity-90">
                  {importType === 'existing_cost' ? 'Update Data' : 'Populate Grid'}
                </button>
             )}
          </div>
          
          {/* Confirmation Modal Overlay */}
          {confirmDialog.isOpen && (
             <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-white/80 dark:bg-charcoal-900/90 backdrop-blur-sm animate-in fade-in duration-200">
                 <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl border border-slate-200 dark:border-charcoal-700 p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                     <div className="flex flex-col items-center text-center space-y-4">
                         <div className={`p-3 rounded-full ${confirmDialog.actionType === 'overwrite' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                             {confirmDialog.actionType === 'overwrite' ? <AlertTriangle size={32} /> : <HelpCircle size={32} />}
                         </div>
                         <div>
                             <h4 className="text-lg font-bold text-slate-800 dark:text-charcoal-50">{confirmDialog.title}</h4>
                             <p className="text-sm text-slate-500 mt-2">{confirmDialog.message}</p>
                             <p className="text-sm font-medium text-slate-700 dark:text-gray-300 mt-4">
                                 {confirmDialog.actionType === 'create_new' 
                                     ? "Do you want to import this as a NEW Carrier instead?" 
                                     : "Do you want to OVERWRITE the existing data?"}
                             </p>
                         </div>
                         <div className="flex gap-3 w-full pt-2">
                             <button 
                                 onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                                 className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-charcoal-700 dark:text-gray-300 dark:hover:bg-charcoal-600 rounded-xl transition-colors"
                             >
                                 Cancel
                             </button>
                             <button 
                                 onClick={handleConfirmAction}
                                 className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-lg
                                     ${confirmDialog.actionType === 'overwrite' 
                                         ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' 
                                         : 'bg-pastel-blue hover:bg-opacity-90 shadow-blue-500/30'}`}
                             >
                                 {confirmDialog.actionType === 'create_new' ? 'Yes, Create New' : 'Yes, Overwrite'}
                             </button>
                         </div>
                     </div>
                 </div>
             </div>
          )}

       </div>
    </div>
  );
};