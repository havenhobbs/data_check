"""
Flask API that exposes the validation engine over HTTP so that the dashboard can fetch and display results.

Endpoints:

    GET /api/summary - counts of issues by error type
    GET /api/issues - full list of flagged issues (optionally filtered)
    GET /api/stats - total record counts + issue counts 
    
"""

import sys
from pathlib import Path
from collections import Counter

from flask import Flask, jsonify, request
from flask_cors import CORS

sys.path.insert(0, str(Path(__file__).parent))
from models import get_engine, get_session, Patient, Provider, Encounter
from validators import run_all_checks

app = Flask(__name__)
CORS(app)

def get_session_for_request():
    engine = get_engine()
    return get_session(engine)

@app.route("/api/stats")
def stats():
    session = get_session_for_request()
    n_patients = session.query(Patient).count()
    n_providers = session.query(Provider).count()
    n_encounters = session.query(Encounter).count()
    issues = run_all_checks(session)
    session.close()
    
    return jsonify({
        "patients": n_patients,
        "providers": n_providers,
        "encounters": n_encounters,
        "total_issues": len(issues),
    })
    
@app.route("/api/summary")
def summary():
    session = get_session_for_request()
    issues = run_all_checks(session)
    session.close()
    counts = Counter(issue["error_type"] for issue in issues)
    
    return jsonify([{"error_type": k, "count": v} for k, v, in counts.most_common()])

@app.route("/api/issues")
def issues():
    session = get_session_for_request()
    all_issues = run_all_checks(session)
    session.close()
    
    error_type = request.args.get("error_type")
    if error_type:
        all_issues = [i for i in all_issues if i["error_type"] == error_type]
        
    return jsonify(all_issues)

if __name__ == "__main__":
    app.run(debug=True, port=5001)