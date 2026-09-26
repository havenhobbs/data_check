import csv
from collections import defaultdict
from pathlib import Path

from models import get_engine, get_session
from validators import run_all_checks

DATA_DIR = Path(__file__).parent.parent / "data"

def load_ground_truth():
    truth = set()
    
    with open(DATA_DIR / "ground_truth_errors.csv", newline="") as f:
        for row in csv.DictReader(f):
            truth.add((
                row["record_type"],
                int(row["record_id"]),
                row["error_type"],
            ))
            
    return truth

def evaluate_validator():
    engine = get_engine()
    session = get_session(engine)
    
    found_issues = run_all_checks(session)
    
    session.close()
    
    found = {
        (
            issue["record_type"],
            int(issue["record_id"]),
            issue["error_type"]
        )
        
        for issue in found_issues
    }
    
    truth = load_ground_truth()
    
    true_positives = found &  truth
    false_positives = found - truth
    false_negatives = truth - found
    
    precision = len(true_positives) / len(found) if found else 0
    recall = len(true_positives) / len(truth) if truth else 0
    
    by_rule = defaultdict(lambda: {
        "expected": 0,
        "detected": 0,
        "true_positives": 0,
        "false_positives": 0,
        "false_negatives": 0,
    })
    
    for _, _, error_type in truth:
        by_rule[error_type]["expected"] += 1
        
    for _, _, error_type in found:
        by_rule[error_type]["detected"] += 1
        
    for _, _, error_type in true_positives:
        by_rule[error_type]["true_positives"] += 1
        
    for _, _, error_type in false_positives:
        by_rule[error_type]["false_positives"] += 1
        
    for _, _, error_type in false_negatives:
        by_rule[error_type]["false_negatives"] += 1
        
    results_by_rule = []
    
    for error_type, result in by_rule.items():
        true_positive_count = result["true_positives"]
        false_positive_count = result["false_positives"]
        false_negative_count = result["false_negatives"]
        
        results_by_rule.append({
            "error_type": error_type,
            **result,
            "precision": (
                true_positive_count / (true_positive_count + false_positive_count)
                if (true_positive_count + false_positive_count)
                else 0
            ),
            "recall": (
                true_positive_count / (true_positive_count + false_negative_count)
                if (true_positive_count + false_negative_count)
                else 0
            ),
        })
        
    return {
        "ground_truth_issues": len(truth),
        "issues_detected": len(found),
        "true_positives": len(true_positives),
        "false_positives": len(false_positives),
        "false_negatives": len(false_negatives),
        "precision": precision,
        "recall": recall,
        "by_rule": sorted(results_by_rule, key=lambda result: result["error_type"]),
    }