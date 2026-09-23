"""
Sanity check
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from api import app

client = app.test_client()

print("GET /api/stats")
print(client.get("/api/stats").get_json())

print("\nGET /api/summary")
for row in client.get("/api/summary").get_json():
    print(" ", row)
    
print("\nGET /api/issues?error_type=duplicate_mrn (first 3)")
issues = client.get("/api/issues?error_type=duplicate_mrn").get_json()
for i in issues[:3]:
    print(" ", i)
print(f"  ... {len(issues)} total")