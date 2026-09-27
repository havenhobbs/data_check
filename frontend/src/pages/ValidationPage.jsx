import { useEffect, useState } from "react";
import { api } from "../api.js";

function percent(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function formatErrorType(errorType) {
    const labels = {
        date_logic_violation: "Date Logic Violation",
        department_mismatch: "Department Mismatch",
        duplicate_encounter: "Duplicate Encounter",
        duplicate_mrn: "Duplicate Medical Record Number (MRN)",
        invalid_enum: "Invalid Coded Value",
        missing_required_field: "Missing Required Field",
        np_scope_mismatch: "Simulated Provider-Assignment Check",
        orphaned_patient_fk: "Orphaned Patient Reference",
        orphaned_provider_fk: "Orphaned Provider Reference",
    };
    return labels[errorType] || errorType;
}

function ValidationPage() {
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getEvaluation()
        .then(setResults)
        .catch(() => {
            setError("could not load validation evaluation results.");
        });

    }, []);

    if (error) {
        return (
            <div className="status-message status-message--error">
                {error}
            </div>
        );
    }

    if (!results) {
        return (
            <div className="status-message">
                Loading validation results...
            </div>
        );
    }

    return (
        <section>
            <div className="panel-header">
                <div>
                   <p className="section-description">
                        Controlled error-injection results compared with record-level ground truth.
                    </p>
                </div>
            </div>

            <section className="vitals">
                <VitalStat
                    label="Known Test Defects"
                    value={results.ground_truth_issues}
                />
                <VitalStat
                    label="Correctly Detected"
                    value={results.issues_detected}
                />
                
                <VitalStat
                    label="Precision"
                    value={percent(results.precision)}
                />
                <VitalStat
                    label="Recall"
                    value={percent(results.recall)}
                />

            </section>

             <section className="panel">
                <div className="panel-header">
                    <h2>Rule Performance</h2>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Rule</th>
                            <th>Expected</th>
                            <th>Detected</th>
                            <th>Precision</th>
                            <th>Recall</th>
                        </tr>
                    </thead>

                    <tbody>
                        {results.by_rule.map((rule) => (
                            <tr key={rule.error_type}>
                                <td>{formatErrorType(rule.error_type)}</td>
                                <td>{rule.expected}</td>
                                <td>{rule.detected}</td>
                                <td>{percent(rule.precision)}</td>
                                <td>{percent(rule.recall)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="methodology">
                <h3>Methodology</h3>
                <p>
                    The project generates a clean synthetic dataset, injects controlled
                    data-quality defects into copies of the source extracts, records
                    expected findings in <code>ground_truth_errors.csv</code>, and
                    compares validator output with that record-level answer key.
                </p>
            </section>
        </section>
    );
}

function VitalStat({ label, value, isFlag = false }) {
    return (
        <div className="vital">
            <div className={`vital-value ${isFlag ? "vital-value--flag" : ""}`}>
                {value}
            </div>
            <div className="vital-label">{label}</div>
        </div>
    );
}

export default ValidationPage;