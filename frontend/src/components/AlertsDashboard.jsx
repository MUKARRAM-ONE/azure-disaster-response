import { useAuth0 } from '@auth0/auth0-react'
import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api'

export function AlertsDashboard() {
  const { getAccessToken } = useAuth0()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchAlerts()
  }, [offset])

  const fetchAlerts = async () => {
    setLoading(true)
    setError('')
    try {
      const token = await getAccessToken()
      const response = await axios.get(`${API_URL}/Alerts?limit=${limit}&offset=${offset}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setAlerts(response.data.alerts || [])
      setTotal(response.data.total || 0)
    } catch (err) {
      setError('Failed to fetch alerts')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'danger',
      'High': 'warning',
      'Medium': 'info',
      'Low': 'success'
    }
    return colors[severity] || 'secondary'
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>
  }

  if (alerts.length === 0) {
    return (
      <div className="empty-state">
        <i className="bi bi-inbox"></i>
        <h3 className="mt-3">No Alerts Yet</h3>
        <p className="text-muted">Submit the first disaster alert</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-white"><i className="bi bi-list-check me-2"></i>Recent Alerts</h2>
      
      {alerts.map(alert => (
        <div key={alert.id} className="card alert-card mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="card-title">
                  <span className={`badge bg-${getSeverityColor(alert.severity)} me-2`}>
                    {alert.severity}
                  </span>
                  {alert.type}
                </h5>
                <p className="card-text text-muted">
                  <i className="bi bi-geo-alt me-1"></i>{alert.location}
                </p>
                <p className="card-text">{alert.message}</p>
              </div>
              <small className="text-muted text-nowrap ms-3">
                {new Date(alert.timestamp).toLocaleString()}
              </small>
            </div>
          </div>
        </div>
      ))}

      <nav aria-label="Page navigation" className="mt-4">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${offset === 0 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
            >
              Previous
            </button>
          </li>
          <li className="page-item active">
            <span className="page-link">
              Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
            </span>
          </li>
          <li className={`page-item ${offset + limit >= total ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
