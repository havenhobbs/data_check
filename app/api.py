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
from evaluation import evaluate_validator

from flask import Flask, jsonify, request
from flask_cors import CORS

sys.path.insert(0, str(Path(__file__).parent))
from models import get_engine, get_session, Patient, Provider, Encounter
from validators import run_all_checks
from rules import RULE_CATALOG

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
    severity = request.args.get("severity")
    dimension = request.args.get("dimension")
    record_type = request.args.get("record_type")
    search = request.args.get("q", "").strip().lower()
    
    if error_type:
        all_issues = [
            issue
            for issue in all_issues
            if issue["error_type"] == error_type
        ]
        
    if severity: 
        all_issues = [
            issue
            for issue in all_issues
            if issue["severity"] == severity
        ]
        
    if dimension:
        all_issues = [
            issue
            for issue in all_issues
            if issue["quality_dimension"] == dimension
        ]
        
    if record_type:
        all_issues = [
            issue
            for issue in all_issues
            if issue["record_type"] == record_type
        ]
        
    if search:
        all_issues = [
            issue
            for issue in all_issues
            if (
                search in str(issue["record_id"]).lower()
                or search in issue["detail"].lower()
                or search in issue["rule_name"].lower()                
            )
        ]
        
    severity_order = {
        "high": 0,
        "medium": 1,
        "low": 2,
    }
    
    all_issues.sort(
        key=lambda issue: (
            severity_order.get(issue["severity"], 99),
            issue["record_type"],
            issue["record_id"],
        )
    )
        
    return jsonify({
        "items": all_issues,
        "total_items": len(all_issues),
    
    })

@app.route("/api/evaluation")
def evaluation():
    return jsonify(evaluate_validator())

@app.route("/api/rules")
def rules():
    rule_list = []
    
    for error_type, rule in RULE_CATALOG.items():
        rule_list.append({
            "error_type": error_type,
            **rule,
        })
    
    return jsonify(
        sorted(
            rule_list,
            key=lambda rule: rule["name"],
        )
    )
    

if __name__ == "__main__":
    app.run(debug=True, port=5001)