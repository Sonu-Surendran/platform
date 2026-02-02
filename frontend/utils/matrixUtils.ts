import { HeaderGroup } from '@/types';

export interface CurrencyConfig {
  rate: number;
  buffer: number; // Percentage (e.g., 5 for 5%)
}

export interface ScanConfig {
  months: number;
  targetSiteId?: string;
  minSla?: number;
  currencyRates: Record<string, CurrencyConfig>;
}

// Helper to clean currency strings (e.g. "EUR " -> "EUR")
export const normalizeCurrency = (curr: any): string => {
  if (!curr) return 'USD';
  const s = String(curr).trim().toUpperCase();
  // Handle symbols if necessary, but assuming codes like EUR, GBP based on context
  if (s === '$') return 'USD';
  return s;
};

// Extract all unique non-USD currencies from the grid
export const getUniqueCurrencies = (
  gridData: any[][],
  headerGroups: HeaderGroup[]
): string[] => {
  const currencies = new Set<string>();

  // Helper to find column index mapping
  let colIndex = 0;
  
  headerGroups.forEach(group => {
    // Skip Requirements and existing Result columns if any
    if (group.title === 'Requirements' || group.title === 'Preferred Carrier' || group.title === 'Extra') {
      colIndex += group.span;
      return;
    }

    // Identify "Currency" column index within this group
    const currencySubIndex = group.subHeaders.findIndex(h => h.toLowerCase().includes('currency'));
    
    if (currencySubIndex !== -1) {
      const absoluteCurrencyIndex = colIndex + currencySubIndex;
      
      // Scan all rows for this column
      gridData.forEach(row => {
        const val = normalizeCurrency(row[absoluteCurrencyIndex]);
        if (val !== 'USD' && val !== '') {
          currencies.add(val);
        }
      });
    }
    
    colIndex += group.span;
  });

  return Array.from(currencies);
};

// Core Calculation Function
export const calculatePreferredCarrier = (
  gridData: any[][],
  headerGroups: HeaderGroup[],
  config: ScanConfig
): { newGrid: any[][], newGroups: HeaderGroup[] } => {
  
  // 1. Identify Data Structure
  let colIndex = 0;
  const carrierIndices: { 
    name: string; 
    startIndex: number; 
    mrcIdx: number; 
    nrcIdx: number; 
    currIdx: number; 
    slaIdx: number;
    lmpIdx: number;
    notesIdx: number;
  }[] = [];

  const requirementsGroup = headerGroups.find(g => g.title === 'Requirements');
  const idColumnIndex = requirementsGroup?.subHeaders.findIndex(h => h.toLowerCase().includes('id')) ?? 0;

  headerGroups.forEach(group => {
    if (group.title === 'Requirements' || group.title === 'Preferred Carrier' || group.title === 'Extra') {
      colIndex += group.span;
      return;
    }

    // Find sub-column indices relative to group start
    const mrcIdx = group.subHeaders.findIndex(h => h.toLowerCase() === 'mrc' || h.toLowerCase().includes('mrc'));
    const nrcIdx = group.subHeaders.findIndex(h => h.toLowerCase() === 'nrc' || h.toLowerCase().includes('nrc'));
    const currIdx = group.subHeaders.findIndex(h => h.toLowerCase().includes('currency'));
    const slaIdx = group.subHeaders.findIndex(h => h.toLowerCase().includes('sla')); // Matches MTTR SLA or Availability SLA
    const lmpIdx = group.subHeaders.findIndex(h => h.toLowerCase().includes('lmp'));
    const notesIdx = group.subHeaders.findIndex(h => h.toLowerCase().includes('notes'));

    if (mrcIdx !== -1 && nrcIdx !== -1) {
       carrierIndices.push({
         name: group.title,
         startIndex: colIndex,
         mrcIdx: mrcIdx !== -1 ? colIndex + mrcIdx : -1,
         nrcIdx: nrcIdx !== -1 ? colIndex + nrcIdx : -1,
         currIdx: currIdx !== -1 ? colIndex + currIdx : -1,
         slaIdx: slaIdx !== -1 ? colIndex + slaIdx : -1,
         lmpIdx: lmpIdx !== -1 ? colIndex + lmpIdx : -1,
         notesIdx: notesIdx !== -1 ? colIndex + notesIdx : -1,
       });
    }
    colIndex += group.span;
  });

  // 2. Prepare Output Structure
  // We need to append/update "Preferred Carrier" group
  const PREFERRED_HEADERS = ['Preferred Carrier', 'MRC (USD)', 'NRC (USD)', 'Currency', 'LMP', 'MTTR SLA', 'Notes'];
  
  const PREFERRED_SUB_HEADERS = ['Carrier', 'MRC', 'NRC', 'Currency', 'LMP', 'SLA', 'Notes'];

  let newGroups = [...headerGroups];
  const existingPrefIndex = newGroups.findIndex(g => g.title === 'Preferred Carrier');
  
  let prefStartIndex = 0;
  
  // Calculate where the preferred columns start
  if (existingPrefIndex !== -1) {
    // If it exists, we overwrite data in place, so we find its start index
    for(let i=0; i<existingPrefIndex; i++) prefStartIndex += newGroups[i].span;
  } else {
    // Append to end (before Extra if exists, or just at end)
    const extraIndex = newGroups.findIndex(g => g.title === 'Extra');
    if (extraIndex !== -1) {
       // Insert before Extra
       for(let i=0; i<extraIndex; i++) prefStartIndex += newGroups[i].span;
       newGroups.splice(extraIndex, 0, {
         title: 'Preferred Carrier',
         span: PREFERRED_SUB_HEADERS.length,
         subHeaders: PREFERRED_SUB_HEADERS
       });
    } else {
       // Append to very end
       newGroups.forEach(g => prefStartIndex += g.span);
       newGroups.push({
         title: 'Preferred Carrier',
         span: PREFERRED_SUB_HEADERS.length,
         subHeaders: PREFERRED_SUB_HEADERS
       });
    }
  }

  // 3. Process Rows
  const newGrid = gridData.map(row => {
    // Check Filter: Target Site ID
    const rowId = String(row[idColumnIndex] || '').trim();

    // Reusable function to assemble the row with the preferred cells
    const assembleRow = (cells: any[]) => {
      const baseRow = row.slice(0, prefStartIndex);
      // Fill any gaps if the row was shorter than where preferred starts
      while(baseRow.length < prefStartIndex) baseRow.push('');
      
      let suffixCols: any[] = [];
      if (row.length > prefStartIndex + PREFERRED_SUB_HEADERS.length) {
         suffixCols = row.slice(prefStartIndex + PREFERRED_SUB_HEADERS.length);
      } else if (existingPrefIndex !== -1) {
         const oldPrefEnd = prefStartIndex + (newGroups[existingPrefIndex].span);
         if (row.length > oldPrefEnd) suffixCols = row.slice(oldPrefEnd);
      }
      return [...baseRow, ...cells, ...suffixCols];
    };

    // FIX: If the row has no Client-Site ID (e.g. empty bottom row), do not calculate.
    // Return empty cells for the Preferred section to prevent dummy data generation.
    if (!rowId) {
      return assembleRow(Array(PREFERRED_SUB_HEADERS.length).fill(''));
    }

    if (config.targetSiteId && rowId !== config.targetSiteId) {
      return padRow(row, prefStartIndex + PREFERRED_SUB_HEADERS.length);
    }

    // Find Best Carrier
    let bestCarrier = null;
    let minTotalCost = Infinity;

    // Filter valid carriers by SLA first
    const candidates = carrierIndices.map(carrier => {
      // Parse Cost
      const rawMrc = parseFloat(row[carrier.mrcIdx]) || 0;
      const rawNrc = parseFloat(row[carrier.nrcIdx]) || 0;
      const rawCurr = normalizeCurrency(row[carrier.currIdx]);
      
      let finalMrc = rawMrc;
      let finalNrc = rawNrc;

      // Convert Currency
      if (rawCurr !== 'USD' && config.currencyRates[rawCurr]) {
        const { rate, buffer } = config.currencyRates[rawCurr];
        const multiplier = rate * (1 + (buffer / 100));
        finalMrc = rawMrc * multiplier;
        finalNrc = rawNrc * multiplier;
      }

      // Calculate Total Cost for Term
      const totalCost = (finalMrc * config.months) + finalNrc;

      // Parse SLA
      const slaStr = String(row[carrier.slaIdx] || '').replace('%', '');
      const slaVal = parseFloat(slaStr) || 0;

      return {
        ...carrier,
        totalCost,
        finalMrc,
        finalNrc,
        slaVal,
        rawSla: row[carrier.slaIdx],
        rawLmp: row[carrier.lmpIdx],
        rawNotes: row[carrier.notesIdx]
      };
    });

    // 1. Filter by SLA if required
    let validCandidates = candidates;
    if (config.minSla && config.minSla > 0) {
      const meetingSla = candidates.filter(c => c.slaVal >= (config.minSla || 0));
      if (meetingSla.length > 0) {
        validCandidates = meetingSla;
      }
      // "If there is no higher SLA for any carrier the best carrier should be selected."
      // This implies if NO ONE meets the SLA, we fall back to all candidates (validCandidates remains all)
    }

    // 2. Find Lowest Cost
    validCandidates.forEach(c => {
      if (c.totalCost < minTotalCost) {
        minTotalCost = c.totalCost;
        bestCarrier = c;
      }
    });

    // 3. Construct Result Cells
    const resultCells = bestCarrier ? [
      bestCarrier.name, // Carrier (Winner)
      (bestCarrier as any).finalMrc.toFixed(2), // MRC
      (bestCarrier as any).finalNrc.toFixed(2), // NRC
      'USD', // Currency
      (bestCarrier as any).rawLmp || '', // LMP
      (bestCarrier as any).rawSla || '', // SLA
      (bestCarrier as any).rawNotes || '' // Notes
    ] : Array(PREFERRED_SUB_HEADERS.length).fill('');

    // 4. Return new row
    return assembleRow(resultCells);
  });

  return { newGrid, newGroups };
};

const padRow = (row: any[], length: number) => {
  const newRow = [...row];
  while (newRow.length < length) newRow.push('');
  return newRow;
};