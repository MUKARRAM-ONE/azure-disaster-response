# 🚀 Disaster Response Platform - Deployment Guide

## ✅ Deployment Status

**Successfully deployed to Azure!**
- Function App: `func-disaster-1767817356`
- Storage: `stgdisaster767816886`
- Region: East Asia
- Live URL: https://func-disaster-1767817356.azurewebsites.net/api/SubmitAlert

## Prerequisites
- Python 3.11+ installed
- Azure Student subscription
- Azure Functions Core Tools v4
- Git

## 📦 Local Development Setup

### Step 1: Install Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Azure Functions Core Tools (if not already installed)
# For Ubuntu/Debian:
sudo apt-get install azure-functions-core-tools-4

# For macOS:
brew tap azure/functions
brew install azure-functions-core-tools@4
```

### Step 2: Configure Local Settings
```bash
# Copy template and update with your Azure Storage connection string
cp local.settings.json.template local.settings.json

# Edit local.settings.json with your storage account credentials
# (Already configured with deployed storage: stgdisaster767816886)
```

### Step 3: Start the Function App Locally
```bash
# Start the Azure Functions runtime
func start
```

Your function will be available at: `http://localhost:7071/api/SubmitAlert`

### Step 4: Open the Frontend
```bash
# Open index.html in your browser
# On Codespaces, you can use the built-in preview
# Or simply open: http://localhost:7071/index.html
```

---

## ☁️ Azure Deployment

### Option 1: Deploy with Azure CLI (Recommended)

#### Step 1: Login to Azure
```bash
az login --use-device-code
```

#### Step 2: Create Resource Group
```bash
az group create \
  --name disaster-response-rg \
  --location eastus
```

#### Step 3: Already Deployed! ✅

**Created Resources:**
- Storage Account: `stgdisaster767816886` (East Asia)
- Table: `Alerts`
- Function App: `func-disaster-1767817356` (Python 3.11)

#### Step 5: Deploy Function Code
```bash
# Deploy the function to Azure
func azure functionapp publish func-disasterresponse

# Replace 'func-disasterresponse' with your actual function app name
```

#### Step 6: Update Frontend URL
Edit `index.html` and change the `AZURE_FUNCTION_URL`:
```javascript
const AZURE_FUNCTION_URL = 'https://func-disasterresponse.azurewebsites.net/api/SubmitAlert';
```

#### Step 7: Deploy Static Website
```bash
# Option A: Deploy to Static Web App
az staticwebapp create \
  --name swa-disasterresponse \
  --resource-group disaster-response-rg \
  --source . \
  --location eastus \
  --branch main \
  --app-location "/" \
  --output-location "/"

# Option B: Upload to Storage Account Static Website
az storage blob upload-batch \
  --account-name stdisasterresponse \
  --destination '$web' \
  --source . \
  --pattern "*.html"
```

---

### Option 2: Deploy via VS Code Extension

1. Install "Azure Functions" extension in VS Code
2. Click Azure icon in sidebar
3. Sign in to your Azure account
4. Right-click on "Functions" → "Deploy to Function App"
5. Follow the prompts to create/select resources

---

## 🧪 Testing Your Deployment

### Test the API with curl:
```bash
curl -X POST https://func-disasterresponse.azurewebsites.net/api/SubmitAlert \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Flood",
    "location": "Seattle, WA",
    "severity": "High",
    "message": "Heavy rainfall causing flash floods in downtown area. Roads are impassable."
  }'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Alert submitted successfully",
  "alertId": "alert-1234567890-abc123",
  "data": {
    "id": "alert-1234567890-abc123",
    "location": "Seattle, WA",
    "type": "Flood",
    "severity": "High",
    "message": "Heavy rainfall causing flash floods...",
    "timestamp": "2026-01-06T16:55:00.000Z",
    "status": "active"
  }
}
```

---

## 📊 View Data in Azure Portal (Table Storage)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Storage Account: `stgdisaster767816886`
3. Select "Storage browser" or "Tables"
4. Click on "Alerts" table
5. View all submitted alert entities

---

## 🔧 Troubleshooting

### Issue: Function not working locally
```bash
# Check Python version (should be 3.11+)
python3 --version

# Reinstall dependencies
pip install -r requirements.txt

# Check if port 7071 is available
lsof -i :7071
```

### Issue: CORS errors in browser
- Ensure `host.json` has CORS settings
- Check browser console for specific errors
- Verify function is running and accessible

### Issue: Table Storage connection failed
```bash
# Get storage connection string
az storage account show-connection-string \
  --resource-group disaster-response-rg \
  --name stgdisaster767816886

# Update local.settings.json with correct endpoint and key
```

### Issue: Deployment failed
```bash
# Check deployment logs
func azure functionapp logstream func-disasterresponse

# Verify all environment variables are set
az functionapp config appsettings list \
  --resource-group disaster-response-rg \
  --name func-disasterresponse
```

---

- [Azure Functions Python Developer Guide](https://learn.microsoft.com/azure/azure-functions/functions-reference-python)
- [Azure Table Storage Documentation](https://learn.microsoft.com/azure/storage/tables/)
- [Azure Bicep Documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)
- [Azure Student Pack](https://azure.microsoft.com/free/students/)

---

- ✅ Azure Functions backend (Python 3.11)
- ✅ HTTP POST endpoint accepting JSON
- ✅ Table Storage integration
- ✅ Modern Bootstrap 5 frontend
- ✅ Form validation and error handling
- ✅ Bicep Infrastructure as Code
- ✅ Local development setup
- ✅ Deployment instructions
- ✅ API testing guide

---

All resources use **free/low-cost tiers**:
- Table Storage: Pay-per-use (very low cost for small projects)
- Azure Functions: Consumption plan (1M executions free)
- Storage: LRS (5 GB free)
- Static Web App: Free tier

**Total monthly cost: $0** within free limits! 🎉

---

## 📝 Notes

- Remember to delete resources after testing to avoid charges
- Use `az group delete --name disaster-response-rg` to clean up
- Consider adding authentication for production use
- Add Application Insights for monitoring in production
