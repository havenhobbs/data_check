"""
Generates a clean, consistent synthetic dataset of patients, providers, and encounters. Nothing here should ever fail validation. 

We will corrupt a copy of this dataset separately so that we will always know exactly what SHOULD be flagged.

This is to ensure that our validator catches everything it should and nothing it shouldn't.
"""

import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

from faker import Faker

fake = Faker()
Faker.seed(42)
random.seed(42)

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

DEPARTMENTS = ["Cardiology", "Orthopedics", "Primary Care", "Radiology", "Oncology", "Pediatrics"]
ENCOUNTER_TYPES = ["New Patient", "Follow-Up", "Telehealth", "Surgery", "Annual Physical"]
STATUSES = ["Scheduled", "Completed", "Cancelled", "No-Show"]

N_PATIENTS = 400
N_PROVIDERS = 25
N_ENCOUNTERS = 1500

def generate_patients(n):
    patients = []
    for i in range(1, n + 1):
        dob = fake.date_of_birth(minimum_age=1, maximum_age=102)
        patients.append({
            "patient_id": i,
            "mrn": f"MRN{10000 + i}",
            "first_name": fake.first_name(),
            "last_name": fake.last_name(),
            "dob": dob.isoformat(),
            "gender": random.choice(["F", "M"]),
        })
        
    return patients

def generate_providers(n, np_ratio=0.45):
    providers = []
    for i in range(1, n + 1):
        if random.random() < np_ratio:
            title = "NP"
            name = f"{fake.last_name()}, NP"
        else: 
            title = "MD"
            name = f"Dr. {fake.last_name()}"
            
        providers.append({
            "provider_id": i,
            "name": name,
            "title": title,
            "department": random.choice(DEPARTMENTS),
        })
        
    return providers

def generate_encounters(n, patients, providers):
    encounters = []
    provider_by_id = {p["provider_id"]: p for p in providers}
    
    for i in range(1, n + 1):
        patient = random.choice(patients)
        provider = random.choice(providers)
        dob = datetime.fromisoformat(patient["dob"])
        
        #Scheduled datetime must be after the pts birth and within a realistic window.
        earliest = max(dob, datetime.now() - timedelta(days=730))
        days_range = max((datetime.now() + timedelta(days=60) - earliest).days, 1)
        scheduled = earliest + timedelta(days=random.randint(0, days_range))
        
        status = random.choice(STATUSES)
        
        #A Completed encounter cannot be in the future.
        if status == "Completed" and scheduled > datetime.now():
            scheduled = datetime.now() - timedelta(days=random.randint(1, 300))
            
        #Keeping clean_data consistent, an NP will not be assigned "Surgery" encounter.
        encounter_type_options = ENCOUNTER_TYPES
        if provider["title"] == "NP":
            encounter_type_options = [t for t in ENCOUNTER_TYPES if t != "Surgery"]
            
        encounters.append({
            "encounter_id": i,
            "patient_id": patient["patient_id"],
            "provider_id": provider["provider_id"],
            "scheduled_datetime": scheduled.isoformat(),
            "encounter_type": random.choice(encounter_type_options),
            "status": status,
            "department": provider_by_id[provider["provider_id"]]["department"],
        })
            
    return encounters
    
def write_csv(rows, filename, fieldnames):
    path = DATA_DIR / filename
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"wrote {len(rows)} rows to {path}")
    
if __name__ == "__main__":
    patients = generate_patients(N_PATIENTS)
    providers = generate_providers(N_PROVIDERS)
    encounters = generate_encounters(N_ENCOUNTERS, patients, providers)
    
    write_csv(patients, "patients_clean.csv", ["patient_id", "mrn", "first_name", "last_name", "dob", "gender"])
    write_csv(providers, "providers_clean.csv", ["provider_id", "name", "title", "department"])
    write_csv(encounters, "encounters_clean.csv", ["encounter_id", "patient_id", "provider_id", "scheduled_datetime", "encounter_type", "status", "department"])