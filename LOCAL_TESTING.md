# Local Development Testing Guide

## Quick Start

### 1. Automatic Setup

```bash
chmod +x setup-local.sh
./setup-local.sh
```

Then update the generated `.env.local` and `local.settings.json` files.

### 2. Manual Setup

#### 2.1 Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with Auth0 credentials
```

#### 2.2 Backend Setup

```bash
pip install -r requirements.txt
cp local.settings.json.template local.settings.json
# Edit local.settings.json with Cosmos connection string
```

---

## Running Locally

### Terminal 1: Start Backend (Functions)

```bash
func start
```

Expected output:
```
Azure Functions Core Tools
Worker runtime loaded from C:\...
Listening on http://0.0.0.0:7071
Hit CTRL-C to exit...

Functions loaded:
	SubmitAlert: [POST] http://localhost:7071/api/SubmitAlert
	GetAlerts: [GET] http://localhost:7071/api/Alerts
	GetAlert: [GET] http://localhost:7071/api/Alerts/{alertId}
```

### Terminal 2: Start Frontend (React)

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

Visit: http://localhost:3000/

---

## Testing Workflow

### 1. Login Test

1. Click "Sign In with Auth0"
2. You should be redirected to Auth0 login
3. After successful login, redirected back to app
4. You should see your name/email in the navbar

**Expected result**: User authenticated, localStorage has access_token

### 2. Submit Alert Test

1. Fill out the form:
   - Type: Select any disaster type
   - Location: Enter a location
   - Severity: Select a level
   - Message: Enter at least 20 characters

2. Click "Submit Alert"

3. Check function logs:
   ```
   [2026-01-07T22:00:00.000Z] SubmitAlert function processing a request.
   [2026-01-07T22:00:00.001Z] Alert saved successfully: <uuid>
   ```

**Expected result**: 
- Success message appears
- Alert ID shown
- Form clears
- If using Cosmos: Document appears in DB
- If using Table Storage: Entity appears in table

### 3. View Alerts Test

1. Submit 2-3 alerts
2. Scroll down to "Recent Alerts" dashboard
3. Verify pagination works

**Expected result**: All submitted alerts appear in list, newest first

### 4. JWT Token Test

Open browser DevTools → Application → Local Storage:

```
auth0.is.authenticated: true
auth0.cache.cdata: {access_token, id_token, ...}
```

### 5. Logout Test

1. Click user dropdown → Logout
2. Verify redirect to login page
3. Check localStorage is cleared

**Expected result**: User logged out, tokens removed

---

## Troubleshooting Local Testing

### Issue: "Cannot find module 'azure.cosmos'"

**Fix:**
```bash
pip install azure-cosmos
pip install pyjwt
```

### Issue: "COSMOS_CONNECTION_STRING not configured"

**Options:**
1. **Use Table Storage for testing** (faster setup):
   ```json
   {
     "AzureWebJobsStorage": "DefaultEndpointsProtocol=https;AccountName=stgdisaster767816886;AccountKey=...;EndpointSuffix=core.windows.net"
   }
   ```

2. **Use local Cosmos emulator**:
   - Install [Azure Cosmos Emulator](https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator)
   - Connection string: `AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4AB0+/M8=;`

3. **Skip for now**, test without DB write:
   - Comment out container writes in `SubmitAlert/__init__.py`

### Issue: "Auth0 redirect failing"

**Fix**:
1. In Auth0 Dashboard → Applications → Your App → Settings
2. Add to "Allowed Callback URLs": `http://localhost:3000`
3. Add to "Allowed Logout URLs": `http://localhost:3000`
4. Add to "Allowed Web Origins": `http://localhost:3000`
5. Verify `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` in `.env.local`

### Issue: "CORS error when submitting"

**Fix**: Ensure `Host.CORS` is set in `local.settings.json`:
```json
{
  "Host": {
    "CORS": "*"
  }
}
```

### Issue: "401 Unauthorized on GetAlerts"

**Fix**: Auth0 token validation is delegated to frontend, but backend expects Bearer header.

Check:
1. React is sending `Authorization: Bearer <token>` header
2. Token is being retrieved via `getAccessToken()`
3. Function logs show incoming Authorization header

---

## Debugging Tips

### Enable Function Logs

```bash
func start --verbose
```

### Check Network Requests

Browser DevTools → Network tab:
1. Submit form
2. Look for `POST http://localhost:7071/api/SubmitAlert`
3. Check Headers → Authorization
4. Check Response → 201 or error code

### Mock Cosmos DB Responses

In `SubmitAlert/__init__.py`, temporarily replace writes:

```python
# Replace this:
container.create_item(alert)

# With this (for testing):
logging.info(f"Mock: Would save {alert}")
```

### View Access Token

In browser console:
```javascript
await auth0.getAccessToken().then(t => console.log(t))
```

---

## Next: Deploy to Azure

Once local testing passes, follow [DEPLOYMENT_V2.md](../DEPLOYMENT_V2.md) to deploy:
1. Cosmos DB
2. Auth0 (production config)
3. Azure Static Web Apps
4. GitHub Actions CI/CD
