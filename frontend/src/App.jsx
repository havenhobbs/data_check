import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = 'http://localhost:5001/api'

function App() {
  const [stats, setStats] = useState(null)
  const [summary, setSummary] = useState([])
  const [issues, setIssues] = useState([])
  const [selectedType, setSelectedType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/stats`).then(r => r.json()),
      fetch(`${API_BASE}/summary`).then(r => r.json()),
    ])
      .then(([statsData, summaryData]) => {
        setStats(statsData)
        setSummary(summaryData)
        setLoading(false)
    })
    .catch(() => {
      setError('Could not reach the API. Confirm app/api.py is running on port 5001.')
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const url = selectedType
      ? `${API_BASE}/issues?error_type=${selectedType}`
      : `${API_BASE}/issues`
    fetch(url).then(r => r.json()).then(setIssues)
  }, [selectedType])

  if (loading) return <div className="status-message">Loading validation results...</div>
  if (error) return <div className="status-message status-message--error">{error}</div>

  const maxCount = Math.max(1, ...summary.map(s => s.count))

  return (
    <div className="app">
      <header className="page-header">
        <h1>data_check</h1>
        
      </header>

      <section className="vitals">
        <VitalStat label="Patients" value={stats.patients} />
        <VitalStat label="Providers" value={stats.providers} />
        <VitalStat label="Encounters" value={stats.encounters} />
        <VitalStat label="Issues Found" value={stats.total_issues} />
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Issues by Type</h2>
        </div>
        
        <div className="bar-list">
          <button
            className={`bar-row ${selectedType === null ? 'is-active' : ''}`}
            onClick={() => setSelectedType(null)}
          >
            <span className="bar-row-label">All Issues</span>
            <span className="bar-row-track">
              <span className="bar-row-fill" style={{ width: '100%'}} />
            </span>
            <span className="bar-row-count">{stats.issues}</span>
             </button>

          {summary.map(row => (
            <button
              key={row.error_type}
              className={`bar-row ${selectedType === row.error_type ? 'is-active' : ''}`}
              onClick={() => setSelectedType(row.error_type)}
            >
              <span className="bar-row-label">{formatErrorType(row.error_type)}</span>
              <span className="bar-row-track">
                <span className="bar-row-fill" style={{ width: `${(row.count / maxCount) * 100}%`}} />
              </span>
              <span className="bar-row-count">{row.count}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Flagged Records</h2>
          {selectedType && <span className="panel-filter">{formatErrorType(selectedType)}</span>}
        </div>
        
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
                <td className="record-id">{String(issue.record_id).padStart(4, '0')}</td>
                <td>
                  <span className="flag">
                    <span className="flag-dot" />
                    {formatErrorType(issue.error_type)}
                  
                  </span>
                </td>
                <td className="detail">{issue.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function VitalStat({ value, label, isFlag  }) {
  return (
    <div className="vital">
      <div className={`vital-value ${isFlag ? 'vital-value--flag' : ''}`}>{value}</div>
      <div className="vital-label">{label}</div>
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
