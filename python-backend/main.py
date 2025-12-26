from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection, get_redis_connection
import psycopg2
from psycopg2.extras import RealDictCursor
from models import DealCreate, DealUpdate, CircuitCreate, MicPomRecordCreate, NoteCreate
from typing import List
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
