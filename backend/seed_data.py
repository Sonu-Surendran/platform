import requests
import json
import random
from datetime import datetime, timedelta

API_URL = "http://localhost:8000"

def get_random_date(start_days_ago=365, end_days_ahead=365):
    days = random.randint(-start_days_ago, end_days_ahead)
    return (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d")

def seed_users():
    print("Seeding Users...")
    users = [
        {"username": "admin", "email": "admin@mic.com", "role": "admin", "permissions": []},
        {"username": "jdoe", "email": "jdoe@mic.com", "role": "user", "permissions": []}
    ]
    for u in users:
        try:
            requests.post(f"{API_URL}/users", json=u)
            print(f"  Created user: {u['username']}")
        except Exception as e:
            print(f"  Error creating user {u['username']}: {e}")

def seed_deals():
    print("Seeding Deals...")
    for i in range(1, 11):
        deal = {
            "id": f"DEAL-{1000+i}",
            "account_name": f"Client {i} Corp",
            "request_type": random.choice(["New Circuit", "Upgrade", "Renewal"]),
            "deal_status": random.choice(["Pipeline", "Qualified", "Proposed", "Negotiating", "Closed Won"]),
            "country": random.choice(["USA", "UK", "Germany", "Japan", "India"]),
            "mic_acv": random.uniform(5000, 50000),
            "mcn_mic_acv": random.uniform(10000, 100000),
            "submission_date": get_random_date(),
            "target_date_sales": get_random_date(),
            "deal_summary": f"This is a dummy summary for deal {i}."
        }
        try:
            requests.post(f"{API_URL}/deals", json=deal)
            # Add note
            note = {
                "id": f"NOTE-{1000+i}",
                "deal_id": deal["id"],
                "author": "System Seeder",
                "note_text": f"Initial note for {deal['account_name']}"
            }
            requests.post(f"{API_URL}/notes", json=note)
        except Exception as e:
            print(f"  Error creating deal {deal['id']}: {e}")
    print("  Deals seeded.")

def seed_active_circuits():
    print("Seeding Active Onboard Circuits...")
    clients = ["Coca Cola", "Pepsi", "Nike", "Adidas", "Google", "Amazon", "NTT"]
    countries = ["USA", "UK", "France", "Germany", "Singapore", "Japan"]
    
    for i in range(1, 21):
        circuit = {
            "id": f"CKT-ACT-{2000+i}",
            "order_type": random.choice(["New", "Move", "Change"]),
            "client_name": random.choice(clients),
            "ntt_circuit_id": f"NTT-{random.randint(10000, 99999)}",
            "country": random.choice(countries),
            "city": f"City-{i}",
            "mrc": random.uniform(100, 5000),
            "currency": "USD",
            "contract_term": random.choice([12, 24, 36]),
            "internet_type": random.choice(["DIA", "Broadband", "MPLS"]),
            "primary_lcon_name": f"LCON User {i}",
            "primary_lcon_email": f"lcon{i}@client.com",
            "primary_lcon_phone": f"+1-555-010{i}",
            "status": "Active"
        }
        try:
            requests.post(f"{API_URL}/active-onboard-circuits", json=circuit)
        except Exception as e:
            print(f"  Error creating active circuit {circuit['id']}: {e}")
    print("  Active circuits seeded.")

def seed_change_requests():
    print("Seeding Change Requests...")
    types = ["Add New Sites", "Upload/Downgrade", "Shifting", "Decommission"]
    for i in range(1, 6):
        cr = {
            "id": f"CR-{3000+i}",
            "account_name": f"Client {i} Corp",
            "change_type": random.choice(types),
            "status": random.choice(["Pending", "Approved", "In Progress"]),
            "site_id": f"SITE-{100+i}",
            "notes": "Automated test change request."
        }
        try:
            # Change requests use Form data in the main.py but here I'm lazy and the main.py expects JSON string in 'data' field
            # creating a dummy file is hard via simple request without local file, so we skip file or mock it.
            # endpoint: create_change_request(data: str = Form(...), file: UploadFile = File(None))
            
            payload = {"data": json.dumps(cr)}
            requests.post(f"{API_URL}/change-requests", data=payload)
        except Exception as e:
            print(f"  Error creating CR {cr['id']}: {e}")
    print("  Change Requests seeded.")

def seed_mic_pom():
    print("Seeding MIC POM...")
    for i in range(1, 6):
        pom = {
            "id": f"POM-{4000+i}",
            "customer_name": f"Customer {i}",
            "country": "USA",
            "circuit_id": f"CKT-POM-{i}",
            "mrc": 1000.0,
            "nrc": 500.0,
            "uploader_name": "Admin"
        }
        try:
             requests.post(f"{API_URL}/mic-pom", json=pom)
        except Exception as e:
            print(f"  Error seeding POM {pom['id']}: {e}")
    print("  MIC POM seeded.")

def seed_circuit_inventory():
    print("Seeding Circuit Inventory...")
    for i in range(1, 11):
        circuit = {
            "id": f"CKT-INV-{5000+i}",
            "address": f"{i} Main St",
            "city": "New York",
            "state": "NY",
            "zip": "10001",
            "country": "USA",
            "term": 12,
            "circuit_type": "MPLS",
            "dl_mbps": "100",
            "ul_mbps": "100",
            "mrc": 1200.0,
            "currency": "USD",
            "client": f"Client {i} Corp",
            "region": "NA"
        }
        try:
             requests.post(f"{API_URL}/circuits", json=circuit)
        except Exception as e:
            print(f"  Error seeding Inventory Circuit {circuit['id']}: {e}")
    print("  Circuit Inventory seeded.")

def seed_scan_results():
    print("Seeding Matrix Scans...")
    session = {
        "id": "SCAN-6001",
        "scan_name": "Demo Scan 1",
        "total_sites": 2,
        "total_mrc": 2000.0,
        "results": [
            {
                "id": "RES-1",
                "session_id": "SCAN-6001",
                "client_site_id": "SITE-A",
                "winning_carrier": "ATT",
                "winning_mrc": 1000.0,
                "country": "USA"
            },
            {
                "id": "RES-2",
                "session_id": "SCAN-6001",
                "client_site_id": "SITE-B",
                "winning_carrier": "Verizon",
                "winning_mrc": 1000.0,
                "country": "USA"
            }
        ]
    }
    try:
         requests.post(f"{API_URL}/matrix/scan-results", json=session)
    except Exception as e:
        print(f"  Error seeding Scan Results: {e}")
    print("  Matrix Scans seeded.")

if __name__ == "__main__":
    print("Starting Data Seeding...")
    try:
        # Check if API is up
        requests.get(f"{API_URL}/health")
        seed_users()
        seed_deals()
        seed_active_circuits()
        seed_change_requests()
        seed_mic_pom()
        seed_circuit_inventory()
        seed_scan_results()
        print("Seeding Complete!")
    except Exception as e:
        print(f"API not reachable or error occurred. Is the backend running? Error: {e}")
