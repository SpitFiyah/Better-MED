from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from database import create_db_and_tables, get_session
from models import User, Batch, ScanLog
from auth_utils import verify_password, get_password_hash, create_access_token
from pydantic import BaseModel
from datetime import datetime
import requests
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    hospital_name: str
    role: str = "hospital"

class VerifyRequest(BaseModel):
    batch_code: str

# Routes

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.post("/auth/login")
def login(request: LoginRequest, session: Session = Depends(get_session)):
    # Normalize email
    email = request.username if "@" in request.username else f"{request.username}@medicinna.app"
    user = session.exec(select(User).where(User.email == email)).first()
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "token": access_token,
        "role": user.role,
        "username": user.email
    }

@app.post("/auth/register")
def register(request: RegisterRequest, session: Session = Depends(get_session)):
    email = request.username if "@" in request.username else f"{request.username}@medicinna.app"
    existing = session.exec(select(User).where(User.email == email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    new_user = User(
        email=email,
        hashed_password=get_password_hash(request.password),
        hospital_name=request.hospital_name,
        role=request.role
    )
    session.add(new_user)
    session.commit()
    return {"message": "User created successfully"}

@app.post("/verify")
def verify_batch(request: VerifyRequest, session: Session = Depends(get_session)):
    code = request.batch_code
    batch = session.exec(select(Batch).where(Batch.batch_id == code)).first()
    
    status_code = "FAKE"
    details = "Batch not found in manufacturer database."
    medicine_info = None
    
    if batch:
        medicine_info = batch
        expiry = datetime.strptime(batch.expiry_date, "%Y-%m-%d")
        now = datetime.now()
        
        if batch.is_recalled:
            status_code = "RECALLED"
            details = "WARNING: This batch has been recalled!"
        elif expiry < now:
            status_code = "EXPIRED"
            details = f"Expired on {batch.expiry_date}"
        elif batch.purity < 90.0:
            status_code = "SUBSTANDARD"
            details = f"Purity level ({batch.purity}%) is unsafe."
        else:
            status_code = "VALID"
            details = "Batch is authentic and safe."
            
    # Log the scan (Anonymous for now, or extract user from token if needed)
    log = ScanLog(batch_id=code, status=status_code, scanned_by="api_user")
    session.add(log)
    session.commit()
    
    return {"status": status_code, "details": details, "data": medicine_info}

@app.get("/stats")
def get_stats(session: Session = Depends(get_session)):
    logs = session.exec(select(ScanLog)).all()
    total = len(logs)
    fake = len([l for l in logs if l.status == "FAKE"])
    return {"total": total, "fake": fake}

@app.get("/history")
def get_history(session: Session = Depends(get_session)):
    logs = session.exec(select(ScanLog).order_by(ScanLog.timestamp.desc()).limit(50)).all()
    return logs

@app.post("/scan/ai")
async def ai_scan(file: UploadFile = File(...)):
    # Proxy to Roboflow
    API_KEY = "cAtDjSsmRF18IIPgugys" # Should be env var
    MODEL_ID = "barcodes-zmxjq/4"
    upload_url = f"https://detect.roboflow.com/{MODEL_ID}?api_key={API_KEY}&confidence=40&overlap=30&format=json"
    
    try:
        content = await file.read()
        response = requests.post(
            upload_url,
            files={"file": content},
        )
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
