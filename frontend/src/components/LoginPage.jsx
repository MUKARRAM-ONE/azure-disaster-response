import { useAuth0 } from '@auth0/auth0-react'

export function LoginPage() {
  const { loginWithRedirect } = useAuth0()

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body text-center p-5">
          <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '3rem', color: '#667eea', marginBottom: '20px' }}></i>
          <h1 className="display-5 fw-bold mb-3">Disaster Response</h1>
          <p className="lead text-muted mb-4">
            Real-time disaster alerts powered by the community
          </p>
          <button
            className="btn btn-primary btn-lg btn-submit w-100"
            onClick={() => loginWithRedirect()}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Sign In with Auth0
          </button>
          <p className="text-muted mt-4 small">
            Only authenticated users can submit and view disaster alerts
          </p>
        </div>
      </div>
    </div>
  )
}
