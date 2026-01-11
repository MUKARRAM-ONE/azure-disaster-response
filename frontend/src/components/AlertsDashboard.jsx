import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../auth/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api'

export function AlertsDashboard() {
  const { token } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  
  // Filtering
  const [filterType, setFilterType] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [searchLocation, setSearchLocation] = useState('')

  useEffect(() => {
    fetchAlerts()
  }, [offset, filterType, filterSeverity, searchLocation])

  const fetchAlerts = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_URL}/getalerts?limit=${limit}&offset=${offset}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      let filtered = response.data.alerts || []
      
      // Client-side filtering
      if (filterType) {
        filtered = filtered.filter(a => a.type === filterType)
      }
      if (filterSeverity) {
        filtered = filtered.filter(a => a.severity === filterSeverity)
      }
      if (searchLocation) {
        filtered = filtered.filter(a => 
          a.location.toLowerCase().includes(searchLocation.toLowerCase())
        )
      }
      
      setAlerts(filtered)
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

  const clearFilters = () => {
    setFilterType('')
    setFilterSeverity('')
    setSearchLocation('')
    setOffset(0)
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
      
      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">🔍 Filter Alerts</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Disaster Type</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Flood">Flood</option>
                <option value="Fire">Fire</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Hurricane">Hurricane</option>
                <option value="Tornado">Tornado</option>
                <option value="Tsunami">Tsunami</option>
                <option value="Landslide">Landslide</option>
              </select>
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Severity</label>
              <select
                className="form-select"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Search Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mt-3">
            {(filterType || filterSeverity || searchLocation) && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={clearFilters}
              >
                <i className="bi bi-x-lg me-1"></i>Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-inbox"></i>
          <h3 className="mt-3">No Alerts Found</h3>
          <p className="text-muted">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Showing {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </div>

          {alerts.map(alert => (
            <div key={alert.id} className={`card alert-card mb-3 severity-${alert.severity.toLowerCase()}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
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

          {/* Pagination */}
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
                  Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit || 1)}
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
        </>
      )}
    </div>
  )
}
