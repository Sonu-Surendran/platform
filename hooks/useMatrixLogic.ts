import React, { useState, useRef, useEffect, useCallback } from 'react';
import ExcelJS from 'exceljs';
import { HeaderGroup } from '@/types';
import { getUniqueCurrencies, calculatePreferredCarrier, ScanConfig } from '@/utils/matrixUtils';

export const INITIAL_HEADERS = [
  'Client-Site ID',
  'Sitename', 
  'Address', 
  'City', 
  'State', 
  'Zip/Post Code', 
  'Country', 
  'Circuit type', 
  'Physical bearer speed (DIA only) Mbps', 
  'DL Mbps (DIA & BIA)', 
  'UL Mbps (DIA Only)'
];

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  rowIndex: number;
  colIndex: number;
}

export const useMatrixLogic = () => {
  // --- State ---
  const [gridData, setGridData] = useState<any[][]>([]);
  const [headerGroups, setHeaderGroups] = useState<HeaderGroup[]>([
    { title: 'Requirements', span: INITIAL_HEADERS.length, subHeaders: [...INITIAL_HEADERS] }
  ]);
  const [colWidths, setColWidths] = useState<number[]>([]);
  
  // History State
  const [history, setHistory] = useState<any[][][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  
  // Scan Modal State
  const [showScanModal, setShowScanModal] = useState(false);
  const [detectedCurrencies, setDetectedCurrencies] = useState<string[]>([]);

  const [selection, setSelection] = useState<{ start: { r: number, c: number } | null, end: { r: number, c: number } | null }>({ start: null, end: null });
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, rowIndex: -1, colIndex: -1 });
  
  const [freezeState, setFreezeState] = useState<{ rows: number, cols: number }>({ rows: 0, cols: 0 });
  const [headerHeight, setHeaderHeight] = useState(0);
  const [showImportWizard, setShowImportWizard] = useState(false);

  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const resizingRef = useRef<{ index: number, startX: number, startWidth: number } | null>(null);

  // --- Helpers ---
  const getFlatHeaders = useCallback(() => headerGroups.flatMap(g => g.subHeaders), [headerGroups]);

  const calculateOptimalWidths = useCallback((data: any[][], groups: HeaderGroup[]) => {
    const flatHeaders = groups.flatMap(g => g.subHeaders);
    const newWidths = flatHeaders.map((header, colIndex) => {
      let maxLen = (header?.length || 0);
      const limit = Math.min(data.length, 100);
      for (let i = 0; i < limit; i++) {
        const cellVal = data[i][colIndex] ? String(data[i][colIndex]) : '';
        if (cellVal.length > maxLen) maxLen = cellVal.length;
      }
      return Math.min(Math.max(maxLen * 9 + 40, 100), 400);
    });
    return newWidths;
  }, []);

  const initializeEmptyGrid = useCallback(() => {
    const initialRowCount = 30;
    const initialHeaders = [...INITIAL_HEADERS];
    const initialGroups = [{ title: 'Requirements', span: INITIAL_HEADERS.length, subHeaders: [...INITIAL_HEADERS] }];
    
    const newRows = Array.from({ length: initialRowCount }, () => Array(initialHeaders.length).fill(''));
    
    setHeaderGroups(initialGroups);
    setGridData(newRows);
    setScanComplete(false);
    setSelection({ start: null, end: null });
    setFreezeState({ rows: 0, cols: 0 });
    setColWidths(calculateOptimalWidths(newRows, initialGroups));
    
    // Reset History
    const initialHistory = [JSON.parse(JSON.stringify(newRows))];
    setHistory(initialHistory);
    setHistoryIndex(0);
  }, [calculateOptimalWidths]);

  // --- History Logic ---
  const recordChange = useCallback((newGrid: any[][]) => {
    setGridData(newGrid);
    setHistory(prev => {
      const current = prev.slice(0, historyIndex + 1);
      const next = [...current, JSON.parse(JSON.stringify(newGrid))];
      if (next.length > 50) next.shift(); // Limit history to 50 steps
      return next;
    });
    setHistoryIndex(prev => {
      const nextIndex = prev + 1;
      // If we shifted (length > 50), the index stays at 49 (max), otherwise increments
      // We approximate this logic safely by clamping
      return Math.min(nextIndex, 49);
    });
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setGridData(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setGridData(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleCellBlur = useCallback(() => {
    // Check if current gridData is different from the committed history state
    if (historyIndex >= 0 && history[historyIndex]) {
      const currentSnapshot = JSON.stringify(gridData);
      const lastSnapshot = JSON.stringify(history[historyIndex]);
      if (currentSnapshot !== lastSnapshot) {
        recordChange(gridData);
      }
    }
  }, [gridData, history, historyIndex, recordChange]);


  // --- Effects ---
  useEffect(() => {
    if (gridData.length === 0) {
        initializeEmptyGrid();
    }
  }, [initializeEmptyGrid, gridData.length]);

  useEffect(() => {
    if (theadRef.current) {
      setHeaderHeight(theadRef.current.offsetHeight);
    }
  }, [headerGroups]);

  // --- Resizing Logic ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const { index, startX, startWidth } = resizingRef.current;
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      
      setColWidths(prev => {
        const next = [...prev];
        next[index] = newWidth;
        return next;
      });
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

  const startResizing = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = { index, startX: e.clientX, startWidth: colWidths[index] || 120 };
    document.body.style.cursor = 'col-resize';
  };

  // --- Infinite Scroll Logic ---
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = target;
    const rowThreshold = 100;
    const colThreshold = 100;

    if (scrollHeight - scrollTop - clientHeight < rowThreshold) {
      setGridData(prev => {
        const colCount = prev[0]?.length || 0;
        if (colCount === 0) return prev;
        const newRows = Array.from({ length: 10 }, () => Array(colCount).fill(''));
        return [...prev, ...newRows];
      });
    }

    if (scrollWidth - scrollLeft - clientWidth < colThreshold) {
      const colsToAdd = 5;
      setHeaderGroups(prev => {
        const newGroups = [...prev];
        const lastGroup = newGroups[newGroups.length - 1];
        if (lastGroup.title === 'Extra') {
          const updatedLast = { ...lastGroup };
          const currentCount = updatedLast.subHeaders.length;
          updatedLast.span += colsToAdd;
          const newHeaders = Array.from({length: colsToAdd}, (_, i) => `Col ${currentCount + i + 1}`);
          updatedLast.subHeaders = [...updatedLast.subHeaders, ...newHeaders];
          newGroups[newGroups.length - 1] = updatedLast;
        } else {
          newGroups.push({
            title: 'Extra',
            span: colsToAdd,
            subHeaders: Array.from({length: colsToAdd}, (_, i) => `Col ${i + 1}`)
          });
        }
        return newGroups;
      });
      setGridData(prev => prev.map(row => [...row, ...Array(colsToAdd).fill('')]));
      setColWidths(prev => [...prev, ...Array(colsToAdd).fill(120)]);
    }
  };

  // --- Selection Logic ---
  const getSelectionBounds = useCallback(() => {
    if (!selection.start || !selection.end) return null;
    return {
      minR: Math.min(selection.start.r, selection.end.r),
      maxR: Math.max(selection.start.r, selection.end.r),
      minC: Math.min(selection.start.c, selection.end.c),
      maxC: Math.max(selection.start.c, selection.end.c),
    };
  }, [selection]);

  const isSelected = (r: number, c: number) => {
    const bounds = getSelectionBounds();
    if (!bounds) return false;
    return r >= bounds.minR && r <= bounds.maxR && c >= bounds.minC && c <= bounds.maxC;
  };

  const handleHeaderClick = (colIndex: number, e: React.MouseEvent) => {
    if (e.shiftKey && selection.start) {
      const startC = selection.start.c;
      const endC = colIndex;
      setSelection(prev => ({
        ...prev,
        end: { r: gridData.length - 1, c: endC }
      }));
    } else {
      setSelection({
        start: { r: 0, c: colIndex },
        end: { r: gridData.length - 1, c: colIndex }
      });
    }
  };

  // --- Freeze Logic ---
  const toggleFreeze = () => {
    if (freezeState.cols > 0) {
      setFreezeState({ rows: 0, cols: 0 });
    } else {
      const bounds = getSelectionBounds();
      if (bounds) {
        setFreezeState({ rows: 0, cols: bounds.maxC + 1 });
      } else {
        alert("Please select a column header to freeze.");
      }
    }
  };

  const getColLeftOffset = (colIndex: number) => {
    let left = 48; // Width of Index Column
    for (let i = 0; i < colIndex; i++) {
      left += colWidths[i] || 120;
    }
    return left;
  };

  const getRowTopOffset = (rowIndex: number) => {
    const ROW_HEIGHT = 37;
    return headerHeight + (rowIndex * ROW_HEIGHT);
  };

  // --- Paste Logic ---
  const processPasteData = useCallback((rows: string[][], startR: number, startC: number) => {
    const pastedRowCount = rows.length;
    const pastedColCount = Math.max(...rows.map(r => r.length));
    const currentFlatHeaders = getFlatHeaders();
    const currentColCount = currentFlatHeaders.length;
    const neededCols = startC + pastedColCount;
    const neededRows = startR + pastedRowCount;

    if (neededCols > currentColCount) {
      const colsToAdd = neededCols - currentColCount;
      setHeaderGroups(prev => {
        const newGroups = [...prev];
        const lastGroup = newGroups[newGroups.length - 1];
        if (lastGroup.title === 'Extra') {
          const updatedLast = { ...lastGroup };
          const currentSubCount = updatedLast.subHeaders.length;
          updatedLast.span += colsToAdd;
          const newHeaders = Array.from({length: colsToAdd}, (_, i) => `Col ${currentSubCount + i + 1}`);
          updatedLast.subHeaders = [...updatedLast.subHeaders, ...newHeaders];
          newGroups[newGroups.length - 1] = updatedLast;
        } else {
          newGroups.push({
            title: 'Extra',
            span: colsToAdd,
            subHeaders: Array.from({length: colsToAdd}, (_, i) => `Col ${i + 1}`)
          });
        }
        return newGroups;
      });
      setColWidths(prev => [...prev, ...Array(colsToAdd).fill(120)]);
    }

    let nextGrid = [...gridData];
    // Add Rows if needed
    if (nextGrid.length < neededRows) {
      const rowsToAdd = neededRows - nextGrid.length;
      const emptyRow = Array(neededCols).fill('');
      for(let i=0; i<rowsToAdd; i++) nextGrid.push([...emptyRow]);
    }
    // Add Cols to rows if needed
    nextGrid = nextGrid.map(row => {
      if (row.length < neededCols) {
        return [...row, ...Array(neededCols - row.length).fill('')];
      }
      return row;
    });

    // Apply Paste
    rows.forEach((row, rOffset) => {
      const targetR = startR + rOffset;
      if (!nextGrid[targetR]) nextGrid[targetR] = Array(neededCols).fill('');
      nextGrid[targetR] = [...nextGrid[targetR]]; 
      row.forEach((cellValue, cOffset) => {
         const targetC = startC + cOffset;
         nextGrid[targetR][targetC] = cellValue;
      });
    });

    recordChange(nextGrid);
  }, [getFlatHeaders, gridData, recordChange]);

  // --- Context Menu Actions ---
  const handleCopy = useCallback(async () => {
    const bounds = getSelectionBounds();
    if (!bounds) return;
    let text = "";
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      const rowValues = [];
      for (let c = bounds.minC; c <= bounds.maxC; c++) rowValues.push(gridData[r]?.[c] || "");
      text += rowValues.join("\t") + (r < bounds.maxR ? "\n" : "");
    }
    try { await navigator.clipboard.writeText(text); } catch (err) { console.error(err); }
  }, [getSelectionBounds, gridData]);

  const handleClearSelection = useCallback(() => {
    const bounds = getSelectionBounds();
    if (!bounds) return;
    
    const nextGrid = gridData.map(row => [...row]);
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      if (!nextGrid[r]) continue;
      for (let c = bounds.minC; c <= bounds.maxC; c++) nextGrid[r][c] = '';
    }
    recordChange(nextGrid);
  }, [getSelectionBounds, gridData, recordChange]);

  const handleDeleteRows = useCallback(() => {
    const bounds = getSelectionBounds();
    if (!bounds) return;
    
    const nextGrid = [...gridData];
    nextGrid.splice(bounds.minR, (bounds.maxR - bounds.minR) + 1);
    while (nextGrid.length < 20) nextGrid.push(Array(getFlatHeaders().length).fill(''));
    
    recordChange(nextGrid);
    setSelection({ start: null, end: null });
  }, [getSelectionBounds, getFlatHeaders, gridData, recordChange]);

  const handleFillSelection = useCallback(() => {
    const bounds = getSelectionBounds();
    if (!bounds) return;
    const sourceValue = gridData[selection.start!.r][selection.start!.c];
    
    const nextGrid = [...gridData];
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      if (!nextGrid[r]) continue;
      nextGrid[r] = [...nextGrid[r]];
      for (let c = bounds.minC; c <= bounds.maxC; c++) nextGrid[r][c] = sourceValue;
    }
    
    recordChange(nextGrid);
  }, [getSelectionBounds, gridData, selection, recordChange]);

  const handleClearAll = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all data in the sheet? This action cannot be undone.")) {
      initializeEmptyGrid();
    }
  }, [initializeEmptyGrid]);

  const handleManualPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const rows = text.split(/\r\n|\n|\r/).map(row => row.split('\t'));
      if (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
        rows.pop();
      }
      if (rows.length === 0) return;
      
      const startR = selection.start?.r ?? 0;
      const startC = selection.start?.c ?? 0;
      processPasteData(rows, startR, startC);
    } catch (e) { console.error("Clipboard read failed", e); }
  };

  const handleImportComplete = (newGrid: any[][], newGroups: HeaderGroup[], carrierName: string) => {
    setHeaderGroups(newGroups);
    setColWidths(calculateOptimalWidths(newGrid, newGroups)); 
    setShowImportWizard(false);
    recordChange(newGrid);
    alert(`Successfully imported cost data for ${carrierName}`);
  };

  const handleExport = async () => {
    // 1. Setup Workbook and Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Matrix Comparison');
    
    // 2. Define Header Rows
    const headerRow1 = worksheet.addRow([]);
    const headerRow2 = worksheet.addRow([]);
    
    let colIndex = 1; // ExcelJS is 1-based
    const validGroups = headerGroups.filter(g => g.title !== 'Extra');
    
    validGroups.forEach(g => {
        // --- Process Parent Header ---
        const startCol = colIndex;
        const endCol = colIndex + g.span - 1;
        
        const parentCell = headerRow1.getCell(startCol);
        parentCell.value = g.title;
        
        // Merge parent cells if span > 1
        if (g.span > 1) {
            worksheet.mergeCells(1, startCol, 1, endCol);
        }
        
        // Style parent header range (Charcoal bg, White text)
        for (let c = startCol; c <= endCol; c++) {
            const cell = headerRow1.getCell(c);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF222831' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = { 
              bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } }, 
              right: { style: 'thin', color: { argb: 'FF393E46' } } 
            };
        }
        // Restore value after loop might have cleared it in some contexts, though ExcelJS usually preserves master cell value in merge
        headerRow1.getCell(startCol).value = g.title;

        // --- Process Child Headers ---
        g.subHeaders.forEach((sub, i) => {
            const c = startCol + i;
            const cell = headerRow2.getCell(c);
            cell.value = sub;
            
            const isPreferred = g.title === 'Preferred Carrier';
            // Pastel Blue (FF789DBC) or Teal (FF00ADB5)
            const bgColor = isPreferred ? 'FF00ADB5' : 'FF789DBC';
            const textColor = isPreferred ? 'FFFFFFFF' : 'FF000000';
            
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            cell.font = { bold: true, color: { argb: textColor } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = { 
              bottom: { style: 'thin', color: { argb: 'FF000000' } }, 
              right: { style: 'thin', color: { argb: 'FFEEEEEE' } } 
            };
            
            // Set initial column width based on header length
            const col = worksheet.getColumn(c);
            const headerLen = sub.length + 5;
            col.width = Math.max(headerLen, 12);
        });
        
        colIndex += g.span;
    });

    // 3. Prepare Data Rows
    // Map original column indices to keep (excluding 'Extra')
    let originalIndices: number[] = [];
    let traversalIndex = 0;
    headerGroups.forEach(g => {
      if (g.title !== 'Extra') {
        for (let i = 0; i < g.span; i++) originalIndices.push(traversalIndex + i);
      }
      traversalIndex += g.span;
    });

    // Filter valid rows (not empty in exported columns)
    const validRows = gridData.filter(row => 
        originalIndices.some(idx => row[idx] && String(row[idx]).trim() !== '')
    );

    // 4. Write Data Rows
    validRows.forEach((row, rIdx) => {
        const rowValues = originalIndices.map(i => row[i]);
        const excelRow = worksheet.addRow(rowValues);
        
        // Alternating Colors (White vs Light Grey F3F4F6)
        const isAlternate = rIdx % 2 === 1;
        const rowColor = isAlternate ? 'FFF3F4F6' : 'FFFFFFFF';
        
        excelRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowColor } };
             cell.border = { 
               right: { style: 'thin', color: { argb: 'FFE5E7EB' } }, 
               bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } 
             };
             cell.alignment = { vertical: 'middle', horizontal: 'left' };
             
             // Auto-width adjustment based on content (check first 20 rows only for performance if needed, but here we check all valid rows)
             const val = cell.value ? String(cell.value) : '';
             const col = worksheet.getColumn(colNumber);
             const currentWidth = col.width || 10;
             if (val.length + 2 > currentWidth && val.length < 50) {
                col.width = val.length + 2;
             }
        });
    });

    // 5. Generate and Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'Matrix_Comparison_Export.xlsx';
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Scan Logic ---
  const handleScan = () => {
    // 1. Analyze Grid for Currencies
    const currencies = getUniqueCurrencies(gridData, headerGroups);
    setDetectedCurrencies(currencies);
    
    // 2. Open Modal
    setShowScanModal(true);
  };

  const handleProcessScan = (config: ScanConfig) => {
    setIsScanning(true);
    setShowScanModal(false);
    
    // Simulate Processing Time
    setTimeout(() => {
      const { newGrid, newGroups } = calculatePreferredCarrier(gridData, headerGroups, config);
      
      // Update State
      setHeaderGroups(newGroups);
      recordChange(newGrid);
      
      // Since columns may have been added, update widths
      const newColWidths = calculateOptimalWidths(newGrid, newGroups);
      setColWidths(newColWidths);
      
      setIsScanning(false);
      setScanComplete(true);
    }, 1200);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...gridData];
    newData[rowIndex] = [...newData[rowIndex]];
    newData[rowIndex][colIndex] = value;
    setGridData(newData);
  };

  const handleMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    if (e.button === 2) { 
      if (!isSelected(r, c)) setSelection({ start: { r, c }, end: { r, c } });
      return; 
    }
    setIsDragging(true);
    setSelection({ start: { r, c }, end: { r, c } });
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (isDragging && selection.start) setSelection(prev => ({ ...prev, end: { r, c } }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, rowIndex: 0, colIndex: 0 });
  };

  // --- Input Listeners ---
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;
      const text = clipboardData.getData('text/plain');
      if (text.includes('\t') || text.includes('\n')) {
        e.preventDefault();
        let rows = text.split(/\r\n|\n|\r/).map(row => row.split('\t'));
        if (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
          rows.pop();
        }
        if (rows.length === 0) return;
        const startR = selection.start?.r ?? 0;
        const startC = selection.start?.c ?? 0;
        processPasteData(rows, startR, startC);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selection, processPasteData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      const isInput = activeElement.tagName === 'INPUT';
      const cmdOrCtrl = e.metaKey || e.ctrlKey;
      const shift = e.shiftKey;

      // Copy
      if (cmdOrCtrl && e.key === 'c') { 
        e.preventDefault(); 
        handleCopy(); 
      }
      // Undo (Ctrl+Z)
      if (cmdOrCtrl && !shift && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
      // Redo (Ctrl+Shift+Z or Ctrl+Y)
      if ((cmdOrCtrl && shift && e.key.toLowerCase() === 'z') || (cmdOrCtrl && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
      }
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const bounds = getSelectionBounds();
        const isMulti = bounds && (bounds.maxR > bounds.minR || bounds.maxC > bounds.minC);
        if (!isInput || isMulti) handleClearSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, handleClearSelection, getSelectionBounds, undo, redo]);

  return {
    // State
    gridData,
    headerGroups,
    colWidths,
    selection,
    isScanning,
    scanComplete,
    freezeState,
    headerHeight,
    showImportWizard,
    showScanModal,
    detectedCurrencies,
    contextMenu,
    isDragging,
    historyIndex,
    historyLength: history.length,

    // Setters
    setContextMenu,
    setScanComplete,
    setShowImportWizard,
    setIsDragging,
    setShowScanModal,

    // Refs
    containerRef,
    tableRef,
    theadRef,

    // Computed
    flatHeaders: getFlatHeaders(),

    // Handlers
    handleScroll,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleCellChange,
    handleCellBlur,
    handleContextMenu,
    handleHeaderClick,
    startResizing,
    
    // Actions
    handleImportComplete,
    handleExport,
    handleScan,
    handleProcessScan, // Exposed new handler
    toggleFreeze,
    undo,
    redo,
    
    // Context Actions
    handleCopy,
    handleManualPaste,
    handleClearSelection,
    handleDeleteRows,
    handleFillSelection,
    handleClearAll,

    // Helpers
    isSelected,
    getColLeftOffset,
    getRowTopOffset
  };
};