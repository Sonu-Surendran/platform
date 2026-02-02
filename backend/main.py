from fastapi import FastAPI, HTTPException, Body, File, UploadFile, Form
import shutil
import os
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection, get_redis_connection
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from models import DealCreate, DealUpdate, CircuitCreate, MicPomRecordCreate, NoteCreate, ScanSessionCreate, UserCreate, PermissionCreate, ChangeRequestCreate, ActiveOnboardCircuitCreate, ActiveOnboardCircuitUpdate
from typing import List, Optional
import json
from datetime import date, datetime
from decimal import Decimal

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError ("Type %s not serializable" % type(obj))

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173", # Vite default port
    "http://localhost:3000",
    "*" # For development convenience
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AI Configuration ---
import openai

# This would ideally come from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") 

class AIChatRequest(BaseModel):
    messages: List[dict]
    context_type: Optional[str] = "general"
    context_data: Optional[dict] = None

@app.post("/ai/chat")
def chat_with_ai(request: AIChatRequest):
    if not OPENAI_API_KEY:
        # Graceful fallback if no key provided yet
        return {"response": "I am currently running in offline mode as the AI API key has not been configured yet. Please configure the API key to enable full AI capabilities."}

    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        
        # System Prompt Construction
        system_content = "You are an expert assistant for the MIC Platform, a telecom circuit and deal management system."
        
        if request.context_data:
            system_content += f"\n\nCurrent Page Context ({request.context_type}):\n{json.dumps(request.context_data)}"
        
        messages = [{"role": "system", "content": system_content}] + request.messages
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        return {"response": response.choices[0].message.content}
    except Exception as e:
        print(f"AI Error: {e}")
        return {"response": "I encountered an error while processing your request. Please try again later."}

@app.get("/")
def read_root():
    return {"message": "Mic Platform API is running"}

@app.get("/health")
def health_check():
    try:
        conn = get_db_connection()
        # Ping test or simple query
        if conn.status == psycopg2.extensions.STATUS_READY:
            conn.close()
            return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# --- CIRCUITS ---

@app.get("/circuits")
def get_circuits():
    try:
        r = get_redis_connection()
        if r and r.exists("circuits_all"):
            print("Fetching circuits from cache")
            return json.loads(r.get("circuits_all"))

        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM circuits")
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if r:
            r.setex("circuits_all", 3600, json.dumps(results, default=json_serial))
            
        return results
    except Exception as e:
        # If cache fail, we still want to try DB or just fail if DB also fails
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/circuits")
def create_circuit(circuit: CircuitCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        data = circuit.dict()
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['%s'] * len(data))
        sql = f"INSERT INTO circuits ({columns}) VALUES ({placeholders})"
        
        cursor.execute(sql, list(data.values()))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        # Invalidate Cache
        r = get_redis_connection()
        if r:
            r.delete("circuits_all")
            
        return {"message": "Circuit created successfully", "id": circuit.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/circuits/{circuit_id}")
def update_circuit(circuit_id: str, circuit: CircuitCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        data = circuit.dict(exclude_unset=True)
        if not data:
             return {"message": "No data to update"}

        set_clause = ", ".join([f"{key} = %s" for key in data.keys()])
        values = list(data.values())
        values.append(circuit_id)
        
        sql = f"UPDATE circuits SET {set_clause} WHERE id = %s"
        
        cursor.execute(sql, values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        # Invalidate Cache
        r = get_redis_connection()
        if r:
            r.delete("circuits_all")
            
        return {"message": "Circuit updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/circuits/{circuit_id}")
def delete_circuit(circuit_id: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM circuits WHERE id = %s", (circuit_id,))
        conn.commit()
        cursor.close()
        conn.close()
        
        # Invalidate Cache
        r = get_redis_connection()
        if r:
            r.delete("circuits_all")
            
        return {"message": "Circuit deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- DEALS ---

@app.get("/deals")
def get_deals():
    try:
        r = get_redis_connection()
        if r and r.exists("deals_all"):
            print("Fetching deals from cache")
            return json.loads(r.get("deals_all"))

        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM deals")
        deals = cursor.fetchall()
        
        for deal in deals:
            cursor.execute("SELECT * FROM deal_notes WHERE deal_id = %s", (deal['id'],))
            deal['notes'] = cursor.fetchall()
            
        cursor.close()
        conn.close()
        
        if r:
            r.setex("deals_all", 3600, json.dumps(deals, default=json_serial))
            
        return deals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/deals")
def create_deal(deal: DealCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        data = deal.dict()
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['%s'] * len(data))
        sql = f"INSERT INTO deals ({columns}) VALUES ({placeholders})"
        
        cursor.execute(sql, list(data.values()))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        r = get_redis_connection()
        if r:
            r.delete("deals_all")
            
        return {"message": "Deal created successfully", "id": deal.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/deals/{deal_id}")
def update_deal(deal_id: str, deal: DealUpdate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        data = deal.dict(exclude_unset=True)
        if not data:
             return {"message": "No data to update"}

        set_clause = ", ".join([f"{key} = %s" for key in data.keys()])
        values = list(data.values())
        values.append(deal_id)
        
        sql = f"UPDATE deals SET {set_clause} WHERE id = %s"
        
        cursor.execute(sql, values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        r = get_redis_connection()
        if r:
            r.delete("deals_all")
            
        return {"message": "Deal updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/deals/{deal_id}")
def delete_deal(deal_id: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM deals WHERE id = %s", (deal_id,))
        conn.commit()
        cursor.close()
        conn.close()
        
        r = get_redis_connection()
        if r:
            r.delete("deals_all")
            
        return {"message": "Deal deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- NOTES ---

@app.post("/notes")
def add_note(note: NoteCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = "INSERT INTO deal_notes (id, deal_id, author, note_text) VALUES (%s, %s, %s, %s)"
        values = (note.id, note.deal_id, note.author, note.note_text)
        
        cursor.execute(sql, values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        # Invalidate Deals Cache because deals include notes
        r = get_redis_connection()
        if r:
            r.delete("deals_all")
            
        return {"message": "Note added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- MIC POM ---

@app.get("/mic-pom")
def get_mic_pom():
    try:
        r = get_redis_connection()
        if r and r.exists("mic_pom_all"):
            print("Fetching MIC POM from cache")
            return json.loads(r.get("mic_pom_all"))

        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM mic_pom_records")
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if r:
            r.setex("mic_pom_all", 3600, json.dumps(results, default=json_serial))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mic-pom")
def create_mic_pom(record: MicPomRecordCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        data = record.dict()
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['%s'] * len(data))
        sql = f"INSERT INTO mic_pom_records ({columns}) VALUES ({placeholders})"
        
        cursor.execute(sql, list(data.values()))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        # Invalidate Cache
        r = get_redis_connection()
        if r:
            r.delete("mic_pom_all")
            
        return {"message": "MIC POM record created successfully", "id": record.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- MATRIX SCANS ---

@app.post("/matrix/scan-results")
def save_scan_results(session: ScanSessionCreate):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert Session
        session_data = session.dict(exclude={'results'})
        cols = ', '.join(session_data.keys())
        vals = ', '.join(['%s'] * len(session_data))
        sql = f"INSERT INTO scan_sessions ({cols}) VALUES ({vals})"
        cursor.execute(sql, list(session_data.values()))
        
        # Insert Results
        for res in session.results:
            res_data = res.dict()
            r_cols = ', '.join(res_data.keys())
            r_vals = ', '.join(['%s'] * len(res_data))
            r_sql = f"INSERT INTO scan_results ({r_cols}) VALUES ({r_vals})"
            cursor.execute(r_sql, list(res_data.values()))
            
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Scan results saved successfully", "id": session.id}
    except Exception as e:
        if conn: conn.rollback()
        print(f"Error saving scan results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/circuits/bulk")
def bulk_create_circuits(circuits: List[CircuitCreate]):
    # ... existing implementation ...
    return {"message": f"Successfully processed {len(circuits)} circuits"}
    # ... existing error handling ...

# --- USER MANAGEMENT ---

@app.get("/users")
def get_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get Users
        cursor.execute("SELECT id, username, email, role, created_at FROM users")
        users = cursor.fetchall()
        
        # Get Permissions for each user
        for user in users:
            cursor.execute("SELECT resource, access_level FROM permissions WHERE user_id = %s", (user['id'],))
            user['permissions'] = cursor.fetchall()
            
        cursor.close()
        conn.close()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/users")
def create_user(user: UserCreate):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Create User
        # NOTE: Password hash is dummy for now since we don't have auth flow yet
        dummy_hash = "hashed_password" 
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, role) VALUES (%s, %s, %s, %s) RETURNING id",
            (user.username, user.email, dummy_hash, user.role)
        )
        user_id = cursor.fetchone()[0]
        
        # 2. Add Permissions
        for perm in user.permissions:
            cursor.execute(
                "INSERT INTO permissions (user_id, resource, access_level) VALUES (%s, %s, %s)",
                (user_id, perm.resource, perm.access_level)
            )
            
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "User created successfully", "id": user_id}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    # ... existing implementation ...
    return {"message": "User deleted successfully"}
    # ... existing error handling ...

# --- CHANGE MANAGEMENT ---

@app.get("/change-requests")
def get_change_requests():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM change_requests ORDER BY created_at DESC")
        requests = cursor.fetchall()
        cursor.close()
        conn.close()
        return requests
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/change-requests")
def create_change_request(
    data: str = Form(...),
    file: UploadFile = File(None)
):
    conn = None
    try:
        # 1. Parse JSON data
        try:
            json_data = json.loads(data)
            cr = ChangeRequestCreate(**json_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON data: {e}")

        # 2. Handle File Upload
        file_path = None
        if file:
            upload_dir = "uploads"
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)
            
            # Sanitize filename
            filename = f"{cr.id}_{file.filename}"
            file_path = os.path.join(upload_dir, filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            cr.inventory_file_path = file_path

        # 3. Insert into DB
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cr_data = cr.dict()
        columns = ', '.join(cr_data.keys())
        placeholders = ', '.join(['%s'] * len(cr_data))
        sql = f"INSERT INTO change_requests ({columns}) VALUES ({placeholders})"
        
        cursor.execute(sql, list(cr_data.values()))
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"message": "Change request submitted successfully", "id": cr.id}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/change-requests/{request_id}")
def update_change_request(request_id: str, update_data: dict = Body(...)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        status = update_data.get("status")
        status_notes = update_data.get("status_notes")
        
        cursor.execute(
            "UPDATE change_requests SET status = %s, status_notes = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (status, status_notes, request_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"message": "Change request updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- DASHBOARD & ANALYTICS ---

@app.get("/dashboard/stats")
def get_dashboard_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # 1. Pipeline Stages
        cursor.execute("""
            SELECT deal_status as name, COUNT(*) as value 
            FROM deals 
            WHERE deal_status IN ('Pipeline', 'Qualified', 'Proposed', 'Negotiating', 'Closed Won')
            GROUP BY deal_status
        """)
        pipeline_data = cursor.fetchall()
        
        # 2. Regional Sales (Total ACV by Country)
        cursor.execute("""
            SELECT country as name, SUM(mic_acv) as value 
            FROM deals 
            WHERE country IS NOT NULL 
            GROUP BY country 
            ORDER BY value DESC 
            LIMIT 5
        """)
        region_data = cursor.fetchall()
        
        # 3. Revenue Trend (Monthly aggregated from target_date_sales)
        # Using TO_CHAR to format date as Month/Year (e.g., 'Jan 2025')
        cursor.execute("""
            SELECT TO_CHAR(target_date_sales, 'Mon') as name, SUM(mic_acv) as value, SUM(mcn_mic_acv) as value2
            FROM deals 
            WHERE target_date_sales BETWEEN CURRENT_DATE - INTERVAL '6 months' AND CURRENT_DATE + INTERVAL '6 months'
            GROUP BY TO_CHAR(target_date_sales, 'Mon'), DATE_TRUNC('month', target_date_sales)
            ORDER BY DATE_TRUNC('month', target_date_sales)
        """)
        revenue_data = cursor.fetchall()
        
        # 4. Product/Service Mix (Approximated from request_type)
        cursor.execute("""
            SELECT request_type as name, COUNT(*) as value
            FROM deals
            WHERE request_type IS NOT NULL
            GROUP BY request_type
            ORDER BY value DESC
            LIMIT 5
        """)
        product_mix = cursor.fetchall()
        
        # 5. Top Metrics (Total Active Deals ACV)
        cursor.execute("""
            SELECT 
                COUNT(*) as total_deals,
                SUM(mic_acv) as total_acv,
                SUM(mcn_mic_acv) as total_tcv
            FROM deals
            WHERE deal_status != 'Closed Lost'
        """)
        summary_metrics = cursor.fetchone()

        cursor.close()
        conn.close()

        return {
            "pipeline": pipeline_data,
            "regional_sales": region_data,
            "revenue_trend": revenue_data,
            "product_mix": product_mix,
            "summary": summary_metrics
        }

    except Exception as e:
        print(f"Dashboard Stats Error: {e}")
        # Return fallback/empty structure on error for safety
        return {
            "pipeline": [], "regional_sales": [], "revenue_trend": [], "product_mix": [], "summary": {}
        }

# --- ACTIVE ONBOARD CIRCUITS ---

@app.get("/active-onboard-circuits")
def get_active_onboard_circuits():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM active_onboard_circuits")
        circuits = cursor.fetchall()
        cursor.close()
        conn.close()
        return circuits
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/active-onboard-circuits")
def create_active_onboard_circuit(circuit: ActiveOnboardCircuitCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        data = circuit.dict()
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['%s'] * len(data))
        sql = f"INSERT INTO active_onboard_circuits ({columns}) VALUES ({placeholders})"
        
        cursor.execute(sql, list(data.values()))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return {"message": "Active onboard circuit created successfully", "id": circuit.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/active-onboard-circuits/{circuit_id}")
def update_active_onboard_circuit(circuit_id: str, circuit: ActiveOnboardCircuitUpdate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        data = circuit.dict(exclude_unset=True)
        if not data:
             return {"message": "No data to update"}

        set_clause = ", ".join([f"{key} = %s" for key in data.keys()])
        values = list(data.values())
        values.append(circuit_id)
        
        sql = f"UPDATE active_onboard_circuits SET {set_clause} WHERE id = %s"
        
        cursor.execute(sql, values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return {"message": "Active onboard circuit updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/active-onboard-circuits/{circuit_id}")
def delete_active_onboard_circuit(circuit_id: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM active_onboard_circuits WHERE id = %s", (circuit_id,))
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"message": "Active onboard circuit deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/active-onboard-circuits/bulk")
def bulk_create_active_onboard_circuits(circuits: List[ActiveOnboardCircuitCreate]):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        count = 0
        for circuit in circuits:
            data = circuit.dict()
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            sql = f"INSERT INTO active_onboard_circuits ({columns}) VALUES ({placeholders}) ON CONFLICT (id) DO NOTHING"
            cursor.execute(sql, list(data.values()))
            count += 1
            
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"message": f"Successfully processed {count} records"}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
