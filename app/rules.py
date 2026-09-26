RULE_CATALOG = {
    "orphaned_patient_fk":{
        "name": "Orphaned patient reference",
        "dimension": "referential_integrity",
        "severity": "high",
        "source_tables": ["encounters", "patients"],
        "fields": ["encounters.patient_id", "patients.patient_id"],
        "why_it_matters": (
            "An encounter cannot be reliably attributed to a valid patient."
            
        ),
        "recommended_action": (
            "Verify the patient identifier in the source extract and reconcile the encounter with the patient master."
        ),
        
    },
    "orphaned_provider_fk": {
        "name": "Orphaned provider reference",
        "dimension": "referential_integrity",
        "severity": "high",
        "source_tables": ["encounters", "providers"],
        "fields": ["encounters.provider_id", "providers.provider_id"],
        "why_it_matters": (
            "Provider attribution and operational reporting may be inaccurate."
        ),
        "recommended_action": (
            "Validate the provider identifier against the provider master extract."
        ),
    },
    "missing_required_field": {
        "name": "Missing required field",
        "dimension": "completeness",
        "severity": "high",
        "source_tables": ["encounters"],
        "fields": ["encounters.patient_id", "encounters.scheduled_datetime"],
        "why_it_matters": (
            "Required encounter fields are needed for reliatble scheduling and reporting."
        ),
        "recommended_action": (
            "Complete the missing source value or route the record for correction."
        ),
        
    },
    "invalid_enum": {
        "name": "Invalid coded value",
        "dimension": "validity",
        "severity": "medium",
        "source_tables": ["encounters"],
        "fields": ["encounters.encounter_type", "encounters.status"],
        "why_it_matters": (
            "Unrecognized values fragment reporting categories and downstream logic."
        ),
        "recommended_action": (
            "Map the value to an approved code or correct it in the source system."
        ),
    },
    
    "date_logic_violation": {
        "name": "Date logic violation",
        "dimension": "temporal_plausibility",
        "severity": "high",
        "source_tables": ["encounters", "patients"],
        "fields": [
            "encounters.scheduled_datetime",
            "encounters.status",
            "patients.dob",
        ],
        "why_it_matters": (
            "A completed future encounter or encounter before birth is not plausible."
        ),
        "recommended_action": (
            "Confirm the encounter status and event date with the source workflow."
        ),
    },
    
    "department_mismatch": {
        "name": "Department mismatch",
        "dimension": "consistency",
        "severity": "medium", 
        "source_tables": ["encounters", "providers"],
        "fields": ["encounters.department", "providers.department"],
        "why_it_matters": (
            "Department attribution affects volume, staffing, and operational reporting."
        ),
        "recommended_action": (
            "Reconcile the encounter department with the assigned provider's department."
        ),
    },
    
    "duplicate_mrn": {
        "name": "Duplicate medical record number",
        "dimension": "uniqueness",
        "severity": "high",
        "source_tables": ["patients"],
        "fields": ["patients.patient_id", "patients.mrn"],
        "why_it_matters": (
            "Duplicate MRNs create patient-identity and patient-matching risk."
        ),
        "recommended_action": (
            "Review the patient master and resolve the duplicate identifier."
        ),
    },
    
    "duplicate_encounter": {
        "name": "Duplicate encounter",
        "dimension": "uniqueness",
        "severity": "medium",
        "source_tables": ["encounters"],
        "fields": [
            "encounters.patient_id",
            "encounters.provider_id",
            "encounters.scheduled_datetime",
        ],
        "why_it_matters": (
            "Duplicate encounters can inflate utilization and scheduling counts."
        ),
        "recommended_action": (
            "Confirm whether the duplicate is a repeated extract or separate appointment."
        ),
    },
    
    "np_scope_mismatch": {
        "name": "Simulated provider-assignment check",
        "dimension": "business_rule_conformance",
        "severity": "medium", 
        "source_tables": ["encounters", "providers"],
        "fields": ["providers.title", "encounters.encounter_type"],
        "why_it_matters": (
            "Assignment rules should be reviewed against organizational credentialing policy."
        ),
        "recommended_action": (
            "Confirm provider privileges and local assignment policy."
        ),
        "limitation": (
            "Demonstration-only rule: real scope and privilege policy varies by organization, jurisdiction, and workflow."
        ),
    },
    
}