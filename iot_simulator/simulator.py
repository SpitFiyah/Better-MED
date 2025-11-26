import time
import random
import requests

API_URL = "http://localhost:8000"

INPUT_DEVICES = [
    {"id": "SCANNER-001", "type": "barcode", "location": "Warehouse A"},
    {"id": "SCANNER-002", "type": "barcode", "location": "Pharmacy Dispatch"},
    {"id": "OCR-CAM-01", "type": "ocr", "location": "Quality Control"},
    {"id": "OCR-CAM-02", "type": "ocr", "location": "Returns Dept"},
]

def generate_scan_event():
    """Simulates a scan from a barcode scanner or OCR camera"""
    device = random.choice(INPUT_DEVICES)
    
    demo_batches = ["MED-2025-001", "EXP-2023-999", "REC-2025-BAD", "LOW-2025-PUR", "FAKE-" + str(random.randint(100, 999))]
    batch_code = random.choice(demo_batches)

    return batch_code, device['type'], device['id']

def run_simulator():
    print(f"Starting IoT Simulator (Target: {API_URL})...")
    print("Press Ctrl+C to stop.")
    
    while True:
        try:
            batch_code, device_type, device_id = generate_scan_event()
            print(f"[{device_type.upper()}] Device {device_id} scanning {batch_code}...")
            
            # Send to Backend
            response = requests.post(f"{API_URL}/verify", json={"batch_code": batch_code})
            
            if response.status_code == 200:
                result = response.json()
                print(f" -> Result: {result['status']} ({result['details']})")
            else:
                print(f" -> Error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f" -> An error occurred: {e}")
            
        time.sleep(random.uniform(2.0, 5.0))

if __name__ == "__main__":
    run_simulator()