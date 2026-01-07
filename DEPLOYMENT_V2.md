# Disaster Response Platform v2 — Deployment Guide

## Overview

Full-stack deployment of the Disaster Response Platform with:
- **Frontend**: React SPA (Vite) on Azure Static Web Apps
- **Auth**: Auth0 authentication
- **Backend**: Python Azure Functions with Cosmos DB
- **Database**: Azure Cosmos DB (NoSQL)

---

## Prerequisites

- Azure subscription with active billing
- Auth0 account (free tier sufficient)
- GitHub account with repo access
- Azure CLI installed locally
- Node.js 18+ and Python 3.11+

---

## Step 1: Set Up Cosmos DB

### 1.1 Create Cosmos DB Account

```bash
az cosmosdb create \
  --name disaster-response-cosmos \
  --resource-group <RG> \
  --kind GlobalDocumentDB \
  --locations regionName=eastus failoverPriority=0
```

### 1.2 Create Database and Container

```bash
az cosmosdb sql database create \
  --account-name disaster-response-cosmos \
  --resource-group <RG> \
  --name disaster-response

az cosmosdb sql container create \
  --account-name disaster-response-cosmos \
  --database-name disaster-response \
  --resource-group <RG> \
  --name Alerts \
  --partition-key-path /type \
  --throughput 400
```

### 1.3 Get Connection String

```bash
az cosmosdb keys list \
  --name disaster-response-cosmos \
  --resource-group <RG> \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" -o tsv
```

Save this for Function App settings.

---

## Step 2: Set Up Auth0

### 2.1 Create Auth0 Tenant

1. Go to [auth0.com](https://auth0.com)
2. Create a free account and set up a tenant (e.g., `disaster-response.auth0.com`)

### 2.2 Create Single Page Application

1. In Auth0 Dashboard → Applications → Create
2. Name: `Disaster Response Web`
3. Choose: **Single Page Application**
4. Select **React**
5. In **Settings** tab:

   **Allowed Callback URLs:**
   ```
   http://localhost:3000
   https://your-static-web-app.azurestaticapps.net
   ```

   **Allowed Logout URLs:**
   ```
   http://localhost:3000
   https://your-static-web-app.azurestaticapps.net
   ```

   **Allowed Web Origins:**
   ```
   http://localhost:3000
   https://your-static-web-app.azurestaticapps.net
   ```

6. Note your **Domain** and **Client ID**

### 2.3 Create API

1. In Auth0 Dashboard → APIs → Create
2. Name: `Disaster Response API`
3. Identifier: `https://disaster-response-api`
4. Signing Algorithm: `RS256`
5. Click **Create**

---

## Step 3: Update Function App

### 3.1 Update App Settings

Replace the existing Function App (func-disaster-1767817356) settings:

```bash
az functionapp config appsettings set \
  --name func-disaster-1767817356 \
  --resource-group <RG> \
  --settings \
    COSMOS_CONNECTION_STRING="<from-step-1.3>" \
    AUTH0_DOMAIN="your-tenant.auth0.com" \
    AUTH0_AUDIENCE="https://disaster-response-api"
```

### 3.2 Update requirements.txt

The function needs Azure Cosmos DB SDK:

```
azure-functions
azure-cosmos
pyjwt
```

---

## Step 4: Create Azure Static Web Apps

### 4.1 Create SWA Resource

```bash
az staticwebapp create \
  --name disaster-response-web \
  --resource-group <RG> \
  --source https://github.com/MUKARRAM-ONE/azure-disaster-response \
  --location eastus \
  --branch main \
  --repository-token <GITHUB_TOKEN> \
  --app-location "frontend" \
  --api-location "." \
  --output-location "dist"
```

### 4.2 Configure Environment Variables in SWA

In Azure Portal → Static Web Apps → `disaster-response-web` → Configuration:

```
VITE_AUTH0_DOMAIN = your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID = <from-auth0-app>
VITE_AUTH0_AUDIENCE = https://disaster-response-api
VITE_AUTH0_REDIRECT_URI = https://disaster-response-web.azurestaticapps.net
VITE_API_URL = https://func-disaster-1767817356.azurewebsites.net/api
```

---

## Step 5: Configure GitHub Secrets

In GitHub Repo Settings → Secrets and Variables → Actions:

1. **AZURE_STATIC_WEB_APPS_API_TOKEN**: Deployment token from SWA resource
2. **FUNCTION_APP_NAME**: `func-disaster-1767817356`
3. **FUNCTION_APP_PUBLISH_PROFILE**: Download from Function App → Deployment Center

---

## Step 6: Deploy

### 6.1 Push Code

```bash
git add .
git commit -m "v2: React + Auth0 + Cosmos DB"
git push origin main
```

GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
1. Build React frontend
2. Deploy to Azure Static Web Apps
3. Deploy Function App updates

### 6.2 Verify Deployment

- **Frontend**: https://disaster-response-web.azurestaticapps.net/
- **Functions**: https://func-disaster-1767817356.azurewebsites.net/api/SubmitAlert

---

## Step 7: Test

### 7.1 Local Testing

```bash
# Terminal 1: Start Functions
cd /workspaces/azure-disaster-response
func start

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000 and test:
1. Click "Sign In with Auth0"
2. Complete login
3. Fill form and submit alert
4. Verify alert appears in dashboard

### 7.2 Cloud Testing

1. Navigate to: https://disaster-response-web.azurestaticapps.net/
2. Sign in with Auth0
3. Submit and view alerts

---

## Troubleshooting

### 401 Unauthorized on Alerts

**Issue**: "Unauthorized" when fetching alerts  
**Fix**: Ensure `Authorization: Bearer <token>` header is sent
- Check Auth0 token is being retrieved
- Verify function endpoints are accepting Bearer tokens

### Cosmos DB Connection String Error

**Issue**: "COSMOS_CONNECTION_STRING not configured"  
**Fix**: 
```bash
az functionapp config appsettings list \
  --name func-disaster-1767817356 \
  --resource-group <RG> | grep COSMOS
```

### CORS Errors

**Issue**: "Access-Control-Allow-Origin" missing  
**Fix**: All endpoints return CORS headers; ensure `Access-Control-Allow-Origin: *`

### Auth0 Redirect Loop

**Issue**: Stuck on login page  
**Fix**: 
1. Verify callback URLs in Auth0 app settings
2. Check `VITE_AUTH0_REDIRECT_URI` matches deployment URL

---

## Monitoring

### Function App Logs

```bash
az functionapp log tail \
  --name func-disaster-1767817356 \
  --resource-group <RG>
```

### Cosmos DB Metrics

In Azure Portal → Cosmos DB → Metrics:
- Monitor RU consumption
- Watch for throttling (429 errors)

### Static Web App Build Logs

GitHub → Actions → Latest workflow run

---

## Next Steps

1. **Rotate Auth0 credentials** periodically
2. **Scale Cosmos DB** if RU consumption exceeds 400/s
3. **Add audit logging** for alert submissions
4. **Implement alert filtering/search** in dashboard
5. **Set up alerts** for high severity incidents

---

## Costs (Estimate)

| Service | Tier | Est. Cost/month |
|---------|------|-----------------|
| Cosmos DB | 400 RU/s | ~$23 |
| Function App | Consumption | ~$5 (under 1M invocations) |
| Static Web Apps | Standard | ~$9 |
| **Total** | | ~**$37** |

---

## Support

For issues:
1. Check Azure Portal diagnostics
2. Review function logs
3. Test with curl directly
4. Verify Auth0 token expiry
