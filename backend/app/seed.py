"""
Loads backend/app/seed_data/schemes.json into the `schemes` table.
Safe to re-run: upserts by scheme_id instead of duplicating rows.

Usage:
    python -m app.seed
"""

import json
from datetime import date
from pathlib import Path

from .database import Base, engine, SessionLocal
from .models import Scheme

SEED_FILE = Path(__file__).parent / "seed_data" / "schemes.json"


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        records = json.loads(SEED_FILE.read_text())
        for record in records:
            existing = db.query(Scheme).filter_by(scheme_id=record["scheme_id"]).first()
            last_verified = date.fromisoformat(record["last_verified"]) if record.get("last_verified") else None

            if existing:
                for key, value in record.items():
                    if key == "last_verified":
                        value = last_verified
                    setattr(existing, key, value)
            else:
                data = {**record, "last_verified": last_verified}
                db.add(Scheme(**data))

        db.commit()
        count = db.query(Scheme).count()
        print(f"Seeded/updated schemes. Total schemes in DB: {count}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
