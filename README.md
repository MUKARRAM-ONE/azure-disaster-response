# Azure Disaster Response Platform

A comprehensive disaster response platform built on Azure, enabling users to report emergencies and disasters in real-time. The system uses Azure Functions for serverless backend processing, Cosmos DB for data storage, and Static Web Apps for hosting the frontend.

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Static Web App<br/>Bootstrap 5 UI]
    end
    
    subgraph "API Layer"
        B[Azure Functions<br/>Node.js v4]
        B1[SubmitAlert Function<br/>HTTP POST]
    end
    
    subgraph "Data Layer"
        C[Cosmos DB<br/>Serverless]
        C1[DisasterResponseDB]
        C2[Alerts Container]
    end
    
    subgraph "User"
        U[Web Browser]
    end
    
    U -->|HTTPS| A
    A -->|fetch API<br/>POST /api/SubmitAlert| B1
    B1 -->|@azure/cosmos| C1
    C1 --> C2
    
    style A fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style B1 fill:#764ba2,stroke:#333,stroke-width:2px,color:#fff
    style C1 fill:#00d4aa,stroke:#333,stroke-width:2px,color:#fff
    style C2 fill:#00d4aa,stroke:#333,stroke-width:2px,color:#fff
```

## 📋 Features

- **Real-time Alert Submission**: Users can submit disaster alerts with location, type, and severity
- **Serverless Architecture**: Fully serverless design using Azure Functions and Cosmos DB
- **Responsive UI**: Modern Bootstrap 5 interface that works on all devices
- **Scalable Database**: Cosmos DB with serverless capacity for cost-effective scaling
- **CORS Enabled**: Secure cross-origin resource sharing for API calls
- **Infrastructure as Code**: Complete Bicep templates for automated deployment

## 🛠️ Technology Stack

### Frontend
- **HTML5** with Bootstrap 5.3
- **JavaScript** (ES6+) with Fetch API
- **Bootstrap Icons** for visual elements
- **Responsive Design** for mobile and desktop

### Backend
- **Node.js v18** with Azure Functions v4
- **@azure/cosmos** SDK for database operations
- **HTTP Trigger** for RESTful API
- **CORS Support** for cross-origin requests

### Infrastructure
- **Azure Static Web Apps** (Free tier)
- **Azure Functions** (Consumption plan)
- **Azure Cosmos DB** (Serverless mode with Free tier)
- **Azure Storage Account** for Functions runtime
- **Bicep** for Infrastructure as Code

## 📁 Project Structure

```
azure-disaster-response/
├── SubmitAlert/              # Azure Function
│   ├── index.js             # Function logic
│   └── function.json        # Function configuration
├── index.html               # Frontend UI
├── package.json             # Node.js dependencies
├── host.json                # Function App configuration
├── main.bicep              # Infrastructure as Code
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- [Azure Account](https://azure.microsoft.com/free/)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [Azure Functions Core Tools v4](https://docs.microsoft.com/azure/azure-functions/functions-run-local)
- [Node.js v18+](https://nodejs.org/)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/MUKARRAM-ONE/azure-disaster-response.git
   cd azure-disaster-response
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure local settings**
   Create a `local.settings.json` file:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "COSMOS_ENDPOINT": "https://your-cosmos-account.documents.azure.com:443/",
       "COSMOS_KEY": "your-cosmos-key",
       "COSMOS_DATABASE_ID": "DisasterResponseDB",
       "COSMOS_CONTAINER_ID": "Alerts"
     }
   }
   ```

4. **Run the Function App locally**
   ```bash
   npm start
   ```
   The function will be available at `http://localhost:7071/api/SubmitAlert`

5. **Update the frontend**
   Edit `index.html` and change the `FUNCTION_URL` constant to point to your local endpoint:
   ```javascript
   const FUNCTION_URL = 'http://localhost:7071/api/SubmitAlert';
   ```

6. **Open the frontend**
   Open `index.html` in a web browser or serve it with a local web server.

## ☁️ Deployment

### Deploy Infrastructure

1. **Login to Azure**
   ```bash
   az login
   ```

2. **Create a resource group**
   ```bash
   az group create --name disaster-response-rg --location eastus
   ```

3. **Deploy the Bicep template**
   ```bash
   az deployment group create \
     --resource-group disaster-response-rg \
     --template-file main.bicep \
     --parameters environment=prod
   ```

4. **Get deployment outputs**
   ```bash
   az deployment group show \
     --resource-group disaster-response-rg \
     --name main \
     --query properties.outputs
   ```

### Deploy Function App

1. **Build the project**
   ```bash
   npm install --production
   ```

2. **Deploy to Azure Functions**
   ```bash
   func azure functionapp publish <function-app-name>
   ```

### Deploy Static Web App

1. **Update the FUNCTION_URL in index.html**
   Replace the `FUNCTION_URL` constant with your Azure Function URL:
   ```javascript
   const FUNCTION_URL = 'https://your-function-app.azurewebsites.net/api/SubmitAlert';
   ```

2. **Deploy using Azure CLI or GitHub Actions**
   ```bash
   az staticwebapp create \
     --name <static-web-app-name> \
     --resource-group disaster-response-rg \
     --source https://github.com/MUKARRAM-ONE/azure-disaster-response \
     --location eastus \
     --branch main \
     --app-location "/" \
     --output-location "/"
   ```

## 📊 API Documentation

### Submit Alert Endpoint

**Endpoint:** `POST /api/SubmitAlert`

**Request Body:**
```json
{
  "location": "San Francisco, CA",
  "type": "earthquake",
  "severity": "high"
}
```

**Request Fields:**
- `location` (string, required): Location of the disaster
- `type` (string, required): Type of disaster (earthquake, flood, fire, hurricane, tornado, landslide, tsunami, drought, other)
- `severity` (string, required): Severity level (low, medium, high, critical)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Alert submitted successfully",
  "data": {
    "id": "1234567890-abc123",
    "location": "San Francisco, CA",
    "type": "earthquake",
    "severity": "high",
    "timestamp": "2026-01-06T16:30:00.000Z",
    "status": "new"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Missing required fields. Please provide location, type, and severity."
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Failed to save alert",
  "details": "Error message details"
}
```

## 🗄️ Database Schema

### Alerts Container

**Document Structure:**
```json
{
  "id": "1234567890-abc123",
  "location": "San Francisco, CA",
  "type": "earthquake",
  "severity": "high",
  "timestamp": "2026-01-06T16:30:00.000Z",
  "status": "new"
}
```

**Partition Key:** `/id`

**Indexing:** Automatic indexing on all paths for optimal query performance

## 🔒 Security Considerations

- **HTTPS Only**: All endpoints enforce HTTPS
- **CORS Configuration**: Configured for specific origins (update in production)
- **Authentication**: Currently set to anonymous (update for production)
- **Key Management**: Cosmos DB keys stored as Function App settings
- **Minimal Permissions**: Functions use least-privilege access patterns

## 💰 Cost Optimization

- **Cosmos DB**: Serverless mode with free tier (1000 RU/s, 25 GB storage)
- **Azure Functions**: Consumption plan (1M executions free/month)
- **Static Web Apps**: Free tier (100 GB bandwidth/month)
- **Storage Account**: Minimal costs for Functions runtime

**Estimated Monthly Cost**: $0-5 for low to moderate usage

## 🧪 Testing

### Test the Function Locally

```bash
curl -X POST http://localhost:7071/api/SubmitAlert \
  -H "Content-Type: application/json" \
  -d '{
    "location": "New York, NY",
    "type": "flood",
    "severity": "medium"
  }'
```

### Test the Deployed Function

```bash
curl -X POST https://your-function-app.azurewebsites.net/api/SubmitAlert \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Los Angeles, CA",
    "type": "fire",
    "severity": "high"
  }'
```

## 📈 Future Enhancements

- [ ] Add user authentication with Azure AD B2C
- [ ] Implement real-time notifications using Azure SignalR
- [ ] Add geospatial queries for nearby disasters
- [ ] Create admin dashboard for alert management
- [ ] Integrate with mapping services (Azure Maps)
- [ ] Add SMS/Email notifications with Azure Communication Services
- [ ] Implement data analytics with Azure Synapse
- [ ] Add mobile app support (React Native)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **MUKARRAM-ONE** - Initial work

## 🙏 Acknowledgments

- Azure Functions documentation
- Bootstrap 5 framework
- Cosmos DB SDK team
- Azure community

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**Built with ❤️ using Azure Cloud Services**