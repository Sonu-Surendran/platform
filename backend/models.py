from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class DealNote(BaseModel):
    id: str
    deal_id: str
    author: Optional[str] = None
    note_text: Optional[str] = None
    created_at: Optional[datetime] = None

class DealCreate(BaseModel):
    id: str
    account_name: str
    request_type: Optional[str] = None
    mcn_status: Optional[str] = None
    mic_status_access: Optional[str] = None
    deal_status: Optional[str] = None
    carrier_name: Optional[str] = None
    submission_date: Optional[date] = None
    atp_date: Optional[date] = None
    committed_quote_date: Optional[date] = None
    target_date_sales: Optional[date] = None
    solution_completion_date: Optional[date] = None
    no_requotes: Optional[int] = 0
    sa_lead: Optional[str] = None
    dd_lead: Optional[str] = None
    salesforce_id: Optional[str] = None
    solution_summary: Optional[str] = None
    no_circuits: Optional[int] = 0
    avg_circuit_cost: Optional[float] = None
    circuit_value: Optional[float] = None
    mcn_mic_acv: Optional[float] = None
    mic_acv: Optional[float] = None
    pm_required: Optional[bool] = False
    service_activation_required: Optional[bool] = False
    deal_summary: Optional[str] = None
    country: Optional[str] = None

class DealUpdate(DealCreate):
    pass

class CircuitCreate(BaseModel):
    id: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    country: Optional[str] = None
    term: Optional[int] = None
    circuit_type: Optional[str] = None
    dl_mbps: Optional[str] = None
    ul_mbps: Optional[str] = None
    quote_type: Optional[str] = None
    ip_range: Optional[str] = None
    otc: Optional[float] = None
    mrc: Optional[float] = None
    currency: Optional[str] = None
    carrier_partner: Optional[str] = None
    lmp: Optional[str] = None
    mttr_sla: Optional[str] = None
    availability_sla: Optional[str] = None
    notes: Optional[str] = None
    client: Optional[str] = None
    region: Optional[str] = None
    used_in_cpq: Optional[str] = None
    nrc_usd: Optional[float] = None
    mrc_usd: Optional[float] = None

class MicPomRecordCreate(BaseModel):
    id: str
    customer_name: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    circuit_id: Optional[str] = None
    carrier_name: Optional[str] = None
    carrier_circuit_id: Optional[str] = None
    mrc: Optional[float] = None
    nrc: Optional[float] = None
    billing_date: Optional[date] = None
    handover_date: Optional[date] = None
    uploader_name: Optional[str] = None
    invoice_file: Optional[str] = None
    contract_file: Optional[str] = None

class NoteCreate(BaseModel):
    id: str
    deal_id: str
    author: Optional[str] = None
    note_text: Optional[str] = None

class ScanResultCreate(BaseModel):
    id: str
    session_id: str
    client_site_id: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    winning_carrier: Optional[str] = None
    winning_mrc: Optional[float] = None
    winning_nrc: Optional[float] = None
    currency: Optional[str] = None
    term: Optional[int] = None

class ScanSessionCreate(BaseModel):
    id: str
    scan_name: str
    total_sites: int
    total_mrc: float
    results: List[ScanResultCreate]

class PermissionCreate(BaseModel):
    resource: str
    access_level: str

class UserCreate(BaseModel):
    username: str
    email: str
    role: str
    permissions: List[PermissionCreate]

class ChangeRequestCreate(BaseModel):
    id: str
    salesforce_record_id: Optional[str] = None
    salesforce_region: Optional[str] = None
    account_name: Optional[str] = None
    change_type: Optional[str] = None
    status: Optional[str] = "Pending"
    
    # Add New Sites
    site_id: Optional[str] = None
    bandwidth: Optional[str] = None
    new_circuit_type: Optional[str] = None
    site_address: Optional[str] = None
    contract_term: Optional[int] = None
    
    # Upgrade/Downgrade
    current_circuit_id: Optional[str] = None
    existing_bandwidth: Optional[str] = None
    new_bandwidth: Optional[str] = None
    
    # Shifting
    circuit_id_move: Optional[str] = None
    new_address: Optional[str] = None
    old_circuit_address: Optional[str] = None
    
    # Decommission
    decommission_circuit_id: Optional[str] = None
    decommission_date: Optional[date] = None
    decommission_notice_period: Optional[str] = None
    circuit_details: Optional[str] = None
    reason_for_decommission: Optional[str] = None
    
    # Common
    new_intl_dom_split: Optional[str] = None
    notes: Optional[str] = None
    inventory_file_path: Optional[str] = None

class ActiveOnboardCircuitCreate(BaseModel):
    id: str
    order_type: Optional[str] = None
    ntt_order_acceptance_date: Optional[date] = None
    order_placement_date: Optional[date] = None
    carrier_order_acceptance_date: Optional[date] = None
    client_name: Optional[str] = None
    ntt_circuit_id: Optional[str] = None
    cr_number: Optional[str] = None
    contracted_vendor: Optional[str] = None
    mrc: Optional[float] = None
    otc: Optional[float] = None
    currency: Optional[str] = None
    lmp: Optional[str] = None
    isp: Optional[str] = None
    ttr_sla: Optional[str] = None
    availability_sla: Optional[str] = None
    site_name: Optional[str] = None
    site_code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_zip: Optional[str] = None
    country: Optional[str] = None
    contract_term: Optional[int] = None
    internet_type: Optional[str] = None
    physical_access_bearer_bandwidth: Optional[str] = None
    access_medium: Optional[str] = None
    downlink_speed: Optional[str] = None
    uplink_speed: Optional[str] = None
    monthly_data_plan: Optional[float] = None
    demarcation_details: Optional[str] = None
    hand_off: Optional[str] = None
    negotiation_duplex: Optional[str] = None
    negotiation_speed: Optional[str] = None
    diversity_guarantee: Optional[str] = None
    ip_routing: Optional[str] = None
    ip_address_assignment: Optional[str] = None
    min_wan_ip_subnet_range: Optional[str] = None
    primary_lcon_name: Optional[str] = None
    primary_lcon_phone: Optional[str] = None
    primary_lcon_email: Optional[str] = None
    secondary_lcon_name: Optional[str] = None
    secondary_lcon_phone: Optional[str] = None
    secondary_lcon_email: Optional[str] = None
    special_access_required: Optional[bool] = False
    field_engineer_required: Optional[bool] = False
    notes: Optional[str] = None

class ActiveOnboardCircuitUpdate(ActiveOnboardCircuitCreate):
    pass
