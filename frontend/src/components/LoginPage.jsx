import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { login, register, setLoading, loading } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(form)
        setSuccess('Account created. You can now sign in.')
        setMode('login')
      } else {
        await login(form)
        setSuccess('Signed in successfully')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow" style={{ maxWidth: '720px', width: '100%' }}>
        <div className="card-body p-4 p-lg-5">
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '2.5rem' }}></i>
            <div className="ms-3">
              <h1 className="h3 fw-bold mb-1">Disaster Response Platform</h1>
              <p className="mb-0 text-muted">Submit and monitor real-time disaster alerts</p>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="border rounded-3 p-3 h-100">
                <h5 className="fw-semibold mb-2">Why join?</h5>
                <ul className="list-unstyled mb-0 small text-muted">
                  <li className="mb-1">• Post alerts with severity and location</li>
                  <li className="mb-1">• Track latest reports from responders</li>
                  <li className="mb-1">• Collaborate securely with verified users</li>
                </ul>
              </div>
            </div>
            <div className="col-md-6">
              <div className="border rounded-3 p-3 h-100">
                <h5 className="fw-semibold mb-2">Sign in options</h5>
                <ul className="list-unstyled mb-0 small text-muted">
                  <li className="mb-1">• Email + password (built-in)</li>
                  <li className="mb-1">• Google (connect your client ID)</li>
                  <li className="mb-1">• GitHub & Facebook (to be enabled)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 mb-3">
            <button className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setMode('login')}>
              Sign In
            </button>
            <button className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setMode('register')}>
              Create Account
            </button>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form className="row g-3" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="col-12">
                <label className="form-label">Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
              </div>
            )}
            <div className="col-12">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
              <div className="form-text">At least 8 characters.</div>
            </div>
            <div className="col-12 d-grid">
              <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-4">
            <div className="text-center text-muted small mb-2">Social sign-in (requires provider setup)</div>
            <div className="row g-2">
              <div className="col-md-4 d-grid">
                <button className="btn btn-outline-secondary" disabled>
                  <i className="bi bi-google me-2"></i> Continue with Google
                </button>
              </div>
              <div className="col-md-4 d-grid">
                <button className="btn btn-outline-secondary" disabled>
                  <i className="bi bi-github me-2"></i> Continue with GitHub
                </button>
              </div>
              <div className="col-md-4 d-grid">
                <button className="btn btn-outline-secondary" disabled>
                  <i className="bi bi-facebook me-2"></i> Continue with Facebook
                </button>
              </div>
            </div>
            <div className="text-muted small mt-2">Enable by wiring provider OAuth tokens to the backend verification flow.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
