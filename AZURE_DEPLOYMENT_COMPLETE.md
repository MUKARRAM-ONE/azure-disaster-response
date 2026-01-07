# 🚀 Complete Azure Deployment Guide - Disaster Response Platform

## ✅ DEPLOYMENT COMPLETE!

**Your application is successfully deployed to Azure:**
- **Function App**: `func-disaster-1767817356.azurewebsites.net`
- **Storage Account**: `stgdisaster767816886` (East Asia)
- **Table Storage**: `Alerts` table created
- **Resource Group**: `disaster-response-rg`
- **Region**: East Asia (per subscription policy)

**Live API Endpoint**: 
```
https://func-disaster-1767817356.azurewebsites.net/api/SubmitAlert
```

---

## 📋 What You Need
- ✅ Azure Student Account (free $100 credit)
- ✅ GitHub Codespaces (where you are now)
- ✅ This project files
- ✅ Azure CLI authenticated

---

## 🎯 PART 1: LOCAL TESTING (Already Done!)

### Commands you already ran:
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the function
func start
```

**Status**: ✅ Your function is running at `http://localhost:7071`

---

## ☁️ PART 2: DEPLOY TO AZURE (COMPLETED)

### ✅ Step 1: Login to Azure (DONE)
```bash
az login --use-device-code
```

### ✅ Step 2: Resource Group Created (DONE)
```bash
az group create \
  --name disaster-response-rg \
  --location eastasia  # Changed from eastus due to region policy
```
**Result**: Resource group created in East Asia region

### ⚠️ Step 3: Cosmos DB Replaced with Table Storage

**Original Plan**: Cosmos DB (blocked by Azure subscription policy)
**Solution**: Azure Table Storage (simpler, more compatible with regional restrictions)

### ✅ Step 4: Create Storage Account (DONE)
```bash
STORAGE_ACCOUNT=stgdisaster767816886

az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group disaster-response-rg \
  --location eastasia \
  --sku Standard_LRS
```
**Result**: Storage account `stgdisaster767816886` created

### ✅ Step 5: Create Table (DONE)
```bash
az storage table create \
  --name Alerts \
  --account-name $STORAGE_ACCOUNT
```
**Result**: `Alerts` table created

### ✅ Step 6: Register Microsoft.Web Provider (DONE)
```bash
az provider register --namespace Microsoft.Web
az provider show --namespace Microsoft.Web --query "registrationState"
```

### ✅ Step 7: Create Function App (DONE)
```bash
FUNCTION_APP=func-disaster-1767817356

az functionapp create \
  --name $FUNCTION_APP \
  --resource-group disaster-response-rg \
  --consumption-plan-location eastasia \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4 \
  --storage-account $STORAGE_ACCOUNT \
  --os-type Linux
```

### ✅ Step 8: Configure App Settings (DONE)
```bash
az functionapp config appsettings set \
  --name $FUNCTION_APP \
  --resource-group disaster-response-rg \
  --settings \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION" \
    TABLE_NAME=Alerts
```

### ✅ Step 9: Deploy Function Code (DONE)
```bash
cd ~/azure-disaster-response
func azure functionapp publish $FUNCTION_APP --python
```
---

## 🧪 PART 3: TEST YOUR DEPLOYMENT

### Test the Azure Function
```bash
curl -X POST https://${FUNCTION_APP}.azurewebsites.net/api/SubmitAlert \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Seattle, WA",
    "type": "Flood",
    "severity": "High"
  }'
```

### View Data in Table Storage
- Azure Portal → Storage Accounts → `stgdisaster767816886` → Tables → `Alerts`
- Or via CLI:
```bash
az storage entity query \
  --table-name Alerts \
  --account-name stgdisaster767816886
```

Or use the portal:
1. Go to https://portal.azure.com
2. Search for "Cosmos DB"
3. Click your account → Data Explorer
4. Navigate to DisasterResponseDB → Alerts
5. Click "Items" to see your alerts

---

## 🌐 PART 4: DEPLOY FRONTEND

### Option A: Azure Static Web Apps (Recommended)
```bash
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Create Static Web App
az staticwebapp create \
  --name swa-disaster-response \
  --resource-group disaster-response-rg \
  --location eastus

# Get deployment token
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name swa-disaster-response \
  --resource-group disaster-response-rg \
  --query properties.apiKey -o tsv)

# First, update index.html with your function URL
sed -i "s|http://localhost:7071/api/SubmitAlert|https://${FUNCTION_APP}.azurewebsites.net/api/SubmitAlert|g" index.html

# Deploy
swa deploy index.html --deployment-token $DEPLOYMENT_TOKEN
```

### Option B: Azure Storage Static Website (Simpler)
```bash
# Enable static website on storage account
az storage blob service-properties update \
  --account-name $STORAGE_ACCOUNT \
  --static-website \
  --index-document index.html

# Upload index.html
az storage blob upload \
  --account-name $STORAGE_ACCOUNT \
  --container-name '$web' \
  --name index.html \
  --file index.html \
  --content-type "text/html"

# Get website URL
WEBSITE_URL=$(az storage account show \
  --name $STORAGE_ACCOUNT \
  --resource-group disaster-response-rg \
  --query "primaryEndpoints.web" -o tsv)

echo "========================="
echo "WEBSITE LIVE AT: $WEBSITE_URL"
echo "========================="
```

---

## 📸 PART 5: GET SCREENSHOTS FOR ASSIGNMENT

### Screenshot 1: Local Testing
```bash
# In one terminal
func start

# Take screenshot of terminal showing function running
```

### Screenshot 2: Azure Resources
1. Go to https://portal.azure.com
2. Navigate to "Resource Groups" → "disaster-response-rg"
3. Take screenshot showing all resources

### Screenshot 3: Function Logs
```bash
# Stream live logs
func azure functionapp logstream $FUNCTION_APP

# Submit an alert from frontend, see it appear in logs
# Take screenshot
```

### Screenshot 4: Data in Cosmos DB
1. Portal → Cosmos DB → Your Account
2. Data Explorer → DisasterResponseDB → Alerts → Items
3. Take screenshot of stored alerts

### Screenshot 5: Working Frontend
- Open your website URL
- Fill out the form
- Submit an alert
- Take screenshot of success message

---

## 📊 PART 6: COST BREAKDOWN

All within **FREE TIER**:
- ✅ Cosmos DB: 1000 RU/s free (sufficient for this project)
- ✅ Azure Functions: 1M executions/month free
- ✅ Storage: 5 GB free
- ✅ Static Web App: Free tier available

**Expected Cost: $0/month** for low usage

---

## 🧹 PART 7: CLEANUP (When Done)

### Delete Everything
```bash
az group delete \
  --name disaster-response-rg \
  --yes \
  --no-wait
```

This deletes:
- Cosmos DB account
- Function App
- Storage Account
- Static Web App
- All data

---

## 📝 PART 8: WHAT TO SUBMIT FOR YOUR ASSIGNMENT

### Code Files:
- `SubmitAlert/__init__.py` (your function)
- `index.html` (frontend)
- `requirements.txt` (dependencies)
- `host.json` (configuration)

### Documentation:
- This deployment guide
- Screenshots (5 minimum)

### Commands Summary:
```bash
# Local development
pip install -r requirements.txt
func start

# Azure deployment
az login
az group create --name disaster-response-rg --location eastus
az cosmosdb create --name cosmos-disaster-xxx --resource-group disaster-response-rg
az functionapp create --name func-disaster-xxx --resource-group disaster-response-rg
func azure functionapp publish func-disaster-xxx
```

### Written Report Should Include:
1. Architecture diagram (Function → Cosmos DB)
2. Explanation of serverless benefits
3. How data flows from form to database
4. Why Cosmos DB was chosen (NoSQL, global distribution)
5. Cost analysis (free tier compliance)
6. Security considerations (CORS, authentication)

---

## 🎯 QUICK START (All Commands in Order)

Copy-paste this entire block:

```bash
# 1. Login
az login --use-device-code

# 2. Create resource group
az group create --name disaster-response-rg --location eastus

# 3. Create Cosmos DB
COSMOS_NAME=cosmos-disaster-$(date +%s)
az cosmosdb create --name $COSMOS_NAME --resource-group disaster-response-rg \
  --locations regionName=eastus --enable-free-tier true

# 4. Create database and container
az cosmosdb sql database create --account-name $COSMOS_NAME \
  --resource-group disaster-response-rg --name DisasterResponseDB
  
az cosmosdb sql container create --account-name $COSMOS_NAME \
  --resource-group disaster-response-rg --database-name DisasterResponseDB \
  --name Alerts --partition-key-path "/type" --throughput 400

# 5. Get Cosmos credentials
COSMOS_ENDPOINT=$(az cosmosdb show --resource-group disaster-response-rg \
  --name $COSMOS_NAME --query documentEndpoint -o tsv)
COSMOS_KEY=$(az cosmosdb keys list --resource-group disaster-response-rg \
  --name $COSMOS_NAME --query primaryMasterKey -o tsv)

# 6. Create storage account
STORAGE_NAME=stgdisaster$(date +%s | tail -c 10)
az storage account create --name $STORAGE_NAME \
  --resource-group disaster-response-rg --location eastus --sku Standard_LRS

# 7. Create Function App
FUNCTION_NAME=func-disaster-$(date +%s)
az functionapp create --resource-group disaster-response-rg \
  --consumption-plan-location eastus --runtime python --runtime-version 3.11 \
  --functions-version 4 --name $FUNCTION_NAME --storage-account $STORAGE_NAME \
  --os-type Linux

# 8. Configure app settings
az functionapp config appsettings set --name $FUNCTION_NAME \
  --resource-group disaster-response-rg --settings \
  COSMOS_ENDPOINT=$COSMOS_ENDPOINT COSMOS_KEY=$COSMOS_KEY \
  COSMOS_DATABASE_ID=DisasterResponseDB COSMOS_CONTAINER_ID=Alerts

# 9. Enable CORS
az functionapp cors add --name $FUNCTION_NAME \
  --resource-group disaster-response-rg --allowed-origins "*"

# 10. Deploy function
func azure functionapp publish $FUNCTION_NAME

# 11. Test it
echo "Test with: curl -X POST https://${FUNCTION_NAME}.azurewebsites.net/api/SubmitAlert -H 'Content-Type: application/json' -d '{\"location\":\"Test\",\"type\":\"Flood\",\"severity\":\"High\",\"message\":\"Test alert\"}'"
```

---

## 🆘 TROUBLESHOOTING

### Function not deploying?
```bash
# Check if func tools are installed
func --version

# If not, install
npm install -g azure-functions-core-tools@4
```

### Cosmos DB connection errors?
```bash
# Verify credentials are set
az functionapp config appsettings list \
  --name $FUNCTION_APP \
  --resource-group disaster-response-rg \
  --query "[?name=='COSMOS_ENDPOINT' || name=='COSMOS_KEY']"
```

### CORS errors?
```bash
# Re-enable CORS
az functionapp cors remove --name $FUNCTION_APP \
  --resource-group disaster-response-rg --allowed-origins "*"
  
az functionapp cors add --name $FUNCTION_APP \
  --resource-group disaster-response-rg --allowed-origins "*"
```

---

## 📧 Need Help?

Check Azure Portal logs:
1. Go to https://portal.azure.com
2. Find your Function App
3. Click "Monitor" → "Logs"
4. See real-time errors

---

**Good luck with your assignment! 🚀**
