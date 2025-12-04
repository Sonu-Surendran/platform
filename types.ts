import React from 'react';

export interface MetricData {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  color: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number; // Optional secondary value for stacked/composed charts
  amt?: number;
}

export interface Deal {
  id: string;
  client: string;
  amount: number;
  stage: 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won';
  probability: number;
}

export enum SidebarItemType {
  DASHBOARD = 'Dashboard',
  CIRCUIT_INVENTORY = 'Circuit Inventory',
  MATRIX_COMPARISON = 'Matrix Comparison',
  DEALS = 'Deals',
  REPORTS = 'Analytics',
  MIC_POM = 'MIC POM',
  SETTINGS = 'Settings'
}

export interface Circuit {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  term: number;
  circuitType: string;
  dlMbps: string;
  ulMbps: string;
  quoteType: string;
  ipRange: string;
  otc: number;
  mrc: number;
  currency: string;
  carrierPartner: string;
  lmp: string;
  mttrSla: string;
  availabilitySla: string;
  timestamp: string;
  notes: string;
  client: string;
  region: string;
  usedInCpq: string;
  nrcUsd: number;
  mrcUsd: number;
}

export interface DealNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface DealRecord {
  id: string; // Internal ID
  accountName: string;
  requestType: string;
  mcnStatus: string;
  micStatusAccess: string;
  dealStatus: string;
  carrierName: string;
  submissionDate: string;
  atpDate: string;
  committedQuoteDate: string;
  targetDateSales: string;
  solutionCompletionDate: string;
  noRequotes: number;
  saLead: string;
  ddLead: string;
  salesforceId: string;
  solutionSummary: string;
  noCircuits: number;
  avgCircuitCost: number;
  circuitValue: number;
  mcnMicAcv: number;
  micAcv: number;
  pmRequired: boolean;
  serviceActivationRequired: boolean;
  dealSummary: string;
  notes: DealNote[];
  country?: string; // Added for Heatmap
}

export interface MicPomRecord {
  id: string;
  customerName: string;
  country: string;
  address: string;
  circuitId: string;
  carrierName: string;
  carrierCircuitId: string;
  mrc: number;
  nrc: number;
  billingDate: string;
  handoverDate: string;
  uploaderName: string;
  invoiceFile: string;
  contractFile: string;
  timestamp: string;
}

export interface HeaderGroup {
  title: string;
  span: number;
  subHeaders: string[];
}