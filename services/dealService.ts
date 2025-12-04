import { DealRecord } from '@/types';

export const generateDummyDeals = (): DealRecord[] => {
  const accountNames = ['Acme Corp', 'Globex Inc', 'Soylent Corp', 'Initech', 'Umbrella Corp', 'Stark Ind', 'Wayne Ent', 'Cyberdyne', 'Massive Dynamic'];
  const requestTypes = ['New Site', 'Upgrade', 'Renewal', 'RFP', 'Move/Add/Change'];
  const statuses = ['Pipeline', 'Qualified', 'Proposed', 'Negotiating', 'Closed Won', 'Closed Lost'];
  const leads = ['Alex Morgan', 'Sarah Connor', 'Tony Stark', 'Bruce Wayne'];
  const carriers = ['AT&T', 'Verizon', 'BT', 'Orange', 'Lumen', 'Colt'];
  const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'Singapore', 'Australia', 'Brazil', 'Canada', 'India', 'China', 'Netherlands', 'Mexico', 'South Africa'];

  return Array.from({ length: 45 }).map((_, i) => ({
    id: `DL-${1000 + i}`,
    accountName: accountNames[Math.floor(Math.random() * accountNames.length)],
    requestType: requestTypes[Math.floor(Math.random() * requestTypes.length)],
    mcnStatus: ['Approved', 'Pending', 'Draft'][Math.floor(Math.random() * 3)],
    micStatusAccess: ['Feasible', 'Not Feasible', 'Review'][Math.floor(Math.random() * 3)],
    dealStatus: statuses[Math.floor(Math.random() * statuses.length)],
    carrierName: carriers[Math.floor(Math.random() * carriers.length)],
    submissionDate: new Date().toISOString().split('T')[0],
    atpDate: '',
    committedQuoteDate: '',
    targetDateSales: '',
    solutionCompletionDate: '',
    noRequotes: Math.floor(Math.random() * 5),
    saLead: leads[Math.floor(Math.random() * leads.length)],
    ddLead: leads[Math.floor(Math.random() * leads.length)],
    salesforceId: `SF-${Math.floor(Math.random() * 100000)}`,
    solutionSummary: 'Auto-generated deal.',
    noCircuits: Math.floor(Math.random() * 20) + 1,
    avgCircuitCost: Math.floor(Math.random() * 500) + 200,
    circuitValue: Math.floor(Math.random() * 5000) + 1000,
    mcnMicAcv: Math.floor(Math.random() * 50000) + 10000,
    micAcv: Math.floor(Math.random() * 20000) + 5000,
    pmRequired: Math.random() > 0.5,
    serviceActivationRequired: Math.random() > 0.5,
    dealSummary: 'Auto-generated summary.',
    country: countries[Math.floor(Math.random() * countries.length)],
    notes: [
      {
        id: `note-${i}`,
        author: 'System',
        text: 'Deal initialized.',
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
      }
    ]
  }));
};