import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = 'http://localhost:5001/api'

function App() {
  const [stats, setStats] = useState(null)
  const [summary, setSummary] = useState([])
  const [issues, setIssues] = useState([])
  const [selectedType, setSelectedType] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/stats`).then(r => r.json()),
      fetch(`${API_BASE}/summary`).then(r => r.json()),
    ]).then(([statsData, summaryData]) => {
      setStats(statsData)
      setSummary(summaryData)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const url = selectedType
      ? `${API_BASE}/issues?error_type=${selectedType}`
      : `${API_BASE}/issues`
    fetch(url).then(r => r.json()).then(setIssues)
  }, [selectedType])

  if (loading) return <div className="loading">Loading validation results...</div>

  return (
    <div className="app">
      <header>
        <h1>data_check</h1>
        <p className="subtitle">Encounter data validation dashboard</p>
      </header>

      <section className="stats-row">
        <StatCard label="Patients" value={stats.patients} />
        <StatCard label="Providers" value={stats.providers} />
        <StatCard label="Encounters" value={stats.encounters} />
        <StatCard label="Issues Found" value={stats.total_issues} highlight />
      </section>

      <section className="summary-section">
        <h2>Issues by Type</h2>
        <div className="error-type-grid">
          <button
            className={`error-card ${selectedType === null ? 'active' : ''}`}
            onClick={() => setSelectedType(null)}
          >
            <span className="error-count">{stats.total_issues}</span>
            <span className="error-label">All Issues</span>
          </button>
          {summary.map(row => (
            <button
              key={row.error_type}
              className={`error-card ${selectedType === row.error_type ? 'active' : ''}`}
              onClick={() => setSelectedType(row.error_type)}
            >
              <span className="error-count">{row.count}</span>
              <span className="error-label">{formatErrorType(row.error_type)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="issues-section">
        <h2>Flagged Records {selectedType ? `— ${formatErrorType(selectedType)}` : ''}</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Record ID</th>
              <th>Error</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue, i) => (
              <tr key={i}>
                <td className="record-type">{issue.record_type}</td>
                <td>{issue.record_id}</td>
                <td><span className="error-badge">{formatErrorType(issue.error_type)}</span></td>
                <td className="detail">{issue.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`stat-card ${highlight ? 'highlight' : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function formatErrorType(errorType) {
  return errorType
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default App
