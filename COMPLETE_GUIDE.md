# Disaster Response Platform v2 — Complete Implementation Guide

## 📋 Overview

This is a **production-ready**, full-stack disaster response application built with:
- **Frontend**: React SPA (Vite) with Auth0 authentication
- **Backend**: Python Azure Functions with Cosmos DB
- **Deployment**: Azure Static Web Apps + GitHub Actions CI/CD
- **Database**: Azure Cosmos DB (NoSQL)

---

## 🚀 Quick Start (Choose Your Path)

### Path 1: Local Testing First (Recommended)

```bash
# 1. Run automated setup
chmod +x setup-local.sh
./setup-local.sh

# 2. Follow LOCAL_TESTING.md for detailed steps
# 3. Update .env.local with Auth0 credentials
# 4. Terminal 1: func start (backend)
# 5. Terminal 2: cd frontend && npm run dev (frontend)
# 6. Visit http://localhost:3000
```

**Duration**: 15-20 minutes  
**Benefits**: Test locally before cloud deployment, catch issues early

---

### Path 2: Direct Azure Deployment

```bash
# 1. Login to Azure
az login

# 2. Run automated deployment script
chmod +x deploy-azure.sh
./deploy-azure.sh

# 3. Follow prompts for GitHub token, Auth0 credentials
# 4. Script creates all resources automatically
```

**Duration**: 10-15 minutes (script runs in parallel)  
**Benefits**: Faster cloud setup, all infrastructure automated

---

## 📁 Project Structure

```
azure-disaster-response/
├── frontend/                          # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginPage.jsx         # Auth0 login
│   │   │   ├── AlertsDashboard.jsx   # List + filter alerts
│   │   │   ├── SubmitAlertForm.jsx   # Create alert
│   │   │   └── Navbar.jsx            # User profile
│   │   ├── App.jsx                   # Main app
│   │   └── main.jsx                  # Auth0 setup
│   ├── vite.config.js
│   └── package.json
│
├── SubmitAlert/                       # POST /api/SubmitAlert
│   ├── __init__.py
│   └── function.json
│
├── GetAlerts/                         # GET /api/Alerts
│   ├── index.py
│   └── function.json
│
├── GetAlert/                          # GET /api/Alerts/{id}
│   ├── index.py
│   └── function.json
│
├── .github/
│   └── workflows/deploy.yml          # CI/CD automation
│
├── DEPLOYMENT_V2.md                  # Cloud deployment guide
├── LOCAL_TESTING.md                  # Local testing guide
├── setup-local.sh                    # Local setup automation
├── deploy-azure.sh                   # Azure deployment automation
└── requirements.txt                  # Python dependencies
```

---

## 🔑 Key Features

### ✅ Authentication
- **Auth0 OAuth2/OIDC** login flow
- JWT Bearer token validation on all APIs
- User profile display + logout
- Auto-redirect for unauthenticated users

### ✅ Alert Management
- **Create** new disaster alerts (authenticated users only)
- **List** alerts with pagination (20 per page)
- **Filter** by disaster type, severity, location
- **Search** location in real-time
- **View** alert details

### ✅ Deployment
- **Azure Static Web Apps** for frontend
- **Azure Functions** (v4, Python 3.11) for backend
- **Cosmos DB** for scalable data storage
- **GitHub Actions** for CI/CD

### ✅ Developer Experience
- **Local testing** with local functions + Auth0
- **Automated setup** scripts for local & cloud
- **CORS** enabled for frontend-backend communication
- **Error handling** with detailed logging

---

## 🛠 Setup Instructions

### 1️⃣ Prerequisites

```bash
# Install required tools
- Node.js 18+
- Python 3.11+
- Azure CLI
- Azure Functions Core Tools
- Git

# Create accounts (if not existing)
- GitHub account (for CI/CD)
- Auth0 account (free tier: https://auth0.com/signup)
- Azure subscription
```

### 2️⃣ Local Setup

```bash
./setup-local.sh
```

Then follow [LOCAL_TESTING.md](LOCAL_TESTING.md) for:
- Auth0 configuration
- Running local functions
- Testing workflows
- Troubleshooting tips

### 3️⃣ Auth0 Configuration

1. Create Auth0 App (Single Page Application):
   - Callback URLs: `http://localhost:3000`
   - Logout URLs: `http://localhost:3000`
   - Web Origins: `http://localhost:3000`

2. Create Auth0 API:
   - Identifier: `https://disaster-response-api`
   - Signing Algorithm: `RS256`

3. Note:
   - Domain: `your-tenant.auth0.com`
   - Client ID: `xxxxxxxxxxxxxxxxxxxx`

### 4️⃣ Azure Deployment

```bash
./deploy-azure.sh
```

The script will:
- Create resource group
- Deploy Cosmos DB (database + container)
- Create storage account
- Deploy Function App (Python runtime)
- Deploy Azure Static Web Apps
- Configure all settings

**Or manually follow**: [DEPLOYMENT_V2.md](DEPLOYMENT_V2.md)

### 5️⃣ Test Cloud App

1. Visit: `https://your-swa-name.azurestaticapps.net/`
2. Login with Auth0
3. Submit a test alert
4. View dashboard

---

## 🔐 Security Considerations

### ✅ Implemented
- JWT Bearer token validation on all endpoints
- CORS restricted to SWA origin (in production)
- No hardcoded secrets (all in app settings)
- Environment-based config (dev/prod)

### ⚠️ Before Production
- [ ] Enable SQL injection prevention in Cosmos queries
- [ ] Implement rate limiting on submit endpoint
- [ ] Add audit logging for alert submissions
- [ ] Rotate Auth0 credentials periodically
- [ ] Enable Cosmos DB firewall
- [ ] Use managed identities instead of connection strings
- [ ] Add request validation schema

---

## 📊 API Reference

### POST /api/SubmitAlert
**Auth**: Required (Bearer token)

```bash
curl -X POST https://func-app.azurewebsites.net/api/SubmitAlert \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Flood",
    "location": "Seattle, WA",
    "severity": "High",
    "message": "Heavy rainfall causing street flooding in downtown area"
  }'
```

**Response** (201):
```json
{
  "alertId": "uuid",
  "data": {
    "id": "uuid",
    "type": "Flood",
    "location": "Seattle, WA",
    "severity": "High",
    "message": "...",
    "timestamp": "2026-01-07T22:00:00Z"
  }
}
```

### GET /api/Alerts
**Auth**: Required (Bearer token)

```bash
curl -X GET "https://func-app.azurewebsites.net/api/Alerts?limit=20&offset=0" \
  -H "Authorization: Bearer <token>"
```

**Response** (200):
```json
{
  "alerts": [...],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### GET /api/Alerts/{id}
**Auth**: Required (Bearer token)

```bash
curl -X GET "https://func-app.azurewebsites.net/api/Alerts/uuid" \
  -H "Authorization: Bearer <token>"
```

---

## 🧪 Testing

### Local Testing
Follow [LOCAL_TESTING.md](LOCAL_TESTING.md) for:
- Login flow validation
- Alert submission test
- Pagination & filtering test
- Logout verification

### Cloud Testing
1. Deploy via `deploy-azure.sh` or manual steps
2. Visit SWA URL
3. Complete end-to-end user workflow
4. Monitor Function logs: `az functionapp log tail`
5. Check Cosmos metrics in Azure Portal

### CI/CD Testing
```bash
git push origin main
# GitHub Actions automatically runs tests and deploys
# Check: https://github.com/your-repo/actions
```

---

## 📈 Monitoring & Maintenance

### View Logs

**Function App Logs:**
```bash
az functionapp log tail \
  --name func-disaster-response \
  --resource-group disaster-response-rg
```

**Build Logs:**
- GitHub → Actions → Select workflow run

### Check Metrics

**Cosmos DB:**
- Azure Portal → Cosmos DB → Metrics
- Monitor: RU consumption, latency, throughput

**Function App:**
- Azure Portal → Function App → Metrics
- Monitor: Request count, execution time, errors

### Cost Management

**Estimate Monthly Cost:**
- Cosmos DB (400 RU/s): ~$23
- Function App (consumption): ~$5-10
- Static Web Apps: ~$9
- **Total**: ~$37-42/month

**Optimize:**
- Auto-scale Cosmos RU down if low traffic
- Use consumption plan for Functions
- Enable CDN caching for static assets

---

## 🔄 CI/CD Pipeline

The `.github/workflows/deploy.yml` automatically:
1. Builds React frontend (Vite)
2. Runs tests
3. Deploys to Azure Static Web Apps
4. Deploys Function code
5. Notifies on success/failure

**Trigger**: Push to `main` branch

**Skip deployment**: Add `[skip ci]` to commit message

---

## 🐛 Troubleshooting

### "401 Unauthorized on Alerts"
- Check `Authorization: Bearer <token>` header is sent
- Verify token is not expired
- Ensure Auth0 API audience matches config

### "Cosmos connection string not configured"
```bash
# Verify setting
az functionapp config appsettings list \
  --name func-disaster-response \
  --resource-group disaster-response-rg
```

### "CORS errors"
- Check function returns `Access-Control-Allow-Origin: *`
- Verify SWA origin is allowed
- Clear browser cache

### "Auth0 redirect loop"
1. Check callback URLs in Auth0 dashboard
2. Verify `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID`
3. Clear browser cookies

### "Function deploy fails"
```bash
# Check deployment logs
az functionapp deployment source show-logs \
  --name func-disaster-response \
  --resource-group disaster-response-rg
```

---

## 📚 Additional Resources

- [Auth0 React SDK Docs](https://auth0.com/docs/quickstart/spa/react)
- [Azure Functions Python Guide](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-python)
- [Cosmos DB Best Practices](https://docs.microsoft.com/en-us/azure/cosmos-db/best-practices)
- [Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)

---

## 🎯 Next Steps (Roadmap)

### Phase 2 (In Progress)
- [x] Local testing automation
- [x] Alert filtering & search
- [ ] Admin dashboard
- [ ] Alert clustering by location
- [ ] Real-time WebSocket updates

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Map visualization
- [ ] Advanced analytics dashboard
- [ ] Machine learning for severity prediction

---

## 📞 Support

For issues:
1. Check [LOCAL_TESTING.md](LOCAL_TESTING.md) troubleshooting
2. Review function logs
3. Check Azure Portal diagnostics
4. Review GitHub Actions logs
5. Create GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment details

---

## 📄 License

MIT License - see LICENSE file

---

**Built with ❤️ for disaster response communities**
