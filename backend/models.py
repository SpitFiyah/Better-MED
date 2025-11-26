from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    hospital_name: str
    role: str = "hospital"

class Batch(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    batch_id: str = Field(index=True, unique=True)
    medicine_name: str
    manufacturer: str
    expiry_date: str  # ISO format YYYY-MM-DD
    purity: float
    is_recalled: bool = False
    
class ScanLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    batch_id: str
    status: str
    scanned_by: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
