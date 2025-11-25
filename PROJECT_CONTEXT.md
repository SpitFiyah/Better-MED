# Medical Verification Platform (Software-Only)

## Project Overview
**Problem:** Hospitals lack a reliable, real-time way to verify the quality of medicines and consumables, leading to delayed detection of substandard supplies.
**Solution:** A digital verification platform that allows hospital staff to verify medicine authenticity by checking Batch IDs against a central manufacturer database. This solution requires **no hardware**.

## Architecture
The system consists of two main components:

### 1. Backend (Core Engine)
- **Technology:** Python, **Flask**, **SQLite**.
- **Responsibilities:**
    - Store Manufacturer Data (Batch IDs, Expiry Dates, Recall Status).
    - **Verification Engine:** Checks input Batch IDs against the database.
    - Serve API endpoints for the Dashboard.

### 2. Frontend (Dashboard)
- **Technology:** **React**, **Vite**, **Tailwind CSS**.
- **Responsibilities:**
    - **Verification UI:** Input field for manual Batch ID entry.
    - **Status Display:** Instant feedback (Valid, Expired, Recalled, Counterfeit).
    - **History & Stats:** Log of recent verifications and aggregate statistics.

## Technical Path & Tasks
1.  **Initialize Project Structure:** Setup folders for backend and frontend.
2.  **Setup Backend:** Configure **Flask** and **SQLite** models (`Batch`, `VerificationLog`).
3.  **Implement Verification Logic:** Logic to check `batch_code` against database records.
4.  **Setup Frontend:** Initialize React app with Tailwind CSS.
5.  **Build Verification UI:** Input form and result display components.
6.  **Build Dashboard Stats:** Overview of total scans and issue rates.
7.  **Integration:** Connect Frontend to Flask API.

## Data Flow
1.  **User** enters a Batch ID (e.g., `MED-2025-001`) in the Frontend.
2.  **Backend** receives the ID, queries the SQLite database.
3.  **Logic:**
    - If not found -> **FAKE**
    - If found but `is_recalled` is True -> **RECALLED**
    - If found but `expiry_date` < Today -> **EXPIRED**
    - If found but `purity_level` < 90.0 -> **SUBSTANDARD**
    - Otherwise -> **VALID**
4.  **Frontend** displays the result and details (Manufacturer, Medicine Name).

## Current Features (Updated)
- **Design System (New):**
    - **Style:** Neubrutalism (High contrast, bold borders, hard shadows).
    - **Palette:** `#B8FF9F` (Green), `#FF9F9F` (Red), `#FEF3C7` (Yellow), `#E8E8E8` (Background).
    - **Components:** Custom `neu-card`, `neu-btn`, `neu-input` utility classes.
- **Enhanced Login Page:**
    - **Split Layout:** Login form + Statistics Dashboard.
    - **Data Visualization:** Integrated `recharts` to show WHO statistics on fake medicines (Fatalities, Economic Cost).
    - **Real-World Data:** Displays impact metrics (169k Pneumonia deaths, $30.5B cost).
- **Multi-Mode Input:**
    - **Manual Entry:** Type Batch ID.
    - **Barcode Scanner:** Uses device camera to scan codes (Simulated fallback).
    - **OCR:** Upload image to extract text (Simulated).
- **Quality Checks:** Now includes **Purity Level** analysis.
- **IoT Simulator:** Python script to simulate high-volume scans from warehouse devices.

## Mobile App (New)
The project now includes a **Capacitor** wrapper, allowing the React frontend to run as a native mobile app (Android/iOS).
- **Framework:** Capacitor (wraps the `dist` folder).
- **Platforms:** Android (configured), iOS (ready to configure).
- **Setup:**
    1.  Build the frontend: `npm run build`
    2.  Sync changes: `npx cap sync`
    3.  **Build APK (Manual):**
        - Install JDK 21 and Android Studio.
        - Run: `cd android; .\gradlew.bat assembleDebug`
        - APK Location: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## Roadmap & Next Steps (Pre-Deployment)
1.  **Test Mobile App:** Install APK on device, ensure connectivity with local backend.
2.  **Manufacturer Portal (Demo Loop):** Add a feature to *create* batches and generate QR codes. This allows a full "Create -> Scan -> Verify" demo.
3.  **Live Simulation:** Run `iot_simulator` to populate dashboards with real-time data for the presentation.
4.  **Connectivity:** Consider using **ngrok** to expose the backend publicly, avoiding local IP issues during the demo.

## How to Run
### 1. Start Backend
```bash
cd backend
python app.py
# Runs on http://localhost:5001
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### 3. (Optional) Run Simulator
```bash
cd iot_simulator
python simulator.py
# Generates traffic to the backend
```
