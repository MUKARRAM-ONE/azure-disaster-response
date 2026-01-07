# Disaster Response Frontend

React SPA with Auth0 authentication for disaster alert submission and monitoring.

## Setup

### 1. Environment Variables

Create `.env.local` in the frontend directory:

```
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://disaster-response-api
VITE_AUTH0_REDIRECT_URI=http://localhost:3000
VITE_API_URL=http://localhost:7071/api
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Local Development

```bash
npm run dev
```

Visit http://localhost:3000

### 4. Build for Production

```bash
npm run build
```

Output in `dist/` directory, ready for Azure Static Web Apps.

## Auth0 Configuration

1. Create Auth0 app (React SPA):
   - Callback URL: `http://localhost:3000`
   - Logout URL: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`

2. Create Auth0 API:
   - Identifier: `https://disaster-response-api`
   - Signing Algorithm: RS256

3. Add API to your app's settings

## Components

- **LoginPage**: Auth0 login entry point
- **Navbar**: User profile & logout
- **SubmitAlertForm**: Create new disaster alerts
- **AlertsDashboard**: View paginated alerts

## API Integration

All API calls include `Authorization: Bearer <access_token>` header for JWT validation on backend.
