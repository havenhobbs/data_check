import { useEffect , useState } from "react";
import { api } from "../api.js";

function Issues() {
    const [issues, setIssues] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [rules, setRules] = useState([]);
    const [filters, setFilters] = useState({
        severity: "",
        dimension: "",
        error_type: "",
        record_type: "",
        q: "",
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getRules()
            .then(setRules)
            .catch(() => {
                setError("Could not load rule options.");
            });
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);

        api.getIssues(filters)
            .then((data) => {
                setIssues(data.items);
                setTotalItems(data.total_items);
                setError(null);
            })
            .catch(() => {
                setError("Could not load issue results.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [filters]);

    function updateFilter(key, value) {
        setFilters((currentFilters) => ({
            ...currentFilters,
            [key]: value,
        }));
    }

    function resetFilters() {
        setFilters({
            severity: "",
            dimension: "",
            error_type: "",
            record_type: "",
            q: "",
        });
    }

    if (error && !issues.length) {
        return (
            <div className="status-message status-message--error">
                {error}
            </div>
        );
    }

    return (
        <section>

            <section className="issue-filters" aria-label="Issue filters">
                <label className="issue-search">
                    Search
                    <input
                        type="search"
                        value={filters.q}
                        placeholder="Record ID, rule, or detail"
                        onChange={(event) => updateFilter("q", event.target.value)}
                    />
                </label>

                <div className="issue-filter-row">
                    <label>
                        Severity
                        <select
                            value={filters.severity}
                            onChange={(event) => updateFilter("severity", event.target.value)}
                        >
                            <option value="">All Severities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </label>

                    <label>
                        Dimension
                        <select
                            value={filters.dimension}
                            onChange={(event) => updateFilter("dimension", event.target.value)}
                        >
                            <option value="">All Dimensions</option>
                            <option value="completeness">Completeness</option>
                            <option value="validity">Validity</option>
                            <option value="uniqueness">Uniqueness</option>
                            <option value="consistency">Consistency</option>
                            <option value="referential_integrity">Referential Integrity</option>
                            <option value="temporal_plausibility">Temporal Plausibility</option>
                            <option value="business_rule_conformance">Business-Rule Conformance</option>
                        </select>
                    </label>

                    <label>
                        Rule
                        <select
                            value={filters.error_type}
                            onChange={(event) => updateFilter("error_type", event.target.value)}
                        >
                            <option value="">All Rules</option>
                            {rules.map((rule) => (
                                <option key={rule.error_type} value={rule.error_type}>
                                    {rule.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Record Type
                        <select
                            value={filters.record_type}
                            onChange={(event) => updateFilter("record_type", event.target.value)}
                        >
                            <option value="">All Record Types</option>
                            <option value="patient">Patient</option>
                            <option value="provider">Provider</option>
                            <option value="encounter">Encounter</option>
                        </select>
                    </label>
                </div>

                <button 
                    className="reset-button"
                    type="button"
                    onClick={resetFilters}
                >
                    Reset
                </button>
            </section>

            <div className="issue-results-summary">
                {loading
                    ? "Loading issue results..."
                    : `${totalItems} issue ${totalItems === 1 ? "instance" : "instances"} found`}
                
            </div>

            {!loading && !issues.length ? (
                <section className="empty-state">
                    <p>No issues match the selected filters.</p>
                </section>
            ) : (
                <div className="issues-table-wrap">
                    <table className="issues-table">
                        <thead>
                            <tr>
                                <th>Severity</th>
                                <th>Rule</th>
                                <th>Record</th>
                                <th>Dimension</th>
                                <th>Detail</th>
                                <th>Recommended Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {issues.map((issue, index) => (
                                <tr key={`${issue.record_type}-${issue.record_id}-${issue.error_type}-${index}`}
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

                                    <td>{formatDimension(issue.quality_dimension)}</td>

                                    <td className="detail">{issue.detail}</td>

                                    <td className="detail">
                                        {issue.recommended_action}
                                    </td>
                               </tr>     
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}


function formatDimension(value) {
    const labels = {
        completeness: "Completeness",
        validity: "Validity",
        uniqueness: "Uniqueness",
        consistency: "Consistency",
        referential_integrity: "Referential Integrity",
        temporal_plausibility: "Temporal Plausibility",
        business_rule_conformance: "Business-Rule Conformance"
    };

    return labels[value] || value;
}

export default Issues;