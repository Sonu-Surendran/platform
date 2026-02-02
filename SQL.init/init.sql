-- Database Schema for MIC Platform

-- 1. Deals Table
CREATE TABLE IF NOT EXISTS deals (
    id VARCHAR(50) PRIMARY KEY,
    account_name VARCHAR(255) NOT NULL,
    request_type VARCHAR(100),
    mcn_status VARCHAR(50),
    mic_status_access VARCHAR(50),
    deal_status VARCHAR(50),
    carrier_name VARCHAR(255),
    submission_date DATE,
    atp_date DATE,
    committed_quote_date DATE,
    target_date_sales DATE,
    solution_completion_date DATE,
    no_requotes INT DEFAULT 0,
    sa_lead VARCHAR(255),
    dd_lead VARCHAR(255),
    salesforce_id VARCHAR(100),
    solution_summary TEXT,
    no_circuits INT DEFAULT 0,
    avg_circuit_cost DECIMAL(15, 2),
    circuit_value DECIMAL(15, 2),
    mcn_mic_acv DECIMAL(15, 2),
    mic_acv DECIMAL(15, 2),
    pm_required BOOLEAN DEFAULT FALSE,
    service_activation_required BOOLEAN DEFAULT FALSE,
    deal_summary TEXT,
    country VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_account_name ON deals (account_name);
CREATE INDEX IF NOT EXISTS idx_salesforce_id ON deals (salesforce_id);
CREATE INDEX IF NOT EXISTS idx_deal_status ON deals (deal_status);

-- 2. Deal Notes Table
CREATE TABLE IF NOT EXISTS deal_notes (
    id VARCHAR(50) PRIMARY KEY,
    deal_id VARCHAR(50) NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    author VARCHAR(255),
    note_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Circuits Table
CREATE TABLE IF NOT EXISTS circuits (
    id VARCHAR(50) PRIMARY KEY,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip VARCHAR(50),
    country VARCHAR(100),
    term INT,
    circuit_type VARCHAR(100),
    dl_mbps VARCHAR(50),
    ul_mbps VARCHAR(50),
    quote_type VARCHAR(100),
    ip_range VARCHAR(50),
    otc DECIMAL(15, 2),
    mrc DECIMAL(15, 2),
    currency VARCHAR(10),
    carrier_partner VARCHAR(255),
    lmp VARCHAR(255),
    mttr_sla VARCHAR(100),
    availability_sla VARCHAR(100),
    notes TEXT,
    client VARCHAR(255),
    region VARCHAR(100),
    used_in_cpq VARCHAR(100),
    nrc_usd DECIMAL(15, 2),
    mrc_usd DECIMAL(15, 2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_circuit_client ON circuits (client);
CREATE INDEX IF NOT EXISTS idx_circuit_country ON circuits (country);

-- 4. MIC POM Records Table
CREATE TABLE IF NOT EXISTS mic_pom_records (
    id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(255),
    country VARCHAR(100),
    address TEXT,
    circuit_id VARCHAR(50),
    carrier_name VARCHAR(255),
    carrier_circuit_id VARCHAR(100),
    mrc DECIMAL(15, 2),
    nrc DECIMAL(15, 2),
    billing_date DATE,
    handover_date DATE,
    uploader_name VARCHAR(255),
    invoice_file VARCHAR(255),
    contract_file VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pom_customer ON mic_pom_records (customer_name);
CREATE INDEX IF NOT EXISTS idx_pom_circuit_id ON mic_pom_records (circuit_id);

-- 5. Users and Permissions
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    resource VARCHAR(50) NOT NULL,
    access_level VARCHAR(20) NOT NULL,
    UNIQUE(user_id, resource)
);

-- 6. Matrix Scan History
CREATE TABLE IF NOT EXISTS scan_sessions (
    id VARCHAR(50) PRIMARY KEY,
    scan_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_sites INT,
    total_mrc DECIMAL(15, 2)
);

CREATE TABLE IF NOT EXISTS scan_results (
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) REFERENCES scan_sessions(id) ON DELETE CASCADE,
    client_site_id VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    winning_carrier VARCHAR(255),
    winning_mrc DECIMAL(15, 2),
    winning_nrc DECIMAL(15, 2),
    currency VARCHAR(10),
    term INT
);

-- 7. Change Requests Table
CREATE TABLE IF NOT EXISTS change_requests (
    id VARCHAR(50) PRIMARY KEY,
    salesforce_record_id VARCHAR(100),
    salesforce_region VARCHAR(100),
    account_name VARCHAR(255),
    change_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Pending',
    
    -- Add New Sites Fields
    site_id VARCHAR(100),
    bandwidth VARCHAR(50),
    new_circuit_type VARCHAR(100),
    site_address TEXT,
    contract_term INT,
    
    -- Upgrade/Downgrade Fields
    current_circuit_id VARCHAR(100),
    existing_bandwidth VARCHAR(50),
    new_bandwidth VARCHAR(50),
    
    -- Shifting Fields
    circuit_id_move VARCHAR(100),
    new_address TEXT,
    old_circuit_address TEXT,
    
    -- Decommission Fields
    decommission_circuit_id VARCHAR(100),
    decommission_date DATE,
    decommission_notice_period VARCHAR(100),
    circuit_details TEXT,
    reason_for_decommission TEXT,
    
    -- Common / Other
    new_intl_dom_split VARCHAR(100),
    notes TEXT,
    status_notes TEXT,
    inventory_file_path VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cr_account ON change_requests (account_name);
CREATE INDEX IF NOT EXISTS idx_cr_status ON change_requests (status);

-- 8. Active Onboard Circuits Table
CREATE TABLE IF NOT EXISTS active_onboard_circuits (
    id VARCHAR(50) PRIMARY KEY,
    order_type VARCHAR(100),
    ntt_order_acceptance_date DATE,
    order_placement_date DATE,
    carrier_order_acceptance_date DATE,
    client_name VARCHAR(255),
    ntt_circuit_id VARCHAR(100),
    cr_number VARCHAR(100),
    contracted_vendor VARCHAR(255),
    mrc DECIMAL(15, 2),
    otc DECIMAL(15, 2),
    currency VARCHAR(10),
    lmp VARCHAR(255),
    isp VARCHAR(255),
    ttr_sla TEXT,
    availability_sla TEXT,
    site_name VARCHAR(255),
    site_code VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    postal_zip TEXT,
    country VARCHAR(100),
    contract_term INT,
    internet_type VARCHAR(100),
    physical_access_bearer_bandwidth VARCHAR(100),
    access_medium VARCHAR(100),
    downlink_speed VARCHAR(50),
    uplink_speed TEXT,
    monthly_data_plan DECIMAL(15, 2),
    demarcation_details TEXT,
    hand_off TEXT,
    negotiation_duplex VARCHAR(50),
    negotiation_speed VARCHAR(50),
    diversity_guarantee TEXT,
    ip_routing TEXT,
    ip_address_assignment TEXT,
    min_wan_ip_subnet_range TEXT,
    primary_lcon_name VARCHAR(255),
    primary_lcon_phone TEXT,
    primary_lcon_email VARCHAR(255),
    secondary_lcon_name VARCHAR(255),
    secondary_lcon_phone TEXT,
    secondary_lcon_email VARCHAR(255),
    special_access_required BOOLEAN DEFAULT FALSE,
    field_engineer_required BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_active_circuits_client ON active_onboard_circuits (client_name);
CREATE INDEX IF NOT EXISTS idx_active_circuits_country ON active_onboard_circuits (country);
