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
