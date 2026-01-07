# Azure Disaster Response Platform v2 — Spec

**Surface:** Agent  
**Feature:** disaster-response-v2  
**Stage:** spec  
**Date:** 2026-01-07

---

## Objective
Migrate the Disaster Response Platform from static HTML + Table Storage to a React SPA with Auth0 authentication and Cosmos DB, deployed on Azure Static Web Apps.

---

## In Scope
1. **Frontend:** React (Vite) with Auth0 SDK for user login/logout
2. **Authentication:** Auth0 (OAuth2/OIDC); only authenticated users can submit alerts
3. **Backend APIs:**
   - `POST /api/SubmitAlert` — Submit disaster alert (auth required)
   - `GET /api/Alerts` — List alerts with pagination/filtering (auth required)
   - `GET /api/Alerts/{id}` — Fetch single alert (auth required)
4. **Database:** Azure Cosmos DB (NoSQL) instead of Table Storage; partition by type
5. **UI Components:**
   - Login page (Auth0)
   - Dashboard (list of recent alerts)
   - Create Alert form (with form validation)
   - Alert detail view
6. **Deployment:** Azure Static Web Apps (SWA) with Function Apps backend
7. **Security:** JWT token validation in Functions; CORS for SWA origin

---

## Out of Scope
- Advanced analytics/dashboards
- Real-time WebSocket alerts
- Mobile app
- Multi-language support

---

## External Dependencies
- **Auth0 tenant** (free tier or custom domain)
- **Azure Cosmos DB** account (provisioned; partition key: `/type`)
- **Azure Static Web Apps** (standard tier or higher)
- **Azure Functions** (existing; extend with Cosmos client)

---

## Key Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| **React + Vite** | Fast, modern, SPA best for auth flows |
| **Auth0** | Managed auth, no custom JWT/session logic needed |
| **Cosmos DB** | Scalable, geo-replicated, NoSQL suits flexible alert schema |
| **Static Web Apps** | Native Azure integration, auto-builds from repo, built-in auth support |
| **Access token in API** | MSAL library validates `Authorization: Bearer <token>` |

---

## Architecture

```
┌─────────────────────────────────────┐
│   Azure Static Web Apps (SWA)       │
│   - React SPA (Vite)                │
│   - Auth0 config in .env            │
│   - Auto-deploys from main branch   │
└─────────────────┬───────────────────┘
                  │ HTTP(S) + JWT
┌─────────────────▼───────────────────┐
│   Azure Functions                   │
│   - SubmitAlert (POST)              │
│   - GetAlerts (GET)                 │
│   - GetAlert/{id} (GET)             │
│   - JWT validation middleware       │
└─────────────────┬───────────────────┘
                  │ Cosmos SDK
┌─────────────────▼───────────────────┐
│   Azure Cosmos DB                   │
│   - Container: Alerts               │
│   - Partition Key: /type            │
│   - TTL: not set (permanent)        │
└─────────────────────────────────────┘
```

---

## Interfaces & API Contracts

### POST /api/SubmitAlert
**Auth:** Required (Bearer token)  
**Request:**
```json
{
  "type": "Flood",
  "location": "Seattle, WA",
  "severity": "High",
  "message": "Heavy rainfall causing street flooding..."
}
```
**Response (201):**
```json
{
  "alertId": "uuid",
  "data": {
    "type": "Flood",
    "location": "Seattle, WA",
    "severity": "High",
    "message": "...",
    "timestamp": "2026-01-07T22:00:00Z",
    "userId": "auth0|...",
    "id": "uuid"
  }
}
```

### GET /api/Alerts?limit=20&offset=0
**Auth:** Required (Bearer token)  
**Response (200):**
```json
{
  "alerts": [
    { "id": "...", "type": "Fire", "location": "...", "severity": "...", "timestamp": "...", "userId": "..." },
    ...
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### GET /api/Alerts/{id}
**Auth:** Required (Bearer token)  
**Response (200):**
```json
{
  "id": "uuid",
  "type": "Earthquake",
  "location": "...",
  "severity": "...",
  "message": "...",
  "timestamp": "...",
  "userId": "..."
}
```

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Auth latency | < 200ms (Auth0 tokens cached) |
| API response (list) | < 500ms for 100 items |
| Page load (SPA) | < 2s (Vite optimized) |
| Uptime | 99.95% (SWA SLA) |
| Database RU/s | 400 (auto-scale Cosmos) |

---

## Deployment Strategy

1. **Infrastructure (IaC):**
   - Cosmos DB account + container (provisioned via Bicep or Azure CLI)
   - Static Web Apps resource (linked to GitHub repo)
   - Function App (existing; update app settings for Cosmos)

2. **Static Web Apps Integration:**
   - Create `staticwebapp.config.json` for SWA route config
   - Fallback routes to `/index.html` for React routing
   - Environment variables in SWA settings (Auth0 client ID, API URL)

3. **Secrets & Settings:**
   - Auth0 credentials in SWA environment
   - Cosmos connection string in Function App settings
   - CORS headers configured in Functions

---

## Tasks (High-Level)

1. Set up Cosmos DB container in Azure
2. Create React + Vite project structure
3. Install & configure Auth0 SDK (Auth0-React)
4. Build UI components (Login, Dashboard, Form, Details)
5. Update Function App backend for Cosmos DB
6. Add GET /api/Alerts and /api/Alerts/{id} functions
7. Configure Static Web Apps in Azure
8. Environment-based config (dev, prod)
9. Integration tests (auth flow, API calls)
10. Deploy and verify

---

## Success Criteria

- [ ] User can log in with Auth0
- [ ] Only signed-in users can see form and submit alerts
- [ ] Alert data saved to Cosmos DB
- [ ] Dashboard displays paginated alerts
- [ ] API validates JWT tokens
- [ ] SPA deployed on Azure Static Web Apps
- [ ] Logout clears session and redirects to login
- [ ] No hardcoded secrets in repo
