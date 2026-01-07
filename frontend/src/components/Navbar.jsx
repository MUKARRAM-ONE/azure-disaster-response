import { useAuth0 } from '@auth0/auth0-react'

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth0()

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
      <div className="container-fluid">
        <a className="navbar-brand fw-bold" href="/">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Disaster Response
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <span className="nav-link text-white">
                    <i className="bi bi-person-circle me-2"></i>
                    {user?.name || user?.email || 'User'}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link text-white"
                    onClick={() => logout({ returnTo: window.location.origin })}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
