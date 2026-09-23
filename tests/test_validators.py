"""
Compares the findings against "answer-key" and reports precision and recall.
"""

import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "app"))

from models import get_engine, get_session
from validators import run_all_checks

DATA_DIR = Path(__file__).parent.parent / "data"

def load_ground_truth():
    truth = set()
    with open(DATA_DIR / "ground_truth_errors.csv", newline="") as f:
        for row in csv.DictReader(f):
            truth.add((row["record_type"], int(row["record_id"]), row["error_type"]))
        return truth
    
def main():
    engine = get_engine()
    session = get_session(engine)
    found_issues = run_all_checks(session)
    session.close()
    
    found = {(i["record_type"], int(i["record_id"]), i["error_type"]) for i in found_issues}
    truth = load_ground_truth()
    
    true_positives = found & truth
    false_positives = found - truth
    false_negatives = truth - found
    
    precision = len(true_positives) / len(found) if found else 0
    recall = len(true_positives) / len(truth) if truth else 0
    
    print(f"ground truth issues:    {len(truth)}")
    print(f"issues found:           {len(found)}")
    print(f"true positives:         {len(true_positives)}")
    print(f"false positives:        {len(false_positives)}")
    print(f"false negatives:        {len(false_negatives)}")
    print(f"precision:              {precision:.1%}")
    print(f"recall:                 {recall:.1%}")
    
    if false_negatives:
        print("\nmissed (false negatives):}")
        for fn in sorted(false_negatives, key=lambda x: x[2])[:10]:
            print(f"    {fn}")
            
    if false_positives:
        print("\nextra flags (false positives):")
        for fp in sorted(false_positives, key=lambda x: x[2])[:10]:
            print(f"    {fp}")
            
if __name__ == "__main__":
    main() 