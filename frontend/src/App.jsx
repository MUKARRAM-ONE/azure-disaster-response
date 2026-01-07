import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import { LoginPage } from './components/LoginPage'
import { Navbar } from './components/Navbar'
import { SubmitAlertForm } from './components/SubmitAlertForm'
import { AlertsDashboard } from './components/AlertsDashboard'

function App() {
  const { isLoading, isAuthenticated } = useAuth0()
  const [refreshKey, setRefreshKey] = useState(0)

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div>
      <Navbar />
      <div className="container-lg py-5">
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <div className="text-center text-white mb-5">
              <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '3rem' }}></i>
              <h1 className="display-5 fw-bold mt-3">Disaster Response Platform</h1>
              <p className="lead">Submit and monitor real-time disaster alerts</p>
            </div>

            <SubmitAlertForm onSuccess={() => setRefreshKey(k => k + 1)} />

            <div key={refreshKey}>
              <AlertsDashboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
