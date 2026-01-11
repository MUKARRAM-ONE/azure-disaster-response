import { useState } from 'react'
import { LoginPage } from './components/LoginPage'
import { Navbar } from './components/Navbar'
import { SubmitAlertForm } from './components/SubmitAlertForm'
import { AlertsDashboard } from './components/AlertsDashboard'
import { AdminDashboard } from './components/AdminDashboard'
import { useAuth } from './auth/AuthContext'

function App() {
  const { isAuthenticated } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState('alerts')

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div>
      <Navbar />
      <div className="container-lg py-5">
        <div className="row">
          <div className="col-lg-10 offset-lg-1">
            <div className="text-center text-white mb-5">
              <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '3rem' }}></i>
              <h1 className="display-5 fw-bold mt-3">Disaster Response Platform</h1>
              <p className="lead">Submit and monitor real-time disaster alerts</p>
            </div>

            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('alerts')}
                >
                  <i className="bi bi-list-check me-2"></i>Alerts
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'submit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('submit')}
                >
                  <i className="bi bi-plus-circle me-2"></i>Submit Alert
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => setActiveTab('admin')}
                >
                  <i className="bi bi-speedometer2 me-2"></i>Dashboard
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            {activeTab === 'alerts' && (
              <div key={refreshKey}>
                <AlertsDashboard />
              </div>
            )}

            {activeTab === 'submit' && (
              <SubmitAlertForm onSuccess={() => {
                setRefreshKey(k => k + 1)
                setActiveTab('alerts')
              }} />
            )}

            {activeTab === 'admin' && (
              <div key={refreshKey}>
                <AdminDashboard />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
