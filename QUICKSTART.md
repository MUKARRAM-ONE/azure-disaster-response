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
    # Edit local.settings.json with your Azure Storage connection string
   ```

3. **Start the Function App**
   ```bash
   func start
   ```

4. **Open the frontend**
   - Update `FUNCTION_URL` in index.html to `http://localhost:7071/api/SubmitAlert`
   - Open index.html in a browser

## Azure Deployment (10 minutes)

### Step 1: Deploy Infrastructure (already deployed)

```bash
# Login to Azure
az login --use-device-code

# Create resource group
az group create --name disaster-response-rg --location eastus

# Create storage + table
STORAGE_ACCOUNT=stgdisaster767816886
az storage account create --name $STORAGE_ACCOUNT --resource-group disaster-response-rg --location eastasia --sku Standard_LRS
az storage table create --name Alerts --account-name $STORAGE_ACCOUNT

# Create Function App (Python 3.11)
FUNCTION_APP=func-disaster-1767817356
az functionapp create --name $FUNCTION_APP --resource-group disaster-response-rg --consumption-plan-location eastasia --runtime python --runtime-version 3.11 --functions-version 4 --storage-account $STORAGE_ACCOUNT --os-type Linux

# Configure app settings
STORAGE_CONNECTION=$(az storage account show-connection-string --name $STORAGE_ACCOUNT --resource-group disaster-response-rg --query connectionString -o tsv)
az functionapp config appsettings set --name $FUNCTION_APP --resource-group disaster-response-rg --settings AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION" TABLE_NAME=Alerts
```

### Step 2: Deploy Function App Code

```bash
func azure functionapp publish func-disaster-1767817356 --python
```

### Step 3: Deploy Frontend

```bash
# Update index.html with the function URL
# const FUNCTION_URL = 'https://func-disaster-1767817356.azurewebsites.net/api/SubmitAlert';
# Host via Static Web Apps or any static hosting
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
- Verify Azure Storage connection settings
- Ensure CORS is configured correctly

### Cannot save to database
- Verify Storage connection string and table name
- Check that TABLE_NAME is set to Alerts
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
