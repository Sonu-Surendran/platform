import React from 'react';
import { 
  Copy, 
  Clipboard, 
  Trash2, 
  Eraser, 
  AlignVerticalJustifyStart,
  FileX
} from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onCopy: () => void;
  onPaste: () => void;
  onFill: () => void;
  onClear: () => void;
  onDeleteRow: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x, y, visible, onCopy, onPaste, onFill, onClear, onDeleteRow, onClearAll, onClose
}) => {
  if (!visible) return null;

  return (
    <div 
      className="fixed z-50 w-56 rounded-xl bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 shadow-xl overflow-hidden"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
       <div className="p-1.5 space-y-1">
         <button onClick={() => { onCopy(); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-lg text-left">
            <Copy size={16} /> <span>Copy</span>
         </button>
         <button onClick={() => { onPaste(); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-lg text-left">
            <Clipboard size={16} /> <span>Paste</span>
         </button>
         <button onClick={() => { onFill(); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-lg text-left">
            <AlignVerticalJustifyStart size={16} /> <span>Fill Selection</span>
         </button>
         <div className="h-px bg-slate-200 dark:bg-charcoal-700 my-1"></div>
         <button onClick={() => { onClear(); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg text-left">
            <Eraser size={16} /> <span>Clear</span>
         </button>
         <button onClick={() => { onDeleteRow(); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg text-left">
            <Trash2 size={16} /> <span>Delete Row</span>
         </button>
         <button onClick={() => { onClearAll(); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg text-left border-t border-slate-100 dark:border-charcoal-700 mt-1 pt-2">
            <FileX size={16} /> <span>Clear All Data</span>
         </button>
       </div>
    </div>
  );
};