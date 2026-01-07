# 🚀 TERMINAL COMMANDS FOR DEPLOYMENT

## LOCAL DEVELOPMENT (In GitHub Codespaces)

### Step 1: Install Python Dependencies
```bash
cd /workspaces/azure-disaster-response
pip install -r requirements.txt
```

### Step 2: Install Azure Functions Core Tools (if needed)
```bash
# For Ubuntu/Debian (Codespaces uses Ubuntu)
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-$(lsb_release -cs)-prod $(lsb_release -cs) main" > /etc/apt/sources.list.d/dotnetdev.list'
func start
```

The app will start on: **http://localhost:7071**

### Step 4: Open the Frontend
In Codespaces, you can:
- Open browser to: `http://localhost:7071/index.html`
- Or use the "Ports" tab to forward port 7071 and get a public URL

### Step 5: Test the API
```bash
curl -X POST http://localhost:7071/api/SubmitAlert \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Fire",
    "location": "Seattle, WA",
    "severity": "High"
  }'
```

---

## AZURE DEPLOYMENT (COMPLETED!)

### ✅ Deployed Resources
- **Function App**: func-disaster-1767817356.azurewebsites.net
- **Storage Account**: stgdisaster767816886 (East Asia)
- **Table**: Alerts
- **Resource Group**: disaster-response-rg
- **Live API**: https://func-disaster-1767817356.azurewebsites.net/api/SubmitAlert

### Prerequisites
```bash
# Azure CLI is pre-installed in Codespaces
# Login to Azure
az login --use-device-code
```

### Step 1: Login to Azure
```bash
az login --use-device-code
```

### Step 2: Set Your Subscription (Azure Student)
```bash
# List subscriptions
az account list --output table

# Set your Azure Student subscription
az account set --subscription "Azure for Students"
```

### Step 3: Create Resource Group
```bash
az group create \
  --name disaster-response-rg \
  --location eastus  # note: resources deployed in eastasia due to policy
```

### Step 4: Create Storage Account (Table Storage)
```bash
STORAGE_ACCOUNT=stgdisaster767816886

az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group disaster-response-rg \
  --location eastasia \
  --sku Standard_LRS
```

### Step 5: Create Table
```bash
az storage table create \
  --name Alerts \
  --account-name $STORAGE_ACCOUNT
```

### Step 6: Get Storage Connection String
```bash
STORAGE_CONNECTION=$(az storage account show-connection-string \
  --name $STORAGE_ACCOUNT \
  --resource-group disaster-response-rg \
  --query connectionString -o tsv)

echo "Storage Connection: $STORAGE_CONNECTION"
```

### Step 7: Register Microsoft.Web Provider (if not already)
```bash
az provider register --namespace Microsoft.Web
az provider show --namespace Microsoft.Web --query "registrationState"
```

### Step 8: Create Function App
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

### Step 9: Configure Function App Settings
```bash
az functionapp config appsettings set \
  --name $FUNCTION_APP \
  --resource-group disaster-response-rg \
  --settings \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION" \
    TABLE_NAME=Alerts
```

### Step 10: Deploy Function Code (from Azure Cloud Shell)
```bash
# In Cloud Shell, clone repo then deploy
cd ~/azure-disaster-response
func azure functionapp publish $FUNCTION_APP --python
```

### Step 11: Update Frontend with Production URL
```bash
FUNCTION_URL="https://${FUNCTION_APP}.azurewebsites.net/api/SubmitAlert"

echo "Update index.html with this URL:"
echo "const AZURE_FUNCTION_URL = '$FUNCTION_URL';"
```

Edit `index.html` and replace:
```javascript
const AZURE_FUNCTION_URL = 'http://localhost:7071/api/SubmitAlert';
```
with:
```javascript
const AZURE_FUNCTION_URL = `https://${FUNCTION_APP}.azurewebsites.net/api/SubmitAlert`;
```

### Step 12 (Optional): Deploy Static Website
If you use Azure Static Web Apps for the frontend, deploy with SWA CLI; otherwise serve index.html via Function App or any static host.

---

## TESTING YOUR DEPLOYMENT

### Test the Azure Function
```bash
curl -X POST https://$FUNCTION_APP.azurewebsites.net/api/SubmitAlert \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Earthquake",
    "location": "San Francisco, CA",
    "severity": "Critical",
    "message": "Major earthquake detected. Magnitude 7.2. Multiple casualties reported. Buildings damaged."
  }'
```

### View Logs
```bash
# Stream function logs
func azure functionapp logstream $FUNCTION_APP

# Or view in Azure Portal
az functionapp browse --name $FUNCTION_APP --resource-group disaster-response-rg
```

---

## VIEW DATA IN TABLE STORAGE

### Using Azure Portal
1. Open Azure Portal → Storage Accounts → `stgdisaster767816886`
2. Open "Tables" → "Alerts"
3. Browse entities (PartitionKey = alert type, RowKey = UUID)

### Using Azure CLI
```bash
az storage entity query \
  --table-name Alerts \
  --account-name stgdisaster767816886
```

---

## CLEANUP (When Done Testing)

### Delete All Resources
```bash
az group delete \
  --name disaster-response-rg \
  --yes \
  --no-wait
```

---

## QUICK REFERENCE

### Check Status
```bash
# Check if function is running locally
curl http://localhost:7071/api/SubmitAlert -v

# Check Azure deployment
az deployment group show \
  --resource-group disaster-response-rg \
  --name main \
  --query properties.provisioningState
```

### Useful Commands
```bash
# View requirements
cat requirements.txt

# List installed functions
func list

# Check Python version
python3 --version

# View local settings
cat local.settings.json
```

---

## 📝 NOTES

1. **Azurite (Storage Emulator)** (optional for local dev):
  - Not available in Codespaces by default
  - You can use live Azure Storage instead
  - Update `local.settings.json` with your Storage connection string

2. **Environment Variables**:
  - Local: `local.settings.json`
  - Azure: Set via `az functionapp config appsettings set`

3. **CORS**:
   - Enabled by default in `host.json`
   - Adjust for production to restrict origins

4. **Cost Notes**:
  - Table Storage: Pay-per-transaction (very low for small workloads)
  - Functions: 1M executions free per month
  - Storage: 5 GB free

---

## 🎓 FOR YOUR ASSIGNMENT

**Submit these commands in your report:**

```bash
# Local testing
pip install -r requirements.txt
func start

# Azure deployment (Cloud Shell)
az login --use-device-code
az group create --name disaster-response-rg --location eastus
STORAGE_ACCOUNT=stgdisaster767816886
az storage account create --name $STORAGE_ACCOUNT --resource-group disaster-response-rg --location eastasia --sku Standard_LRS
az storage table create --name Alerts --account-name $STORAGE_ACCOUNT
STORAGE_CONNECTION=$(az storage account show-connection-string --name $STORAGE_ACCOUNT --resource-group disaster-response-rg --query connectionString -o tsv)
FUNCTION_APP=func-disaster-1767817356
az functionapp create --name $FUNCTION_APP --resource-group disaster-response-rg --consumption-plan-location eastasia --runtime python --runtime-version 3.11 --functions-version 4 --storage-account $STORAGE_ACCOUNT --os-type Linux
az functionapp config appsettings set --name $FUNCTION_APP --resource-group disaster-response-rg --settings AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION" TABLE_NAME=Alerts
func azure functionapp publish $FUNCTION_APP --python
```

**Include screenshots of:**
1. Running function locally
2. Web interface working
3. Successful API response
4. Data in Table Storage (Azure Portal)
5. Deployed Azure resources
