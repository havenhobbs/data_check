import { useEffect, useState } from "react";
import { api } from "../api.js";

function Rules() {
    const [rules, setRules] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getRules()
        .then(setRules)
        .catch(() => {
            setError("Could not load the validation rule catalog.");
        });
    }, []);

    if (error) {
        return (
            <div className="status-message status-message--error">
                {error}
            </div>
        );
    }

    if (!rules.length) {
        return (
            <div className="status-message">
                Loading rule catalog...
            </div>
        );
    }

    return (
        <section>
            <div className="panel-header">
                <div>
                    <p className="section-description">
                        Hover over a rule to view its recommended remediation.
                    </p>
                </div>
            </div>

            <div className="rule-grid">
                {rules.map((rule) => (
                    <article className="rule-card" key={rule.error_type}>
                        <div className="rule-card-header">
                            <span className={`severity severity--${rule.severity}`}>
                                {rule.severity}
                            </span>

                            <span className="dimension-label">
                                {formatLabel(rule.dimension)}
                            </span>
                        </div>

                        <h3>{rule.name}</h3>

                        <section className="rule-section rule-section--fields">
                            <h4>Fields Checked</h4>
                            <ul className="rule-field-list">
                                {rule.fields.map((field) => (
                                    <li key={field}>{field}</li>
                                ))}
                            </ul>
                        </section>

                        <section className="rule-section rule-section--why">
                            <h4>Why It Matters</h4>
                            <p>{rule.why_it_matters}</p>
                        </section>

                        <section className="rule-section rule-section--action">
                            <h4>Recommended Action</h4>
                            <p>{rule.recommended_action}</p>
                        </section>

                        {rule.limitation && (
                            <section className="rule-section rule-section--limitation">
                            <h4>Limitation</h4>
                            <p>{rule.limitation}</p>
                        </section>
                        )}


                    </article>
                ))}
            </div>
        </section>
    );
}

function formatLabel(value) {
    const labels = {
        temporal_plausibility: "Temporal Plausibility",
        consistency: "Consistency",
        uniqueness: "Uniqueness",
        validity: "Validity",
        completeness: "Completeness",
        referential_integrity: "Referential Integrity",
        business_rule_conformance: "Business-Rule Conformance"
    };

    return labels[value] || value;
}

export default Rules;