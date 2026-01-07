import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'

const domain = import.meta.env.VITE_AUTH0_DOMAIN || 'your-auth0-domain.auth0.com'
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'your-auth0-client-id'
const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE || 'https://disaster-response-api'
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
)
