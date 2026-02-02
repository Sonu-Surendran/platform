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
  CHANGE_TRACKER = 'Change Tracker',
  REPORTS = 'Analytics',
  MIC_POM = 'MIC POM',
  CHANGE_MANAGEMENT = 'MIC Change Management',
  ACTIVE_ONBOARD_CIRCUITS = 'Active Onboard Circuits',
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
  circuit_type: string;
  dl_mbps: string;
  ul_mbps: string;
  quote_type: string;
  ip_range: string;
  otc: number;
  mrc: number;
  currency: string;
  carrier_partner: string;
  lmp: string;
  mttr_sla: string;
  availability_sla: string;
  timestamp: string;
  notes: string;
  client: string;
  region: string;
  used_in_cpq: string;
  nrc_usd: number;
  mrc_usd: number;
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

export interface ActiveOnboardCircuit {
  id: string;
  order_type: string;
  ntt_order_acceptance_date: string;
  order_placement_date: string;
  carrier_order_acceptance_date: string;
  client_name: string;
  ntt_circuit_id: string;
  cr_number: string;
  contracted_vendor: string;
  mrc: number;
  otc: number;
  currency: string;
  lmp: string;
  isp: string;
  ttr_sla: string;
  availability_sla: string;
  site_name: string;
  site_code: string;
  address: string;
  city: string;
  postal_zip: string;
  country: string;
  contract_term: number;
  internet_type: string;
  physical_access_bearer_bandwidth: string;
  access_medium: string;
  downlink_speed: string;
  uplink_speed: string;
  monthly_data_plan: number;
  demarcation_details: string;
  hand_off: string;
  negotiation_duplex: string;
  negotiation_speed: string;
  diversity_guarantee: string;
  ip_routing: string;
  ip_address_assignment: string;
  min_wan_ip_subnet_range: string;
  primary_lcon_name: string;
  primary_lcon_phone: string;
  primary_lcon_email: string;
  secondary_lcon_name: string;
  secondary_lcon_phone: string;
  secondary_lcon_email: string;
  special_access_required: boolean;
  field_engineer_required: boolean;
  notes: string;
}