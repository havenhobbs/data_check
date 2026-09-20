"""
Reads the dirty CSV files inot the database via our models.
"""

import csv
from datetime import datetime
from pathlib import Path

from models import get_engine, init_db, get_session, Patient, Provider, Encounter

DATA_DIR = Path(__file__).parent.parent / "data"

def parse_dt(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None
    
def load():
    engine = get_engine()
    init_db(engine)
    session = get_session(engine)
    
    #clear existing data to safely re-run
    session.query(Encounter).delete()
    session.query(Provider).delete()
    session.query(Patient).delete()
    session.commit()
    
    with open(DATA_DIR / "patients_dirty.csv", newline="") as f:
        for row in csv.DictReader(f):
            session.add(Patient(
                patient_id=int(row["patient_id"]),
                mrn=row["mrn"],
                first_name=row["first_name"],
                last_name=row["last_name"],
                dob=parse_dt(row["dob"]),
                gender=row["gender"],
            ))
    session.commit()
    print("loaded patients")
    
    with open(DATA_DIR / "providers_dirty.csv", newline="") as f:
        for row in csv.DictReader(f):
            session.add(Provider(
                provider_id=int(row["provider_id"]),
                name=row["name"],
                title=row.get("title"),
                department=row["department"],
            ))
    session.commit()
    print("loaded providers")
    
    with open(DATA_DIR / "encounters_dirty.csv", newline="") as f:
        for row in csv.DictReader(f):
            session.add(Encounter(
                encounter_id=int(row["encounter_id"]),
                patient_id=int(row["patient_id"]) if row ["patient_id"] else None,
                provider_id=int(row["provider_id"]) if row ["provider_id"] else None,
                scheduled_datetime=parse_dt(row["scheduled_datetime"]),
                encounter_type=row["encounter_type"],
                status=row["status"],
                department=row["department"],
            ))
    session.commit()
    print("loaded encounters")
    
    session.close()
    
if __name__ == "__main__":
    load()