import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import axios from 'axios'
import './SubmitAlertForm.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api'

export function SubmitAlertForm({ onSuccess }) {
  const { getAccessToken } = useAuth0()
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    severity: 'Low',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate
    if (!formData.type || !formData.location || formData.message.length < 20) {
      setError('All fields required. Message must be at least 20 characters.')
      setLoading(false)
      return
    }

    try {
      const token = await getAccessToken()
      const response = await axios.post(`${API_URL}/SubmitAlert`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      setSuccess(`Alert submitted successfully! ID: ${response.data.alertId}`)
      setFormData({ type: '', location: '', severity: 'Low', message: '' })
      if (onSuccess) onSuccess(response.data.alertId)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit alert')
      console.error('Submit error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h2 className="mb-0"><i className="bi bi-megaphone-fill me-2"></i>Submit Disaster Alert</h2>
      </div>
      <div className="card-body p-4">
        {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-circle-fill me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>}
        
        {success && <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>{success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="type" className="form-label"><i className="bi bi-tag-fill me-2"></i>Disaster Type</label>
            <select
              className="form-select form-select-lg"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select disaster type...</option>
              <option value="Flood">🌊 Flood</option>
              <option value="Fire">🔥 Fire</option>
              <option value="Earthquake">🏚️ Earthquake</option>
              <option value="Hurricane">🌀 Hurricane</option>
              <option value="Tornado">🌪️ Tornado</option>
              <option value="Tsunami">🌊 Tsunami</option>
              <option value="Landslide">⛰️ Landslide</option>
              <option value="Other">⚠️ Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="location" className="form-label"><i className="bi bi-geo-alt-fill me-2"></i>Location</label>
            <input
              type="text"
              className="form-control form-control-lg"
              id="location"
              name="location"
              placeholder="e.g., Downtown Seattle, WA"
              value={formData.location}
              onChange={handleChange}
              required
            />
            <div className="form-text">Provide specific address, city, or region</div>
          </div>

          <div className="mb-4">
            <label className="form-label"><i className="bi bi-speedometer2 me-2"></i>Severity Level</label>
            <div className="d-flex gap-2 flex-wrap">
              {['Low', 'Medium', 'High', 'Critical'].map(level => (
                <div key={level} className="form-check">
                  <input
                    type="radio"
                    className="btn-check"
                    name="severity"
                    id={`severity${level}`}
                    value={level}
                    checked={formData.severity === level}
                    onChange={handleChange}
                  />
                  <label className={`btn btn-outline-${getSeverityClass(level)}`} htmlFor={`severity${level}`}>
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="message" className="form-label"><i className="bi bi-chat-left-text-fill me-2"></i>Alert Message</label>
            <textarea
              className="form-control"
              id="message"
              name="message"
              rows="4"
              placeholder="Describe the situation, affected areas, and any immediate actions needed..."
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <div className={`form-text ${formData.message.length < 20 ? 'text-danger' : 'text-success'}`}>
              {formData.message.length < 20 ? `${20 - formData.message.length} more characters needed` : `${formData.message.length} characters`}
            </div>
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="bi bi-send-fill me-2"></i>
                  Submit Alert
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getSeverityClass(level) {
  const classes = { Low: 'success', Medium: 'warning', High: 'danger', Critical: 'dark' }
  return classes[level] || 'secondary'
}
