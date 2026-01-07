# Disaster Response Platform 🚨

A full-stack disaster alert submission system built with **Azure Functions (Python 3.11)**, **Azure Table Storage**, and **Bootstrap 5**.

## 📋 Project Overview

This project allows users to submit real-time disaster alerts through a modern web interface. Alerts are stored in Azure Table Storage and can be accessed for emergency response coordination.

**✅ Successfully Deployed on Azure!**
- **Function App**: `func-disaster-1767817356` (East Asia)
- **Storage Account**: `stgdisaster767816886` (East Asia)
- **Table**: `Alerts` 
- **Resource Group**: `disaster-response-rg`

### Features
- ✅ **Modern Responsive UI** - Bootstrap 5 with gradient design
- ✅ **Serverless Backend** - Azure Functions v4 (Python 3.11)
- ✅ **NoSQL Storage** - Azure Table Storage (serverless)
- ✅ **Real-time Validation** - Client and server-side validation
- ✅ **CORS Enabled** - Cross-origin resource sharing configured
- ✅ **Free Tier Compatible** - Optimized for Azure Student Pack
- ✅ **Asia Region Compliant** - Deployed to eastasia per subscription policy

## 🏗️ Architecture

```
┌─────────────────┐
│   index.html    │  Bootstrap 5 Frontend
│   (Client)      │  
└────────┬────────┘
         │ HTTP POST
         │ JSON: {type, location, severity}
         ↓
┌─────────────────┐
│  Azure Function │  Python 3.11 Runtime
│  SubmitAlert    │  HTTP Trigger (func-disaster-1767817356)
└────────┬────────┘
         │
         │ azure-data-tables SDK
         ↓
┌─────────────────┐
│  Table Storage  │  Azure Storage Account
│  Alerts Table   │  stgdisaster767816886
│  PartitionKey: type │  RowKey: UUID
└─────────────────┘
```

## 📁 Project Structure

```
azure-disaster-response/
├── SubmitAlert/
│   ├── __init__.py                # Main Azure Function (Python)
│   └── function.json              # Function binding configuration
├── index.html                      # Frontend web interface
├── requirements.txt                # Python dependencies
├── host.json                       # Azure Functions configuration
├── local.settings.json             # Local environment variables
├── DEPLOYMENT_GUIDE.md            # Detailed deployment instructions
└── README.md                       # This file
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Python 3.11+** installed
- **Git** installed
- **Azure Functions Core Tools v4**

### Setup
```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install Azure Functions Core Tools (if not installed)
# For Ubuntu/Debian:
sudo apt-get install azure-functions-core-tools-4

# 3. Update local.settings.json with your Azure Storage connection string
# (Already configured with deployed storage account)

# 4. Start the Azure Functions runtime
func start
```

### Access the Application
- **Web Interface**: http://localhost:7071/index.html
- **API Endpoint**: http://localhost:7071/api/SubmitAlert
- **Azure Production**: https://func-disaster-1767817356.azurewebsites.net/api/SubmitAlert

## 🧪 Testing the API

### Using curl:
```bash
curl -X POST http://localhost:7071/api/SubmitAlert \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Flood",
    "location": "Downtown Seattle, WA",
    "severity": "High",
    "message": "Heavy rainfall causing flash floods in downtown area. Multiple roads are impassable and water levels are rising rapidly."
  }'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Alert submitted successfully",
  "alertId": "alert-1704564000000-abc123xyz",
  "data": {
    "id": "alert-1704564000000-abc123xyz",
    "location": "Downtown Seattle, WA",
    "type": "Flood",
    "severity": "High",
    "message": "Heavy rainfall causing flash floods...",
    "timestamp": "2026-01-06T16:55:00.000Z",
    "status": "active"
  }
}
```

## ☁️ Azure Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### Quick Deploy (already live)
```bash
# 1) Login
az login --use-device-code

# 2) Resource group
az group create --name disaster-response-rg --location eastus

# 3) Storage + table
STORAGE_ACCOUNT=stgdisaster767816886
az storage account create --name $STORAGE_ACCOUNT --resource-group disaster-response-rg --location eastasia --sku Standard_LRS
az storage table create --name Alerts --account-name $STORAGE_ACCOUNT

# 4) Function App (Python 3.11)
FUNCTION_APP=func-disaster-1767817356
az functionapp create --name $FUNCTION_APP --resource-group disaster-response-rg --consumption-plan-location eastasia --runtime python --runtime-version 3.11 --functions-version 4 --storage-account $STORAGE_ACCOUNT --os-type Linux

# 5) App settings
STORAGE_CONNECTION=$(az storage account show-connection-string --name $STORAGE_ACCOUNT --resource-group disaster-response-rg --query connectionString -o tsv)
az functionapp config appsettings set --name $FUNCTION_APP --resource-group disaster-response-rg --settings AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION" TABLE_NAME=Alerts

# 6) Deploy code
func azure functionapp publish $FUNCTION_APP --python
```

## 📊 Data Schema (Table Storage)

### Alerts Table (Azure Storage)

```json
{
  "PartitionKey": "Flood",                   // Alert type
  "RowKey": "alert-1704564000000-abc123xyz", // Unique alert ID (UUID)
  "location": "Downtown Seattle, WA",
  "severity": "High",                        // Low | Medium | High | Critical
  "Timestamp": "2026-01-06T16:55:00.000Z"
}
```

**Partition Key**: Alert type (for grouping and scale)
**Row Key**: Unique alert identifier (UUID)

## 🔧 Configuration

### Environment Variables (local.settings.json)
```json
{
  "Values": {
    "AZURE_STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;...",
    "TABLE_NAME": "Alerts",
    "FUNCTIONS_WORKER_RUNTIME": "python"
  }
}
```

### Frontend Configuration (index.html)
Update the `AZURE_FUNCTION_URL` constant:
```javascript
const AZURE_FUNCTION_URL = 'https://your-app.azurewebsites.net/api/SubmitAlert';
```

## 🛠️ Technologies Used

### Backend
- **Azure Functions v4** - Serverless compute
- **Python 3.11** - Runtime
- **azure-functions** - Azure Functions SDK
- **azure-data-tables** - Azure Table Storage SDK

### Frontend
- **HTML5** - Semantic markup
- **Bootstrap 5.3.2** - Responsive CSS framework
- **Bootstrap Icons** - Icon library
- **Vanilla JavaScript** - No framework dependencies

### Infrastructure
- **Azure Table Storage** - NoSQL storage (pay-per-use)
- **Azure Storage** - Function app storage

## 📝 Assignment Requirements Checklist

- ✅ **Backend**: Azure Functions with Python 3.11
- ✅ **HTTP Trigger**: Accepts POST with JSON body
- ✅ **Storage**: Connects to Table Storage (NoSQL) with azure-data-tables SDK
- ✅ **Table Name**: Alerts
- ✅ **Frontend**: Modern, responsive HTML with Bootstrap 5
- ✅ **Form Fields**: Location, Type (dropdown), Severity, Message
- ✅ **JavaScript**: Fetch API for AJAX submission
- ✅ **Infrastructure**: Deployed to Azure (func-disaster-1767817356)
- ✅ **Dependencies**: requirements.txt with Python packages
- ✅ **Documentation**: Deployment guide and terminal commands

## 💰 Cost Considerations

All resources use **Azure Free Tier**:
- ✅ **Table Storage**: Pay-per-transaction (extremely low cost)
- ✅ **Azure Functions**: Consumption plan (1M free executions/month)
- ✅ **Storage Account**: LRS (5 GB free)

**Estimated Monthly Cost**: **$0** (within free tier limits)

## 🐛 Troubleshooting

### Issue: "CORS error in browser"
**Solution**: Ensure `host.json` has CORS configured:
```json
{
  "cors": {
    "allowedOrigins": ["*"]
  }
}
```

### Issue: "Cannot connect to Table Storage"
**Solution**: 
1. Verify your `AZURE_STORAGE_CONNECTION_STRING` in `local.settings.json`
2. Ensure `TABLE_NAME` is set to "Alerts"
3. For local testing, use Azurite (Azure Storage Emulator)

### Issue: "Function not found"
**Solution**: Ensure the function exists in `SubmitAlert/__init__.py`

### Issue: "Module not found"
**Solution**: Run `pip install -r requirements.txt` to install all dependencies

## 📚 Additional Resources

- [Azure Functions Python Guide](https://learn.microsoft.com/azure/azure-functions/functions-reference-python)
- [Azure Table Storage Documentation](https://learn.microsoft.com/azure/storage/tables/)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)

## 📄 License

This project is part of an educational assignment and is provided as-is for learning purposes.

## 👤 Author

Student Project - Azure Student Pack
**Project #40: Disaster Response Platform**

---

**Need Help?** Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for step-by-step instructions.
