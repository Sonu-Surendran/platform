import React from 'react';
import {
  Upload,
  Download,
  RefreshCw,
  ScanLine,
  FileSpreadsheet,
  CheckCircle2,
  Snowflake,
  X,
  Undo2,
  Redo2,
  Server,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';
import { ImportWizard } from '@/components/ImportWizard/ImportWizard';
import { ScanMatrixModal } from '@/components/ScanMatrixModal/ScanMatrixModal';
import { ContextMenu } from '@/components/ContextMenu/ContextMenu';
import { useMatrixLogic } from '@/hooks/useMatrixLogic';

export const MatrixComparison: React.FC = () => {
  const {
    // State
    gridData,
    headerGroups,
    colWidths,
    selection,
    isScanning,
    scanComplete,
    freezeState,
    showImportWizard,
    showScanModal,
    detectedCurrencies,
    contextMenu,
    isDragging,
    historyIndex,
    historyLength,

    // Setters
    setIsDragging,
    setContextMenu,
    setScanComplete,
    setShowImportWizard,
    setShowScanModal,

    // Refs
    containerRef,
    tableRef,
    theadRef,

    // Computed
    flatHeaders,

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
    handleProcessScan,
    toggleFreeze,
    undo,
    redo,
    saveScanResultsToDb,
    saveImportedDataToInventory,

    // Context Actions
    handleCopy,
    handleManualPaste,
    handleClearSelection,
    handleDeleteRows,
    handleFillSelection,
    handleClearAll,

    // Search & Sort
    handleSort,
    setSearchQuery,
    searchQuery,
    sortConfig,

    // Helpers
    isSelected,
    getColLeftOffset,
    getRowTopOffset
  } = useMatrixLogic();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  return (
    <div
      className="p-4 md:p-6 h-full flex flex-col space-y-4 md:space-y-6 select-none overflow-hidden"
      onClick={() => setContextMenu({ ...contextMenu, visible: false })}
    >

      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-charcoal-50">Matrix Comparison</h2>
          <p className="text-slate-500 dark:text-gray-400 mt-1">Analyze and compare vendor quotes against requirements.</p>
        </div>

        {/* Unified Toolbar */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-charcoal-800 p-1.5 rounded-xl border border-slate-200 dark:border-charcoal-700 shadow-sm">

          {/* History Group */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={18} />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-charcoal-600 mx-1"></div>

          {/* View Group */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleFreeze}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all
                ${(freezeState.cols > 0)
                  ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                  : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-charcoal-700'}`}
              title={freezeState.cols > 0 ? "Unfreeze Columns" : "Freeze Selected Column(s)"}
            >
              <Snowflake size={16} />
              <span className="hidden sm:inline">{(freezeState.cols > 0) ? 'Unfreeze' : 'Freeze'}</span>
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-charcoal-600 mx-1"></div>

          {/* Data Group */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportWizard(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
              title="Import Data"
            >
              <Upload size={16} /> <span className="hidden lg:inline">Import</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
              title="Export View"
            >
              <Download size={16} /> <span className="hidden lg:inline">Export</span>
            </button>

            <button
              onClick={handleScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white shadow-md transition-all ml-1
                ${isScanning ? 'bg-slate-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'}`}
            >
              {isScanning ? <RefreshCw size={16} className="animate-spin" /> : <ScanLine size={16} />}
              <span>Scan Matrix</span>
            </button>

            {scanComplete && (
              <>
                <div className="w-px h-6 bg-slate-200 dark:bg-charcoal-600 mx-1"></div>
                <button
                  onClick={saveScanResultsToDb}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                  title="Save Scan Results to DB"
                >
                  <CheckCircle2 size={16} /> <span className="hidden xl:inline">Save Results</span>
                </button>
                <button
                  onClick={saveImportedDataToInventory}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Push All Data to Inventory"
                >
                  <Server size={16} /> <span className="hidden xl:inline">Push to Inventory</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Main Glass Panel */}
      <div className="flex-1 flex flex-col bg-white/70 dark:bg-charcoal-800/70 backdrop-blur-xl border border-white/60 dark:border-charcoal-700/60 shadow-lg rounded-3xl overflow-hidden relative min-h-0">

        {/* Info Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-charcoal-700 bg-slate-50/50 dark:bg-charcoal-900/30 flex items-center justify-between flex-none">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
            <FileSpreadsheet size={18} className="text-pastel-blue dark:text-charcoal-brand" />
            <span className="font-medium">Carriers: {headerGroups.length - 1}</span>
            <span>• {gridData.length} Rows</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
            <FileSpreadsheet size={18} className="text-pastel-blue dark:text-charcoal-brand" />
            <span className="font-medium">Carriers: {headerGroups.length - 1}</span>
            <span>• {gridData.length} Rows</span>
          </div>
          {/* Export moved to toolbar */}
        </div>

        {/* Grid Container */}
        <div
          className="flex-1 overflow-auto custom-scrollbar relative outline-none"
          ref={containerRef}
          onScroll={handleScroll}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => isDragging && setIsDragging(false)}
          onContextMenu={handleContextMenu}
        >
          {/* Status Overlays */}
          {isScanning && (
            <div className="absolute inset-0 z-30 bg-indigo-500/10 dark:bg-indigo-900/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
              <div className="bg-white dark:bg-charcoal-900 p-6 rounded-2xl shadow-xl border border-indigo-100 flex flex-col items-center animate-pulse">
                <ScanLine size={48} className="text-indigo-500 mb-3" />
                <h3 className="text-lg font-bold">Analyzing...</h3>
              </div>
            </div>
          )}
          {scanComplete && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full shadow-lg text-sm font-medium">
                <CheckCircle2 size={16} /> Scan Complete
                <button onClick={() => setScanComplete(false)} className="ml-2 hover:bg-emerald-600 rounded-full p-0.5 pointer-events-auto"><X size={14} /></button>
              </div>
            </div>
          )}

          <table className="border-collapse min-w-max table-fixed" ref={tableRef}>
            {/* Define column widths */}
            <colgroup>
              <col className="w-12" />
              {colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
            </colgroup>

            <thead className="sticky top-0 z-30 shadow-sm" ref={theadRef}>
              {/* Parent Headers */}
              <tr>
                <th className="w-12 bg-slate-100 dark:bg-charcoal-800 border-b border-r border-slate-300 dark:border-charcoal-600 sticky left-0 z-30"></th>
                {headerGroups.map((group, i) => (
                  <th
                    key={i}
                    colSpan={group.span}
                    className={`border-b border-r px-4 py-1 text-center text-xs font-bold uppercase tracking-widest
                       ${i === 0
                        ? 'bg-blue-50 dark:bg-indigo-900/30 border-blue-200 dark:border-indigo-800 text-blue-700 dark:text-blue-300'
                        : group.title === 'Extra'
                          ? 'bg-slate-100 dark:bg-charcoal-700 border-slate-300 dark:border-charcoal-600 text-slate-500 dark:text-gray-400'
                          : group.title === 'Preferred Carrier'
                            ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'}`
                    }
                  >
                    {group.title}
                  </th>
                ))}
              </tr>
              {/* Sub Headers */}
              <tr>
                <th className="w-12 bg-slate-100 dark:bg-charcoal-800 border-b border-r border-slate-300 dark:border-charcoal-600 text-center text-xs text-slate-500 font-medium p-2 sticky left-0 z-30">#</th>
                {flatHeaders.map((header, i) => {
                  const isFrozen = i < freezeState.cols;
                  // If frozen, use z-50 to stay above normal sticky headers when scrolling
                  // Use ring-2 to highlight all edges of frozen header
                  return (
                    <th
                      key={i}
                      onClick={(e) => handleHeaderClick(i, e)}
                      className={`bg-slate-100 dark:bg-charcoal-800 border-b border-r border-slate-300 dark:border-charcoal-600 px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider select-none relative group cursor-pointer hover:bg-slate-200 dark:hover:bg-charcoal-700
                        ${isFrozen ? 'sticky z-50 ring-2 ring-inset ring-sky-500 dark:ring-sky-400 shadow-md' : ''}`}
                      style={isFrozen ? { left: getColLeftOffset(i) } : {}}
                    >
                      <div className="truncate flex-1">{header}</div>

                      {/* Sort Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSort(i);
                        }}
                        className={`p-1 rounded hover:bg-slate-300 dark:hover:bg-charcoal-600 transition-colors ml-1 ${sortConfig?.col === i ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}
                        title="Sort Column"
                      >
                        {sortConfig?.col === i ? (
                          sortConfig.dir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} />
                        )}
                      </button>

                      {/* Drag Handle */}
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-pastel-blue dark:hover:bg-charcoal-brand z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => startResizing(i, e)}
                        onClick={(e) => e.stopPropagation()} // Prevent column selection when resizing
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {gridData.map((row, rowIndex) => {
                // Filter Check
                if (searchQuery) {
                  const rowStr = row.join(' ').toLowerCase();
                  if (!rowStr.includes(searchQuery.toLowerCase())) return null;
                }

                const isRowFrozen = rowIndex < freezeState.rows; // Should be 0 based on new requirement
                return (
                  <tr key={rowIndex} style={{ height: '37px' }}>
                    <td className={`bg-slate-50 dark:bg-charcoal-900 border-b border-r border-slate-200 dark:border-charcoal-700 text-center text-xs text-slate-400 font-mono p-2 select-none sticky left-0 z-20 
                        ${isRowFrozen ? 'sticky z-40 border-b-2 border-b-slate-400 dark:border-b-charcoal-500' : ''}`}
                      style={isRowFrozen ? { top: getRowTopOffset(rowIndex) } : {}}
                    >
                      {rowIndex + 1}
                    </td>
                    {row.map((cell: any, colIndex: number) => {
                      const selected = isSelected(rowIndex, colIndex);
                      const isColFrozen = colIndex < freezeState.cols;

                      // Calculate Classes for Sticky State
                      let stickyClass = '';
                      let stickyStyle: React.CSSProperties = {};

                      if (isRowFrozen && isColFrozen) {
                        stickyClass = 'sticky z-40 ring-2 ring-inset ring-sky-500 dark:ring-sky-400 bg-sky-50 dark:bg-charcoal-800';
                        stickyStyle = { top: getRowTopOffset(rowIndex), left: getColLeftOffset(colIndex) };
                      } else if (isRowFrozen) {
                        stickyClass = 'sticky z-20 border-b-2 border-b-slate-400 dark:border-b-charcoal-500';
                        stickyStyle = { top: getRowTopOffset(rowIndex) };
                      } else if (isColFrozen) {
                        // Left Sticky - Frozen Column
                        // Use ring-2 to highlight all edges as requested
                        stickyClass = 'sticky z-20 ring-2 ring-inset ring-sky-500/50 dark:ring-sky-400/50 bg-sky-50/20 dark:bg-charcoal-800';
                        stickyStyle = { left: getColLeftOffset(colIndex) };
                      }

                      return (
                        <td
                          key={colIndex}
                          className={`p-0 border-b border-r border-slate-200 dark:border-charcoal-700 relative 
                            ${selected && !isColFrozen ? 'bg-blue-100/50 dark:bg-blue-900/30 ring-1 ring-inset ring-blue-400 z-10' : 'bg-white dark:bg-charcoal-900/50'}
                            ${stickyClass}`}
                          style={stickyStyle}
                          onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                          onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                        >
                          <input
                            type="text"
                            autoComplete="off"
                            value={cell || ''}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            onBlur={handleCellBlur}
                            className={`w-full h-full px-3 py-2 bg-transparent text-sm text-slate-700 dark:text-gray-300 focus:outline-none transition-none truncate ${selected ? 'font-medium' : ''}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selection Status */}
        <div className="bg-slate-50 dark:bg-charcoal-900 border-t border-slate-200 dark:border-charcoal-700 px-4 py-1 text-xs text-slate-400 font-mono flex-none flex justify-between">
          <span>{selection.start ? `Selection: R${selection.start.r + 1} C${selection.start.c + 1}` : 'Ready'}</span>
          <span>{freezeState.rows > 0 || freezeState.cols > 0 ? `Frozen: ${freezeState.cols} Cols` : ''}</span>
        </div>

        {/* Context Menu */}
        <ContextMenu
          {...contextMenu}
          onClose={() => setContextMenu({ ...contextMenu, visible: false })}
          onCopy={handleCopy}
          onPaste={handleManualPaste}
          onClear={handleClearSelection}
          onDeleteRow={handleDeleteRows}
          onFill={handleFillSelection}
          onClearAll={handleClearAll}
        />

        {/* IMPORT WIZARD MODAL */}
        <ImportWizard
          isOpen={showImportWizard}
          onClose={() => setShowImportWizard(false)}
          onImportComplete={handleImportComplete}
          currentGrid={gridData}
          currentHeaderGroups={headerGroups}
        />

        {/* SCAN MATRIX MODAL */}
        <ScanMatrixModal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          detectedCurrencies={detectedCurrencies}
          onProcess={handleProcessScan}
        />

      </div>
    </div>
  );
};