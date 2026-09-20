"""
This takes the clean dataset and produces a corrupted version.
There is a fixed number of each error type.
Because we created our "answer key", we know which record has which error.
This was done to accurately assess the validator's effectiveness.
"""

import csv
import random
from pathlib import Path
from datetime import datetime, timedelta

DATA_DIR = Path (__file__). parent.parent / "data"
random.seed(7)

ERROR_COUNTS = {
    "duplicate_encounter": 25,
    "orphaned_patient_fk": 20,
    "orphaned_provider_fk": 15,
    "invalid_enum": 30,
    "missing_required_field": 25,
    "date_logic_violation": 20,
    "department_mismatch": 20,
    "duplicate_mrn": 10,
    "np_scope_mismatch": 15,
}

def load_csv(filename):
    with open(DATA_DIR / filename, newline="") as f:
        return list(csv.DictReader(f))
    
def write_csv(rows, filename, fieldnames):
    path = DATA_DIR / filename
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {path}")
    
def main():
    patients = load_csv("patients_clean.csv")
    providers = load_csv("providers_clean.csv")
    encounters = load_csv("encounters_clean.csv")
    
    ground_truth = []
    next_encounter_id = max(int(e["encounter_id"]) for e in encounters) + 1
    
    #While real-world data can have multiple errors on one record, for simplicity, we are deliberately tracking a isolated errors.
    corrupted_encounter_ids = set()
    
    #1. Duplicate Encounters
    for _ in range(ERROR_COUNTS["duplicate_encounter"]):
        original = random.choice(encounters)
        dup = dict(original)
        dup["encounter_id"] = str(next_encounter_id)
        encounters.append(dup)
        ground_truth.append(("encounter", dup["encounter_id"], "duplicate_encounter"))
        
        #protect both copies
        corrupted_encounter_ids.add(dup["encounter_id"])
        corrupted_encounter_ids.add(original["encounter_id"])
        next_encounter_id += 1
        
    def pick_targets(count):
        """Encounters that haven't been corrupted yet, but get marked as corrupted so later steps skip them.
        """
        available = [e for e in encounters if e["encounter_id"] not in corrupted_encounter_ids]
        chosen = random.sample(available, min(count, len(available)))
        for enc in chosen:
            corrupted_encounter_ids.add(enc["encounter_id"])
        return chosen
    
    #2. Orphaned Patient -> point an encounter at a patient_id that doesn't exist
    max_patient_id = max(int(p["patient_id"]) for p in patients)
    for enc in pick_targets(ERROR_COUNTS["orphaned_patient_fk"]):
        enc["patient_id"] = str(max_patient_id + random.randint(1000, 9999))
        ground_truth.append(("encounter", enc["encounter_id"], "orphaned_patient_fk"))
        
    #3. Orphaned Provider -> point an encounter at a provider_id that doesn't exist
    max_provider_id = max(int(p["provider_id"]) for p in providers)
    for enc in pick_targets(ERROR_COUNTS["orphaned_provider_fk"]):
        enc["provider_id"] = str(max_provider_id + random.randint(1000, 9999))
        ground_truth.append(("encounter", enc["encounter_id"], "orphaned_provider_fk"))
        
    #4. Invalid Enum - set encounter_type or status to a nonsense value
    for enc in pick_targets(ERROR_COUNTS["invalid_enum"]):
        if random.random() < 0.5:
            enc["encounter_type"] = "Unknown Type X"
        else:
            enc["status"] = "PENDING_REVIEW"
        ground_truth.append(("encounter", enc["encounter_id"], "invalid_enum"))
        
    #5. Missing Required Field -> blank out mrn critical fields
    for enc in pick_targets(ERROR_COUNTS["missing_required_field"]):
        field = random.choice(["patient_id", "scheduled_datetime"])
        enc[field] = ""
        ground_truth.append(("encounter", enc["encounter_id"], "missing_required_field"))
        
    #6. Date Logic Violation -> schedule a "Completed" encounter in the future or before dob
    patients_by_id = {p["patient_id"]: p for p in patients}
    for enc in pick_targets(ERROR_COUNTS["date_logic_violation"]):
        if random.random() < 0.5:
            enc["status"] = "Completed"
            future = datetime.now() + timedelta(days=random.randint(5, 60))
            enc["scheduled_datetime"] = future.isoformat()
        else:
            patient = patients_by_id.get(enc["patient_id"])
            if patient:
                dob = datetime.fromisoformat(patient["dob"])
                before_birth = dob - timedelta(days=random.randint(30, 400))
                enc["scheduled_datetime"] = before_birth.isoformat()
        ground_truth.append(("encounter", enc["encounter_id"], "date_logic_violation"))
        
    #7. Department Mismatch -> set encounter department different from provider's assigned department
    providers_by_id = {p["provider_id"]: p for p in providers}
    all_depts = list({p["department"] for p in providers})
    for enc in pick_targets(ERROR_COUNTS["department_mismatch"]):
        provider = providers_by_id.get(enc["provider_id"])
        if provider:
            wrong_depts = [d for d in all_depts if d != provider["department"]]
            enc["department"] = random.choice(wrong_depts)
        ground_truth.append(("encounter", enc["encounter_id"], "department_mismatch"))
        
    #8. NP Scope Mismatch -> assign an NP a "Surgery" encounter
    np_provider_ids = {p["provider_id"] for p in providers if p.get("title") == "NP"}
    np_encounters = [
        e for e in encounters
        if e["encounter_id"] not in corrupted_encounter_ids and e["provider_id"] in np_provider_ids
    ]
    chosen = random.sample(np_encounters, min(ERROR_COUNTS["np_scope_mismatch"], len(np_encounters)))
    for enc in chosen:
        corrupted_encounter_ids.add(enc["encounter_id"])
        enc["encounter_type"] = "Surgery"
        ground_truth.append(("encounter", enc["encounter_id"], "np_scope_mismatch"))
        
    #9. Duplicate MRN -> give two patients the same MRN
    dup_patients = random.sample(patients, ERROR_COUNTS["duplicate_mrn"] * 2)
    for i in range(0, len(dup_patients), 2):
        shared_mrn = dup_patients[i]["mrn"]
        dup_patients[i + 1]["mrn"] = shared_mrn
        #flag both records since context is required to see which was "original"
        ground_truth.append(("patient", dup_patients[i]["patient_id"], "duplicate_mrn"))
        ground_truth.append(("patient", dup_patients[i + 1]["patient_id"], "duplicate_mrn"))
        
    write_csv(patients, "patients_dirty.csv", ["patient_id", "mrn", "first_name", "last_name", "dob", "gender"])
    write_csv(providers, "providers_dirty.csv", ["provider_id", "name", "title", "department"])
    write_csv(encounters, "encounters_dirty.csv", ["encounter_id", "patient_id", "provider_id", "scheduled_datetime", "encounter_type", "status", "department"])
    
    with open(DATA_DIR / "ground_truth_errors.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["record_type", "record_id", "error_type"])
        writer.writerows(ground_truth)
        
    print(f"wrote {len(ground_truth)} ground-truth errors to ground_truth_errors.csv")

if __name__ == "__main__":
    main()