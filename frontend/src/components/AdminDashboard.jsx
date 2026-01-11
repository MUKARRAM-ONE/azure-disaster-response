import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../auth/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api'

export function AdminDashboard() {
  const { token, user } = useAuth()
  const [activeTab, setActiveTab] = useState('alerts')
  const [alerts, setAlerts] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalAlerts: 0,
    totalUsers: 0,
    verifiedUsers: 0,
    blockedUsers: 0,
    unverifiedAlerts: 0,
    bySeverity: {},
    byType: {},
    last24h: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (activeTab === 'alerts') {
      fetchAllAlerts()
    } else if (activeTab === 'users') {
      fetchAllUsers()
    }
  }, [activeTab])

  const fetchAllAlerts = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_URL}/getalerts?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const allAlerts = response.data.alerts || []
      setAlerts(allAlerts)
      
      // Calculate statistics
      const now = new Date()
      const last24h = allAlerts.filter(a => 
        (now - new Date(a.timestamp)) < 24 * 60 * 60 * 1000
      ).length

      const bySeverity = allAlerts.reduce((acc, a) => {
        acc[a.severity] = (acc[a.severity] || 0) + 1
        return acc
      }, {})

      const byType = allAlerts.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1
        return acc
      }, {})

      const unverifiedCount = allAlerts.filter(a => !a.verified).length

      setStats(prev => ({
        ...prev,
        totalAlerts: allAlerts.length,
        unverifiedAlerts: unverifiedCount,
        bySeverity,
        byType,
        last24h
      }))
    } catch (err) {
      setError('Failed to fetch alerts')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_URL}/admin/users?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const allUsers = response.data.users || []
      setUsers(allUsers)

      const verifiedCount = allUsers.filter(u => u.verified).length
      const blockedCount = allUsers.filter(u => u.blocked).length

      setStats(prev => ({
        ...prev,
        totalUsers: allUsers.length,
        verifiedUsers: verifiedCount,
        blockedUsers: blockedCount
      }))
    } catch (err) {
      setError('Failed to fetch users')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const verifyUser = async (userId) => {
    try {
      await axios.post(`${API_URL}/admin/verify-user`, 
        { userId, verified: true },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccessMsg('User verified!')
      fetchAllUsers()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError('Failed to verify user: ' + (err.response?.data?.error || err.message))
    }
  }

  const blockUser = async (userId, reason) => {
    try {
      await axios.post(`${API_URL}/admin/block-user`,
        { userId, blocked: true, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccessMsg('User blocked!')
      fetchAllUsers()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError('Failed to block user: ' + (err.response?.data?.error || err.message))
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure? This will delete the user and all their alerts.')) return
    try {
      await axios.post(`${API_URL}/admin/delete-user`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccessMsg('User deleted!')
      fetchAllUsers()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError('Failed to delete user: ' + (err.response?.data?.error || err.message))
    }
  }

  const verifyAlert = async (alertId) => {
    try {
      await axios.post(`${API_URL}/admin/verify-alert`,
        { alertId, verified: true },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccessMsg('Alert verified!')
      fetchAllAlerts()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError('Failed to verify alert: ' + (err.response?.data?.error || err.message))
    }
  }

  const deleteAlert = async (alertId, reason = '') => {
    if (!confirm('Are you sure you want to delete this alert?')) return
    try {
      await axios.post(`${API_URL}/admin/delete-alert`,
        { alertId, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccessMsg('Alert deleted!')
      fetchAllAlerts()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError('Failed to delete alert: ' + (err.response?.data?.error || err.message))
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
      <div className="text-center py-5">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-white">
        <i className="bi bi-shield-check me-2"></i>Admin Dashboard & Management
      </h2>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h3 className="display-4 mb-0">{stats.totalAlerts}</h3>
              <p className="mb-0">Total Alerts</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h3 className="display-4 mb-0">{stats.unverifiedAlerts}</h3>
              <p className="mb-0">Unverified Alerts</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h3 className="display-4 mb-0">{stats.totalUsers}</h3>
              <p className="mb-0">Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h3 className="display-4 mb-0">{stats.verifiedUsers}</h3>
              <p className="mb-0">Verified Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4 nav-fill">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            <i className="bi bi-exclamation-triangle me-2"></i>Alert Management
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people me-2"></i>User Management
          </button>
        </li>
      </ul>

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Alert Verification & Moderation</h5>
            <div className="table-responsive">
              <table className="table table-hover table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Submitted By</th>
                    <th>User Status</th>
                    <th>Alert Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.slice(0, 50).map(alert => (
                    <tr key={alert.id}>
                      <td>{alert.location}</td>
                      <td><span className="badge bg-info">{alert.type}</span></td>
                      <td>
                        <span className={`badge bg-${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td>{alert.createdBy?.email}</td>
                      <td>
                        {alert.createdBy?.verified ? (
                          <span className="badge bg-success">✓ Verified</span>
                        ) : (
                          <span className="badge bg-danger">Not Verified</span>
                        )}
                      </td>
                      <td>
                        {alert.verified ? (
                          <span className="badge bg-success">Verified</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Pending</span>
                        )}
                      </td>
                      <td>
                        {!alert.verified && (
                          <button 
                            className="btn btn-sm btn-success me-1" 
                            onClick={() => verifyAlert(alert.id)}
                            title="Verify this alert as legitimate"
                          >
                            ✓ Verify
                          </button>
                        )}
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => deleteAlert(alert.id, 'Admin moderation')}
                          title="Delete this alert"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">User Management & Verification</h5>
            <div className="table-responsive">
              <table className="table table-hover table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Account Status</th>
                    <th>Verification</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className={u.blocked ? 'table-danger' : ''}>
                      <td>{u.email}</td>
                      <td>{u.name}</td>
                      <td><span className="badge bg-primary">{u.role}</span></td>
                      <td>
                        {u.blocked ? (
                          <span className="badge bg-danger">🚫 Blocked</span>
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>
                      <td>
                        {u.verified ? (
                          <span className="badge bg-success">✓ Verified</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Unverified</span>
                        )}
                      </td>
                      <td>
                        {!u.verified && (
                          <button 
                            className="btn btn-sm btn-success me-1" 
                            onClick={() => verifyUser(u.id)}
                            title="Verify this user/organization"
                          >
                            ✓ Verify
                          </button>
                        )}
                        {!u.blocked && u.role !== 'admin' && (
                          <button 
                            className="btn btn-sm btn-warning me-1" 
                            onClick={() => blockUser(u.id, 'Admin action')}
                            title="Block this user"
                          >
                            Block
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => deleteUser(u.id)}
                            title="Delete user account and their alerts"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
