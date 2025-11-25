import time
import random
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://wnhefxzyybvquuepuleo.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduaGVmeHp5eWJ2cXV1ZXB1bGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNzkwNzksImV4cCI6MjA3OTY1NTA3OX0.RAQDocBYugTe0u9S7L60caBQK5F32gvCybvP1Yu5RwA")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

MEDICINES = [
    {"name": "Aspirin-500mg", "base_purity": 100.0, "base_ph": 5.0},
    {"name": "Paracetamol-650mg", "base_purity": 99.5, "base_ph": 6.0},
    {"name": "Amoxicillin-250mg", "base_purity": 98.0, "base_ph": 4.5},
    {"name": "Ibuprofen-400mg", "base_purity": 99.0, "base_ph": 6.5},
]

SUPPLIERS = ["PharmaCorp", "MediSupply Ltd", "GlobalHealth Inc", "BioTech Solutions"]

INPUT_DEVICES = [
    {"id": "SCANNER-001", "type": "barcode", "location": "Warehouse A"},
    {"id": "SCANNER-002", "type": "barcode", "location": "Pharmacy Dispatch"},
    {"id": "OCR-CAM-01", "type": "ocr", "location": "Quality Control"},
    {"id": "OCR-CAM-02", "type": "ocr", "location": "Returns Dept"},
]

def get_batch_status(batch_code):
    """Determines the status of a batch based on its code."""
    if "EXP" in batch_code:
        return "EXPIRED"
    if "REC" in batch_code:
        return "RECALLED"
    if "LOW" in batch_code:
        return "SUBSTANDARD"
    if "FAKE" in batch_code:
        return "FAKE"
    return "VALID"


def generate_scan_event():
    """Simulates a scan from a barcode scanner or OCR camera"""
    device = random.choice(INPUT_DEVICES)
    
    demo_batches = ["MED-2025-001", "EXP-2023-999", "REC-2025-BAD", "LOW-2025-PUR", "FAKE-" + str(random.randint(100, 999))]
    batch_code = random.choice(demo_batches)
    status = get_batch_status(batch_code)

    payload = {
        "batch_id": batch_code,
        "status": status,
        "scanned_by": f"device:{device['id']}",
        # 'timestamp' is now handled by Supabase with `now()`
    }
    
    return payload, device['type'], device['id']

def run_simulator():
    print(f"Starting IoT Simulator (Target: Supabase)...")
    print("Press Ctrl+C to stop.")
    
    while True:
        try:
            event, device_type, device_id = generate_scan_event()
            print(f"[{device_type.upper()}] Device {device_id} scanned {event['batch_id']}")
            
            # Insert data into Supabase
            data, count = supabase.table('scan_logs').insert(event).execute()
            
            # The response from Supabase is a tuple (data, count)
            # We check if the data list is not empty
            if data and len(data[1]) > 0:
                result = data[1][0]
                print(f" -> Logged to Supabase: {result.get('status')}")
            else:
                # Handle potential errors, e.g., from RLS policies
                print(f" -> Error: Failed to insert into Supabase. Response: {data}")
                
        except Exception as e:
            print(f" -> An error occurred: {e}")
            
        time.sleep(random.uniform(2.0, 5.0))

if __name__ == "__main__":
    run_simulator()