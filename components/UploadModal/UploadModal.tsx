import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  User, 
  Server, 
  DollarSign, 
  FileCheck 
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  // This function is triggered when user submits form. 
  // We can let the parent handle the API/Storage logic, passing the form data up.
  onSubmit: (formData: any, invoiceName: string, contractName: string) => void;
  isSubmitting: boolean;
}

// --- Form Components ---
const FormLabel = ({ children }: { children?: React.ReactNode }) => (
  <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
    {children}
  </label>
);

const FormInput = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  const isDate = props.type === 'date' || props.type === 'datetime-local';
  
  return (
    <div className="relative w-full">
      <input 
        {...props}
        className={`w-full px-3 py-2 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 rounded-xl text-sm text-slate-700 dark:text-charcoal-50 focus:ring-2 focus:ring-pastel-blue dark:focus:ring-charcoal-brand outline-none transition-all dark:[color-scheme:dark] ${isDate ? 'cursor-pointer' : ''}`}
      />
    </div>
  );
};

export const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting 
}) => {
  const invoiceInputRef = useRef<HTMLInputElement>(null);
  const contractInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedInvoiceName, setSelectedInvoiceName] = useState<string>('');
  const [selectedContractName, setSelectedContractName] = useState<string>('');

  const [formData, setFormData] = useState({
    customerName: '',
    country: '',
    address: '',
    circuitId: '',
    carrierName: '',
    carrierCircuitId: '',
    mrc: '',
    nrc: '',
    billingDate: '',
    handoverDate: '',
    uploaderName: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'contract') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'invoice') setSelectedInvoiceName(file.name);
      else setSelectedContractName(file.name);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, selectedInvoiceName, selectedContractName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-charcoal-800 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-charcoal-700 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-charcoal-700 flex justify-between items-center bg-slate-50 dark:bg-charcoal-900 rounded-t-3xl">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-charcoal-50 flex items-center gap-2">
              <Upload size={20} className="text-pastel-blue dark:text-charcoal-brand" /> Upload Data
            </h3>
            <p className="text-sm text-slate-500">Enter details for Bill or Contract ingestion.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-charcoal-700 rounded-full transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-white dark:bg-charcoal-800">
          <form id="uploadForm" onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Section 1: Customer & Location */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-charcoal-50 flex items-center gap-2 border-b border-slate-100 dark:border-charcoal-700 pb-2">
                <User size={16} className="text-pastel-blue dark:text-charcoal-brand" /> Customer Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormLabel>Customer Name</FormLabel>
                  <FormInput name="customerName" value={formData.customerName} onChange={handleInputChange} required />
                </div>
                <div>
                  <FormLabel>Country</FormLabel>
                  <FormInput name="country" value={formData.country} onChange={handleInputChange} />
                </div>
                <div className="md:col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormInput name="address" value={formData.address} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Section 2: Technical */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-charcoal-50 flex items-center gap-2 border-b border-slate-100 dark:border-charcoal-700 pb-2">
                <Server size={16} className="text-pastel-blue dark:text-charcoal-brand" /> Circuit Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FormLabel>Circuit ID</FormLabel>
                  <FormInput name="circuitId" value={formData.circuitId} onChange={handleInputChange} required />
                </div>
                <div>
                  <FormLabel>Carrier Name</FormLabel>
                  <FormInput name="carrierName" value={formData.carrierName} onChange={handleInputChange} />
                </div>
                <div>
                  <FormLabel>Carrier Circuit ID</FormLabel>
                  <FormInput name="carrierCircuitId" value={formData.carrierCircuitId} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Section 3: Financials & Dates */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-charcoal-50 flex items-center gap-2 border-b border-slate-100 dark:border-charcoal-700 pb-2">
                <DollarSign size={16} className="text-pastel-blue dark:text-charcoal-brand" /> Billing & Dates
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormLabel>MRC (Monthly)</FormLabel>
                  <FormInput type="number" name="mrc" value={formData.mrc} onChange={handleInputChange} placeholder="0.00" />
                </div>
                <div>
                  <FormLabel>NRC (One-time)</FormLabel>
                  <FormInput type="number" name="nrc" value={formData.nrc} onChange={handleInputChange} placeholder="0.00" />
                </div>
                <div>
                  <FormLabel>Billing Date</FormLabel>
                  <FormInput type="date" name="billingDate" value={formData.billingDate} onChange={handleInputChange} />
                </div>
                <div>
                  <FormLabel>Handover Date</FormLabel>
                  <FormInput type="date" name="handoverDate" value={formData.handoverDate} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Section 4: Documents & Uploader */}
            <div className="space-y-4">
               <h4 className="text-sm font-bold text-slate-800 dark:text-charcoal-50 flex items-center gap-2 border-b border-slate-100 dark:border-charcoal-700 pb-2">
                <FileText size={16} className="text-pastel-blue dark:text-charcoal-brand" /> Documentation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Invoice Upload */}
                <div 
                  onClick={() => invoiceInputRef.current?.click()}
                  className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-charcoal-600 bg-slate-50 dark:bg-charcoal-900/50 hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors text-center cursor-pointer group"
                >
                  {selectedInvoiceName ? (
                    <>
                      <FileCheck className="mx-auto text-emerald-500 mb-2" size={24} />
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate px-2">{selectedInvoiceName}</p>
                      <p className="text-xs text-slate-400">Click to replace</p>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto text-slate-400 mb-2 group-hover:text-pastel-blue dark:group-hover:text-charcoal-brand transition-colors" size={24} />
                      <p className="text-xs font-semibold text-slate-600 dark:text-charcoal-50">Upload Invoice (PDF)</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={invoiceInputRef}
                    accept=".pdf" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, 'invoice')}
                  />
                </div>

                {/* Contract Upload */}
                <div 
                  onClick={() => contractInputRef.current?.click()}
                  className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-charcoal-600 bg-slate-50 dark:bg-charcoal-900/50 hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors text-center cursor-pointer group"
                >
                  {selectedContractName ? (
                    <>
                      <FileCheck className="mx-auto text-emerald-500 mb-2" size={24} />
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate px-2">{selectedContractName}</p>
                      <p className="text-xs text-slate-400">Click to replace</p>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto text-slate-400 mb-2 group-hover:text-pastel-blue dark:group-hover:text-charcoal-brand transition-colors" size={24} />
                      <p className="text-xs font-semibold text-slate-600 dark:text-charcoal-50">Upload Contract (PDF)</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={contractInputRef}
                    accept=".pdf" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, 'contract')}
                  />
                </div>
              </div>
              <div>
                <FormLabel>Uploaded By (Person Name)</FormLabel>
                <FormInput name="uploaderName" value={formData.uploaderName} onChange={handleInputChange} placeholder="Enter your name" required />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-900 flex justify-end gap-3 rounded-b-3xl">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-charcoal-600 text-slate-600 dark:text-charcoal-50 font-medium hover:bg-slate-200 dark:hover:bg-charcoal-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="uploadForm"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-pastel-blue dark:bg-charcoal-brand text-white font-medium rounded-xl shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Uploading...' : 'Submit Data'}
          </button>
        </div>

      </div>
    </div>
  );
};