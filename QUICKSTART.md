# Quick Start Guide - Azure Disaster Response Platform

## Prerequisites
- Azure account (free tier works)
- Azure CLI installed
- Python 3.11+ installed
- Azure Functions Core Tools v4

## Local Development (5 minutes)

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure local settings**
   ```bash
   cp local.settings.json.template local.settings.json
   # Edit local.settings.json with your Cosmos DB credentials
   ```

3. **Start the Function App**
   ```bash
   func start
   ```

4. **Open the frontend**
   - Update `FUNCTION_URL` in index.html to `http://localhost:7071/api/SubmitAlert`
   - Open index.html in a browser

## Azure Deployment (10 minutes)

### Step 1: Deploy Infrastructure

```bash
# Login to Azure
az login

# Create resource group
az group create --name disaster-response-rg --location eastus

# Deploy Bicep template
az deployment group create \
  --resource-group disaster-response-rg \
  --template-file main.bicep \
  --parameters environment=prod

# Get outputs
az deployment group show \
  --resource-group disaster-response-rg \
  --name main \
  --query properties.outputs
```

### Step 2: Deploy Function App

```bash
# Get function app name from outputs
FUNCTION_APP_NAME=$(az deployment group show \
  --resource-group disaster-response-rg \
  --name main \
  --query properties.outputs.functionAppName.value -o tsv)

# Deploy
func azure functionapp publish $FUNCTION_APP_NAME
```

### Step 3: Deploy Frontend

```bash
# Get function URL from outputs
FUNCTION_URL=$(az deployment group show \
  --resource-group disaster-response-rg \
  --name main \
  --query properties.outputs.functionAppUrl.value -o tsv)

# Update index.html with the function URL
# Change: const FUNCTION_URL = '/api/SubmitAlert';
# To: const FUNCTION_URL = 'https://your-function-app.azurewebsites.net/api/SubmitAlert';

# Deploy to Static Web App (via GitHub or manual upload)
```

### Step 4: Test the Deployment

```bash
curl -X POST https://your-function-app.azurewebsites.net/api/SubmitAlert \
  -H "Content-Type: application/json" \
  -d '{
    "location": "San Francisco, CA",
    "type": "earthquake",
    "severity": "high"
  }'
```

## Production Checklist

Before going to production, update:

- [ ] CORS settings in main.bicep (line 177-180)
- [ ] Authentication level in SubmitAlert/function.json (line 4)
- [ ] Function URL in index.html
- [ ] Consider adding monitoring and alerts
- [ ] Set up custom domain for Static Web App
- [ ] Enable Application Insights for logging

## Troubleshooting

### Function not responding
- Check Azure Function logs in portal
- Verify Cosmos DB connection settings
- Ensure CORS is configured correctly

### Cannot save to database
- Verify Cosmos DB credentials
- Check container and database names
- Review Function App configuration

### Frontend errors
- Check browser console for errors
- Verify FUNCTION_URL is correct
- Test function endpoint directly with curl

## Support

For issues, check:
- README.md for detailed documentation
- Azure Portal logs for runtime errors
- GitHub Issues for community support
