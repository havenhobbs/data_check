# data_check

[![Python 3.10+](https://shields.io)](https://python.org)
[![Flask](https://shields.io)](https://palletsprojects.com)
[![SQLAlchemy](https://shields.io)](https://sqlalchemy.org)
[![Vite + React 19](https://shields.io)](https://vite.dev)

`data_check` is an enterprise data validation and analytical auditing engine designed to analyze complex relational databases, flag structural constraints, and measure pipeline error-detection accuracy. 

The software architecture operates as a **closed-loop Failure Reporting, Analysis, and Corrective Action System(FRACAS)**. It programmatically generates baseline testing environments, injects exact deterministic mutations into copies of those extracts, evaluates parameters against independent rules workers, and calculates mathmatical data-integrity metrics (`Precision` and `Recall`) against an immutable record-level answer key. 

---

## System Architecture & Data Loop

The project is structured into fully decoupled operational layers, ensuring clear configuration management and complete isolation of business validation logic from presentation views: 

[ CLOSED-LOOP TESTING PIPELINE ]
+-------------------------+       +-------------------------+
|  scripts/clean_data.py  | ====> | scripts/inject_errors.py|
| (Deterministic Base Gen)|       | (Controlled Mutations)  |
+-------------------------+       +-------------------------+
||                               ||
/                               /
+-------------------------+       +-------------------------+
|   data/*_clean.csv      |       | ground_truth_errors.csv |
|  (Baseline Master Logs) |       |   (Relational Key)      |
+-------------------------+       +-------------------------+
||                               ||
/                               /
+-------------------------+       +-------------------------+
|    app/load_data.py     |       |   app/evaluation.py     |
| (SQLAlchemy Injection)  |       | (Precision/Recall Core) |
+-------------------------+       +-------------------------+
||                               ||
/                               /
+-----------------------------------------------------------+
|            Flask REST API Gateway (app/api.py Core)       |
+-----------------------------------------------------------+
||
/
+-----------------------------------------------------------+
|        Vite SPA Dashboard Dashboard (React 19 Frontend)   |
+-----------------------------------------------------------+

## Complete Repo Directory Map

```filepath
data_check/
├── app/                           # Core Data Engine & API Layer
│   ├── api.py                     # Flask HTTP Routing; Query & Wildcard Search Filters
│   ├── config.py                  # Telemetry Reference Datetime Parameters
│   ├── evaluation.py              # Statistical Verification Engine (Precision & Recall)
│   ├── load_data.py               # Idempotent Database Seed Worker & CSV Parser
│   ├── models.py                  # SQLAlchemy Declarative Tables Schema & Relationships
│   ├── requirements.txt           # Backend Dependency Environment Locks
│   ├── rules.py                   # Central Decoupled Rule Catalog (Configuration Management)
│   ├── validators.py              # Granular Anomaly Isolation Workers (Closed-Loop Auditing)
│   └── verify_api.py              # Local Integration Script & HTTP Route Verifier
├── data/                          # Managed Local Repository Datasets
│   ├── encounters_clean.csv       # Pre-mutation Relational Base Log
│   ├── encounters_dirty.csv       # Post-mutation Telemetry Extract
│   ├── ground_truth_errors.csv    # Programmatic Answer Key Matrix (Deterministic Key)
│   ├── patients_clean.csv         # Baseline Patient Master Roster
│   ├── patients_dirty.csv         # Mutated Patient Telemetry Roster
│   ├── providers_clean.csv        # Baseline Reference Personnel Logs
│   └── providers_dirty.csv        # Mutated Reference Personnel Logs
├── frontend/                      # User Experience & Metrics View Layer
│   ├── public/                    # Static Global App Shell Assets
│   │   ├── favicon.svg            # App Browser Tab Icon Vector
│   │   └── icons.svg              # Centralized Sprite Graphic Vectors
│   └── src/
│       ├── assets/                # Local Dashboard Layout Graphics
│       │   ├── hero.png           # Home Page Technical Graphic Splash
│       │   ├── react.svg          # Visual Framework Assets
│       │   └── vite.svg           # Local Compilation Engine Asset
│       ├── components/            # Reusable Presentation Components
│       │   ├── FilterBar.jsx      # Multi-Select Reactive Query Panel
│       │   ├── Header.jsx         # Uniform Dashboard Branding Layout
│       │   ├── IssueDetail.jsx    # Remediation Action Expansion Drawer
│       │   ├── IssueTable.jsx     # High-Density Anomaly Information Grid
│       │   ├── MetricCard.jsx     # Vital Strip KPI Micro-Dashboard
│       │   └── RuleBadge.jsx      # Severity & Quality Dimension Tag Capsule
│       ├── pages/                 # Full Dashboard Routed Views
│       │   ├── Home.jsx           # Mission Statement & Performance Summary Panel
│       │   ├── Issues.jsx         # Priority Triage Review Grid & Filtering Rows
│       │   ├── Overview.jsx       # Quality Dimension Profile & Vital Strip
│       │   ├── Rules.jsx          # Policy Transparency Matrix & Hover Actions
│       │   └── ValidationPage.jsx # Precision/Recall Verification Dashboard
│       ├── api.js                 # Async Native Fetch Services (Filter Serialization)
│       ├── App.css                # Low-Latency UX Colors & Responsive Matrix
│       ├── App.jsx                # Layout Engine & Active State Tab Router
│       ├── index.css              # Universal UI Variables & Typography Sheet
│       └── main.jsx               # React 19 Client Initialization Mount Point
├── scripts/                       # Simulation Data Modifiers
│   ├── clean_data.py              # Synthetic Clean Record Generation Loop
│   └── inject_errors.py           # Controlled Defect Mutation Script
├── tests/                         # Quality Assurance Verification Loop
│   └── test_validators.py         # Automated Regression Testing Suite
├── .gitignore                     # Transient File Containment Enforcer
└── data_check.db                  # Localized Active SQLite Relational Engine
```

---

## Monitored Data Quality Dimensions

`data_check` evaluates database records against the standard criteria of data integrity, explicitly mapped out inside `app/rules.py`:

| Quality Dimension | Technical Rule Identifier | Target Failure Context | Severity |
| :--- | :--- | :--- | :--- |
| **Referential Integrity** | `orphaned_patient_fk` | Encounter foreign key refers to a patient ID missing from master arrays. | `HIGH` |
| **Referential Integrity** | `orphaned_provider_fk` | Transaction line lists a reference ID outside active personnel records. | `HIGH` |
| **Completeness** | `missing_required_field` | Mandatory audit values are omitted or left blank in source tracks. | `HIGH` |
| **Temporal Plausibility**| `date_logic_violation` | Action logged as completed in the future or occurring prior to record birth. | `HIGH` |
| **Consistency** | `department_mismatch` | Location properties conflict across linked entities in the database. | `MEDIUM` |
| **Uniqueness** | `duplicate_mrn` | Shared indexing numbers found across separate unique master entries. | `HIGH` |
| **Uniqueness** | `duplicate_encounter` | Repeated telemetry row detected matching exact parameters. | `MEDIUM` |
| **Business-Rule** | `np_scope_mismatch` | Operational assignment breaches local authorization constraints. | `MEDIUM` |

---

## Statistical Performance Metrics

To eliminate verification drift or "black-box" telemetry interpretation, `app/evaluation.py` and `scripts/evaluate_validator.py` cross-check active records against the explicit answer key to compute standard precision/recall matrices: 

$$\text{Precision} = \frac{\text{True Positives}}{\text{True Positives} + \text{False Positives}} \quad \Big| \quad \text{Recall} = \frac{\text{True Positives}}{\text{True Positives} + \text{False Negatives}}$$

* **Precision (Defect Reliability):** Guarantees zero "false alarms," ensuring that flagged records correspond to a verified architectural anomaly.
* **Recall (Pipeline Capture Rate):** Guarantees zero missed events, verifying that no corrupted entries bypassed detection lines.

---

## Local Execution Guide

### 1. Backend Data & Simulation Setup
```bash
# navigate to the backend application directory
cd app

# initialize and activate your isolated runtime virtual layer
python -m venv venv
source venv/bin/activate  # macOS/Linux
# Windows Command Prompt: .\venv\Scripts\activate.bat
# Windows PowerShell:     .\venv\Scripts\Activate.ps1

# lock in environment dependencies from the local requirements lockfile
pip install -r requirements.txt

# run the simulation data pipelines to generate and corrupt the datasets
python ../scripts/clean_data.py
python ../scripts/inject_errors.py

# execute the loader script to hydrate your local SQLite database
python load_data.py

# run the backend API server gateway
python api.py
```
*The REST API endpoints will stream dynamically out of:* `http://localhost:5001/api`

### 2. Running Automated Testing Suites
To confirm engine detection reliability and perform an architecture sanity check before booting visual dashboards, execute either verification worker:
```bash
# run formal Unit Testing Suite
python -m unittest discover ../tests

# run standalone CLI Evaluation Pipeline
python ../scripts/evaluate_validator.py
```

### 3. Frontend Dashboard UI Setup
```bash
# shift to the view workspace directory
cd ../frontend

# mount dependency tree modules and launch Vite hot-reloading development server
npm install
npm run dev
```

*Open your browser to view the dashboard at:* `http://localhost:5173`