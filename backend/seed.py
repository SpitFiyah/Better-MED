from sqlmodel import Session, select
from database import create_db_and_tables, engine
from models import User, Batch
from auth_utils import get_password_hash
from datetime import datetime, timedelta

def seed_data():
    create_db_and_tables()
    with Session(engine) as session:
        # 1. Check if users exist
        user = session.exec(select(User).where(User.email == "admin@medicinna.app")).first()
        if not user:
            print("Creating default admin user...")
            admin_user = User(
                email="admin@medicinna.app",
                hashed_password=get_password_hash("admin123"),
                hospital_name="General Hospital",
                role="admin"
            )
            session.add(admin_user)
        
        # 2. Create Batches
        # Clear existing batches to ensure fresh demo data? No, just check if they exist.
        
        demo_batches = [
            Batch(batch_id="MED-2025-001", medicine_name="Paracetamol 500mg", manufacturer="PharmaCorp", expiry_date="2026-12-31", purity=99.9, is_recalled=False),
            Batch(batch_id="EXP-2023-999", medicine_name="Aspirin 100mg", manufacturer="OldMeds Inc", expiry_date="2023-01-01", purity=98.0, is_recalled=False),
            Batch(batch_id="REC-2025-BAD", medicine_name="Cough Syrup", manufacturer="BadBatch Ltd", expiry_date="2025-06-01", purity=95.0, is_recalled=True),
            Batch(batch_id="LOW-2025-PUR", medicine_name="Antibiotic X", manufacturer="CheapMeds", expiry_date="2025-12-31", purity=85.0, is_recalled=False),
        ]

        for batch in demo_batches:
            existing = session.exec(select(Batch).where(Batch.batch_id == batch.batch_id)).first()
            if not existing:
                print(f"Creating batch {batch.batch_id}...")
                session.add(batch)
        
        session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
