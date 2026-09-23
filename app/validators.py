"""
Each function scans the database and returns a list of flagged issues. 

Independent functions allow the ability to add/alter functions as a database changes, and shows where errors are coming from.
"""

from datetime import datetime
from collections import defaultdict

from models import get_engine, get_session, Patient, Provider, Encounter

VALID_ENCOUNTER_TYPES = {"New Patient", "Follow-Up", "Telehealth", "Procedure", "Surgery", "Annual Physical"}
VALID_STATUSES = {"Scheduled", "Completed", "Cancelled", "No-Show"}

def check_orphaned_patient_fk(session):
    valid_ids = {p.patient_id for p in session.query(Patient.patient_id).all()}
    issues = []
    for enc in session.query(Encounter).all():
        if enc.patient_id is not None and enc.patient_id not in valid_ids:
            issues.append({
                "record_type": "encounter", "record_id": enc.encounter_id,
                "error_type": "orphaned_patient_fk",
                "detail": f"patient_id {enc.patient_id} does not exist"
            })
    return issues
    
def check_orphaned_provider_fk(session):
    valid_ids = {p.provider_id for p in session.query(Provider.provider_id).all()}
    issues = []
    for enc in session.query(Encounter).all():
        if enc.provider_id is not None and enc.provider_id not in valid_ids:
            issues.append({
                "record_type": "encounter", "record_id": enc.encounter_id,
                "error_type": "orphaned_provider_fk",
                "detail": f"provider_id {enc.provider_id} does not exist"
            })
    return issues
    
def check_invalid_enum(session):
    issues = []
    for enc in session.query(Encounter).all():
        if enc.encounter_type and enc.encounter_type not in VALID_ENCOUNTER_TYPES:
            issues.append({
                "record_type": "encounter", "record_id": enc.encounter_id,
                "error_type": "invalid_enum",
                "detail": f"encounter_type '{enc.encounter_type}' is not a recognized value"
            })
        if enc.status and enc.status not in VALID_STATUSES:
            issues.append({
                "record_type": "encounter", "record_id": enc.encounter_id,
                "error_type": "invalid_enum",
                "detail": f"status '{enc.status}' is not a recognized value"
            })
    return issues
    
def check_missing_required_field(session):
    issues = []
    for enc in session.query(Encounter).all():
        if enc.patient_id is None:
            issues.append({
                "record_type": "encounter", "record_id": enc.encounter_id,
                "error_type": "missing_required_field", "detail": "patient_id is missing"
            })
        if enc.scheduled_datetime is None:
            issues.append({
                "record_type": "encounter", "record_id": enc.encounter_id,
                "error_type": "missing_required_field", "detail": "scheduled_datetime is missing"
            })    
        
    return issues
    
def check_date_logic(session):
    issues = []
    patients_by_id = {p.patient_id: p for p in session.query(Patient).all()}
    now = datetime.now()
    for enc in session.query(Encounter).all():
        if enc.scheduled_datetime is None:
            continue
        if enc.status == "Completed" and enc.scheduled_datetime > now:
            issues.append({
                "record_type": "encounter", "record_id": enc.encounter_id,
                "error_type": "date_logic_violation",
                "detail": "Status is Completed but scheduled_datetime is in the future"
            })
            
        patient = patients_by_id.get(enc.patient_id)
        if patient and enc.scheduled_datetime < patient.dob:
            issues.append({
                "record_type": "encounter", "record_id": enc.encounter_id,
                "error_type": "date_logic_violation",
                "detail": "scheduled_datetime is before the patient's date of birth"
            })
        
    return issues
    
def check_department_mismatch(session):
    issues = []
    providers_by_id = {p.provider_id: p for p in session.query(Provider).all()}
    for enc in session.query(Encounter).all():
        provider = providers_by_id.get(enc.provider_id)
        if provider and enc.department and enc.department != provider.department:
            issues.append({
                "record_type": "encounter", "record_id": enc.encounter_id,
                "error_type": "department_mismatch",
                "detail": f"encounter department '{enc.department}' does not match " f"provider's department '{provider.department}'"
            })
    return issues
    
def check_duplicate_mrn(session):
    issues = []
    mrn_map = defaultdict(list)
    for p in session.query(Patient).all():
        mrn_map[p.mrn].append(p.patient_id)
    for mrn, ids in mrn_map.items():
        if len(ids) > 1:
            for pid in ids:
                issues.append({
                    "record_type": "patient", "record_id": pid,
                    "error_type": "duplicate_mrn",
                    "detail": f"MRN {mrn} is shared with patient_id(s) {[i for i in ids if i != pid]}"
                })
    return issues
        
def check_duplicate_encounter(session):
    issues = []
    seen = {}
    for enc in session.query(Encounter).order_by(Encounter.encounter_id).all():
        key = (enc.patient_id, enc.provider_id, enc.scheduled_datetime)
        if key in seen:
            issues.append({
                "record_type": "encounter", "record_id": enc.encounter_id,
                "error_type": "duplicate_encounter",
                "detail": f"duplicates encounter_id {seen[key]} (same patient, provider, time)"
            })
        else: 
            seen[key] = enc.encounter_id
    return issues

def check_np_scope_mismatch(session):
    """
    This scope is intentionally simplified for this project.
    """
    issues = []
    providers_by_id = {p.provider_id: p for p in session.query(Provider).all()}
    for enc in session.query(Encounter).all():
        provider = providers_by_id.get(enc.provider_id)
        if provider and provider.title == "NP" and enc.encounter_type == "Surgery":
            issues.append({
                "record_type": "encounter", "record_id": enc.encounter_id,
                "error_type": "np_scope_mismatch",
                "detail": f"NP provider {provider.name} assigned a Surgery encounter"
            })
    return issues

ALL_CHECKS = [
    check_orphaned_patient_fk,
    check_orphaned_provider_fk,
    check_invalid_enum,
    check_missing_required_field,
    check_date_logic,
    check_department_mismatch,
    check_duplicate_mrn,
    check_duplicate_encounter,
    check_np_scope_mismatch
]

def run_all_checks(session=None):
    own_session = session is None
    if own_session:
        engine = get_engine()
        session = get_session(engine)
        
    all_issues = []
    for check in ALL_CHECKS:
        all_issues.extend(check(session))
        
    if own_session:
        session.close()
    return all_issues