import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

function Overview() {
    const [issues, setIssues] = useState([]);
    const [evaluation, setEvaluation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getIssues(),
            api.getEvaluation(),
        ])
            .then(([issuesData, evaluationData]) => {
                setIssues(issuesData.items || []);
                setEvaluation(evaluationData);
            })
            .catch(() => {
                setError("Could not load overview data.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const severityCounts = useMemo(
        () => countBy(issues, "severity"),
        [issues]
    );

    const dimensionCounts = useMemo(
        () => countBy(issues, "quality_dimension"),
        [issues]
    );

    const recordTypeCounts = useMemo(
        () => countBy(issues, "record_type"),
        [issues]
    );

    const highPriorityIssues = useMemo(
        () => issues
            .filter((issue) => issue.severity === "high")
            .slice(0, 5),
        [issues]
    );

    const highSeverityCount = severityCounts.high || 0;
    const precision = formatPercent(evaluation?.precision);
    const recall = formatPercent(evaluation?.recall);

    if (loading) {
        return (
            <div className="status-message">
                Loading Overview data...
            </div>
        );
    }

    if (error) {
        return (
            <div className="status-message status-message--error" role="alert">
                {error}
            </div>
        );
    }

    return (
        <section className="overview-page">

            <section className="metric-grid" aria-label="Data quality summary">
                <article className="metric-card">
                    <span className="metric-card__label">Total</span>
                    <strong className="metric-card__value">{issues.length}</strong>
                    <span className="metric-card__detail">findings detected across all rules</span>
                </article>

                <article className="metric-card metric-card--high">
                    <span className="metric-card__label">High Severity</span>
                    <strong className="metric-card__value">{highSeverityCount}</strong>
                    <span className="metric-card__detail">findings requiring priority review</span>
                </article>

                <article className="metric-card metric-card--success">
                    <span className="metric-card__label">Precision</span>
                    <strong className="metric-card__value">{precision}</strong>
                    <span className="metric-card__detail">no false-positive findings</span>
                </article>

                <article className="metric-card metric-card--success">
                    <span className="metric-card__label">Recall</span>
                    <strong className="metric-card__value">{recall}</strong>
                    <span className="metric-card__detail">no expected findings missed</span>
                </article>
                
            </section>

            <section className="overview-grid">
                <article className="overview-panel">
                    <div className="panel-heading">
                        <div>
                            <p className="eyebrow">Issue Profile</p>
                        </div>
                    </div>

                    <BreakdownList
                        items={[
                            {
                                label: "High",
                                value: severityCounts.high || 0,
                                tone: "high",
                            },

                            {
                                label: "Medium",
                                value: severityCounts.medium || 0,
                                tone: "medium",
                            },

                            {
                                label: "Low",
                                value: severityCounts.low || 0,
                                tone: "low"
                            },
                        ]}

                    />
                </article>

                <article className="overview-panel">
                    <div className="panel-heading">
                        <div>
                            <p className="eyebrow">Quality Dimensions</p>
                        </div>
                    </div>

                    <BreakdownList
                        items={[
                            {
                                label: "Completeness",
                                value: dimensionCounts.completeness || 0,
                                tone: "neutral",
                            },

                            {
                                label: "Validity",
                                value: dimensionCounts.validity || 0,
                                tone: "neutral",
                            },

                            {
                                label: "Uniqueness",
                                value: dimensionCounts.uniqueness || 0,
                                tone: "neutral",
                            },

                            {
                                label: "Consistency",
                                value: dimensionCounts.consistency || 0,
                                tone: "neutral",
                            },

                            {
                                label: "Referential Integrity",
                                value: dimensionCounts.referential_integrity || 0,
                                tone: "neutral",
                            },

                            {
                                label: "Temporal Plausibility",
                                value: dimensionCounts.temporal_plausibility || 0,
                                tone: "neutral",
                            },

                            {
                                label: "Business-Rule Conformance",
                                value: dimensionCounts.business_rule_conformance || 0,
                                tone: "neutral",
                            },
                        ]}

                    />
                </article>

                <article className="overview-panel">
                    <div className="panel-heading">
                        <div>
                            <p className="eyebrow">Affected Records</p>
                        </div>
                    </div>

                    <BreakdownList
                        items={[
                            {
                                label: "Encounter",
                                value: recordTypeCounts.encounter || 0,
                                tone: "neutral",
                            },

                            {
                                label: "Patient",
                                value: recordTypeCounts.patient || 0,
                                tone: "neutral",
                            },

                            {
                                label: "Provider",
                                value: recordTypeCounts.provider || 0,
                                tone: "neutral",
                            },
                        ]}

                    />

                    <p className="panel-note">
                        Provider records act as reference data in this version.
                        Provider-related integrity failures are attributed to the encounter record
                        containing invalid or inconsistent reference.
                    </p>
                </article>

                <article className="overview-panel">
                    <div className="panel-heading">
                        <div>
                            <p className="eyebrow">Validation Performance</p>
                        </div>
                    </div>

                    <dl className="evaluation-list">
                        <div>
                            <dt>Issues Detected</dt>
                            <dd>{evaluation.issues_detected}</dd>
                        </div>

                        <div>
                            <dt>Expected Issues</dt>
                            <dd>{evaluation.ground_truth_issues}</dd>
                        </div>

                        <div>
                            <dt>True Positives</dt>
                            <dd>{evaluation.true_positives}</dd>
                        </div>

                        <div>
                            <dt>False Positives</dt>
                            <dd>{evaluation.false_positives}</dd>
                        </div>

                        <div>
                            <dt>False Negatives</dt>
                            <dd>{evaluation.false_negatives}</dd>
                        </div>

                        <div>
                            <dt>Precision</dt>
                            <dd>{precision}</dd>
                        </div>
                    </dl>
                </article>
            </section>

            <section className="overview-panel overview-panel--wide">
                <div className="panel-heading">
                    <div>
                        <p className="eyebrow">Priority Queue</p>
                    </div>
                </div>

                {!highPriorityIssues.length ? (
                    <p className="empty-copy">No high-severity findings were detected.</p>
                ) : (
                    <div className="issues-table-wrap">
                        <table className="issues-table">
                            <thead>
                                <tr>
                                    <th>Severity</th>
                                    <th>Rule</th>
                                    <th>Record</th>
                                    <th>Detail</th>
                                </tr>
                            </thead>

                            <tbody>
                                {highPriorityIssues.map((issue, index) => (
                                    <tr
                                        key={`${issue.record_type}-${issue.record_id}-${issue.error_type}-${index}`}
                                    >
                                        <td>
                                            <span className={`severity severity--${issue.severity}`}>
                                                {issue.severity}
                                            </span>
                                        </td>

                                        <td>{issue.rule_name}</td>

                                        <td>
                                            <span className="record-type">{issue.record_type}</span>
                                            <span className="record-id">
                                                #{String(issue.record_id).padStart(4, "0")}
                                            </span>
                                        </td>

                                        <td className="detail">{issue.detail}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </section>
    );
}

function BreakdownList({ items }) {
    const largestValue = Math.max(...items.map((item) => item.value), 1);

    return (
        <div className="breakdown-list">
            {items.map((item) => {
                const width = `${(item.value / largestValue) * 100}%`;


                return (
                    <div className="breakdown-row" key={item.label}>
                        <div className="breakdown-row__labels">
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                        </div>

                        <div className="breakdown-row__track">
                            <span 
                                className={`breakdown-row__bar breakdown-row__bar--${item.tone}`}
                                style = {{ width }}
                            />
                        </div>
                   </div>
                );
            })}
        </div>
    );
}

function countBy(items, key) {
    return items.reduce((counts, item) => {
        const value = item[key];

        if (value) {
            counts[value] = (counts[value] || 0) + 1;
        }

        return counts;
    }, {});
}

function formatPercent(value) {
    if (typeof value !== "number") {
        return "-";
    }
    return `${Math.round(value * 100)}%`;
}

export default Overview;