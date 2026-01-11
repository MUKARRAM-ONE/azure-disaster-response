# Azure Disaster Response Platform v2.0 🚨

A comprehensive **full-stack disaster alert management system** built with **React 18 (Vite)**, **Azure Functions (Python 3.12)**, **Cosmos DB**, and **Azure Static Web Apps**.

## 📋 Project Overview

This platform enables:
- 👥 **User Registration & Authentication** with JWT and bcrypt hashing
- 📢 **Disaster Alert Submission** with real-time validation
- 📊 **Admin Dashboard** for alert verification and user management
- 🔐 **Security Features** including rate limiting and input sanitization
- ☁️ **Full Azure Deployment** with CI/CD automation

**✅ Production Ready - Live on Azure Static Web Apps!**

🌐 **Live Application**: https://blue-sand-0ebf47300.1.azurestaticapps.net/

### ⭐ Core Features
- ✅ **Custom JWT Authentication** - Email/password login with bcrypt hashing
- ✅ **Admin Dashboard** - Verify/block/delete users and alerts
- ✅ **Real-time Filtering** - Filter alerts by type, severity, location
- ✅ **Role-Based Access** - Admin and user roles with permissions
- ✅ **Security Hardening** - Rate limiting, input validation, sanitization
- ✅ **Cosmos DB** - Globally distributed NoSQL database
- ✅ **Responsive React UI** - Modern Vite-powered frontend
- ✅ **GitHub Actions CI/CD** - Automated testing and deployment
- ✅ **Comprehensive Documentation** - Complete deployment guides

## 🏗️ Architecture

```
┌──────────────────────────┐
│  React 18 (Vite)         │  Frontend UI
│  • Auth Context          │  • Login/Register
│  • Dashboard             │  • Alert submission
│  • Admin Panel           │  • Real-time filtering
└────────────┬─────────────┘
             │ JWT Bearer Token
             │ HTTPS/CORS
             ↓
┌──────────────────────────┐
│  Azure Functions (Python)│  Backend API
│  • AuthRegister          │  • User registration
│  • AuthLogin             │  • JWT token issuance
│  • SubmitAlert           │  • Alert creation
│  • GetAlerts             │  • Data retrieval
│  • Admin endpoints       │  • User/alert management
└────────────┬─────────────┘
             │ SDK Connection
             │ Partition-based queries
             ↓
┌──────────────────────────┐
│  Cosmos DB (NoSQL)       │  Database
│  • Users container       │  • Email & password hashes
│  • Alerts container      │  • Disaster alerts
│  • Global distribution   │  • Multi-region support
└──────────────────────────┘
```

### Tech Stack Details
- **Frontend**: React 18, Vite, Bootstrap 5, Axios
- **Backend**: Azure Functions (Python 3.12), JWT, bcrypt
- **Database**: Azure Cosmos DB (serverless)
- **Hosting**: Azure Static Web Apps (frontend), Azure Functions (API)
- **CI/CD**: GitHub Actions workflow
- **Infrastructure**: Bicep templates for IaC

## 📁 Project Structure

```
azure-disaster-response/
├── frontend/                          # React Vite application
│   ├── src/
│   │   ├── auth/
│   │   │   └── AuthContext.jsx       # JWT token management
│   │   ├── components/
│   │   │   ├── LoginPage.jsx         # Registration & login
│   │   │   ├── AdminDashboard.jsx    # Admin panel
│   │   │   ├── AlertsDashboard.jsx   # Alert list with filters
│   │   │   ├── SubmitAlertForm.jsx   # Alert submission
│   │   │   └── Navbar.jsx            # Navigation
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.production               # Production API URL
│   └── vite.config.js
├── AuthLogin/                         # Login function
├── AuthRegister/                      # Registration function
├── AuthMe/                            # Get current user
├── SubmitAlert/                       # Submit disaster alert
├── GetAlerts/                         # Retrieve all alerts
├── GetAlert/                          # Get single alert
├── VerifyAlert/                       # Admin: verify alert
├── DeleteAlert/                       # Admin: delete alert
├── VerifyUser/                        # Admin: verify user
├── BlockUser/                         # Admin: block user
├── DeleteUser/                        # Admin: delete user
├── GetAllUsers/                       # Admin: list users
├── auth_utils.py                      # JWT & hashing utilities
├── security_utils.py                  # Rate limiting & validation
├── requirements.txt                   # Python dependencies
├── main.bicep                         # Full infrastructure template
├── main-simple.bicep                  # Simplified template
├── main-backend-only.bicep            # Backend-only template
├── deploy-production.sh               # One-command deployment
├── deploy-backend.sh                  # Backend deployment only
├── .github/workflows/
│   └── deploy-azure.yml              # CI/CD automation
├── history/prompts/                   # Development session logs
└── README.md                          # This file
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js 20+** (for frontend)
- **Python 3.12+** (for backend)
- **Azure Functions Core Tools v4**
- **Git** installed

### Setup & Run Locally

#### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

#### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

#### 3. Create Environment Files

**Backend**: `local.settings.json`
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "COSMOS_ENDPOINT": "https://your-cosmos.documents.azure.com:443/",
    "COSMOS_KEY": "your-cosmos-key",
    "COSMOS_DATABASE_NAME": "DisasterResponseDB",
    "JWT_SECRET": "your-jwt-secret-min-32-chars",
    "JWT_EXPIRES_MINUTES": "10080"
  }
}
```

**Frontend**: `frontend/.env.local`
```
VITE_API_URL=http://localhost:7071/api
```

#### 4. Start Backend
```bash
# Terminal 1
func start --python
```

#### 5. Start Frontend
```bash
# Terminal 2
cd frontend
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:7071/api
- **Functions**: http://localhost:7071/api/\*

### Test User Accounts
```
Email: admin@disaster-response.com
Password: Admin@DisasterResponse123
Role: admin

(Or create new account via registration)
```

## 🧪 Testing the APIs

### Register a New User
```bash
curl -X POST http://localhost:7071/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Login & Get Token
```bash
curl -X POST http://localhost:7071/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@disaster-response.com",
    "password": "Admin@DisasterResponse123"
  }'

# Response includes JWT token
# Use: Authorization: Bearer <token>
```

### Submit a Disaster Alert
```bash
curl -X POST http://localhost:7071/api/SubmitAlert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "Flood",
    "location": "Downtown Seattle, WA",
    "severity": "Critical",
    "message": "Heavy rainfall causing flash floods in downtown area"
  }'
```

### Get All Alerts
```bash
curl -X GET "http://localhost:7071/api/GetAlerts?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Admin: Verify an Alert
```bash
curl -X POST http://localhost:7071/api/admin/verify-alert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "alertId": "alert-uuid",
    "verified": true
  }'
```

## ☁️ Azure Deployment

### One-Command Deployment
```bash
# Ensure you have Azure CLI installed and logged in
az login

# Run the automated deployment script
./deploy-production.sh

# Follow the prompts to confirm deployment
```

This script will:
- ✅ Create resource group
- ✅ Deploy infrastructure via Bicep
- ✅ Configure Function App settings
- ✅ Deploy Python functions
- ✅ Build and deploy React frontend
- ✅ Output all URLs and connection info

### Manual Deployment
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for step-by-step instructions.

### GitHub Actions CI/CD
Push to `main` branch - automatic deployment via `.github/workflows/deploy-azure.yml`:
```bash
git add .
git commit -m "Your message"
git push origin main
```

The workflow will:
1. Run tests
2. Build frontend and backend
3. Deploy infrastructure
4. Deploy functions
5. Deploy frontend to Static Web Apps

### Deployment Architecture
```
┌─────────────────────────────────────────┐
│  GitHub Actions Workflow (CI/CD)        │
├─────────────────────────────────────────┤
│  1. Test & Build                        │
│  2. Deploy Infrastructure (Bicep)       │
│  3. Deploy Azure Functions (Python)     │
│  4. Deploy Frontend (Static Web Apps)   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Azure Resources                        │
├─────────────────────────────────────────┤
│  • Function App (Python 3.12)           │
│  • Cosmos DB (Serverless)               │
│  • Static Web App (React)               │
│  • Application Insights (Monitoring)    │
│  • Storage Account (Function storage)   │
└─────────────────────────────────────────┘
```

## 📊 Data Schema (Cosmos DB)

### Users Collection
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "user",
  "email": "user@example.com",
  "name": "User Name",
  "passwordHash": "bcrypt_hash_...",
  "role": "user",              // "user" or "admin"
  "verified": false,           // Admin verification status
  "blocked": false,            // Account blocked status
  "createdAt": "2026-01-11T12:00:00Z"
}
```

### Alerts Collection
```json
{
  "id": "alert-550e8400-e29b-41d4-a716-446655440001",
  "type": "Flood",             // Disaster type
  "severity": "High",          // Low | Medium | High | Critical
  "location": "Downtown Seattle, WA",
  "message": "Alert description and details...",
  "verified": false,           // Admin verification
  "verifiedAt": "2026-01-11T12:05:00Z",
  "verifiedBy": {
    "id": "admin-id",
    "email": "admin@example.com",
    "name": "Admin Name"
  },
  "createdBy": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "timestamp": "2026-01-11T12:00:00Z"
}
```

### Partition Key
All documents use `/type` as partition key for optimal distribution.

## � Security Features

### Authentication
- **JWT Tokens** - HS256 with 7-day expiration
- **Bcrypt Hashing** - 12-round password hashing
- **Bearer Token** - Standard Authorization header
- **Session Persistence** - localStorage token caching

### Rate Limiting
- **Register**: 5 requests per 5 minutes
- **Login**: 10 requests per 5 minutes
- **Submit Alert**: 20 requests per 5 minutes

### Input Validation
- **Email**: RFC format validation, max 254 chars
- **Password**: Min 8 chars, letters + numbers required
- **Location**: Alphanumeric, 3-200 chars
- **Message**: 20-2000 character range
- **Type**: Whitelist validation (Flood, Fire, Earthquake, etc.)
- **Severity**: Whitelist validation (Low, Medium, High, Critical)

### Data Sanitization
- Removes control characters and null bytes
- Truncates to safe length limits
- Escapes dangerous input patterns

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: default-src 'self'`

### CORS Configuration
- Configured for production domain
- Allow credentials in production
- Restrict to specific origins

## 🛠️ Technologies Used

### Backend
- **Azure Functions v4** - Serverless compute runtime
- **Python 3.12** - Runtime environment
- **azure-functions** - Azure Functions SDK
- **azure-cosmos** - Cosmos DB SDK
- **pyjwt** - JWT token encoding/decoding
- **bcrypt** - Password hashing
- **pydantic** - Data validation

### Frontend
- **React 18** - UI framework
- **Vite 5.4** - Build tool and dev server
- **Bootstrap 5** - CSS framework
- **Axios** - HTTP client
- **React Context API** - State management

### Infrastructure & DevOps
- **Azure Bicep** - Infrastructure as Code
- **GitHub Actions** - CI/CD pipeline
- **Azure Static Web Apps** - Frontend hosting
- **Azure Cosmos DB** - Serverless database
- **Azure Functions** - Backend hosting
- **Application Insights** - Monitoring and logging

## � API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile

### Alert Endpoints (Requires Auth)
- `POST /api/SubmitAlert` - Submit disaster alert
- `GET /api/GetAlerts` - List all alerts (paginated)
- `GET /api/GetAlert/{id}` - Get single alert details

### Admin Endpoints (Requires Admin Role)
- `POST /api/admin/verify-alert` - Verify an alert
- `POST /api/admin/delete-alert` - Delete an alert
- `POST /api/admin/verify-user` - Verify a user
- `POST /api/admin/block-user` - Block a user
- `POST /api/admin/delete-user` - Delete a user
- `GET /api/admin/users` - List all users

### Rate Limits by Endpoint
- Auth endpoints: Per-client IP rate limiting
- Alert endpoints: 20 req/5min per user
- Admin endpoints: Admin-only access control

## ✅ Project Completion Checklist

### Core Features
- ✅ User registration with email/password
- ✅ Secure login with JWT tokens
- ✅ Disaster alert submission with validation
- ✅ Real-time alert filtering and search
- ✅ Alert verification (admin feature)
- ✅ User verification (admin feature)
- ✅ User blocking/deletion (admin feature)
- ✅ Alert deletion (admin feature)

### Security
- ✅ Bcrypt password hashing (12 rounds)
- ✅ JWT authentication (HS256)
- ✅ Rate limiting on auth endpoints
- ✅ Input validation and sanitization
- ✅ Security headers configured
- ✅ CORS properly configured
- ✅ Admin role-based access control

### Frontend
- ✅ React 18 with Vite
- ✅ Responsive Bootstrap 5 UI
- ✅ Auth context state management
- ✅ Admin dashboard
- ✅ Alert dashboard with filters
- ✅ Login and registration forms
- ✅ Real-time form validation

### Backend
- ✅ 11 Azure Functions (Python 3.12)
- ✅ Cosmos DB integration
- ✅ JWT token management
- ✅ Admin endpoints
- ✅ Error handling and logging
- ✅ CORS middleware
- ✅ Rate limiting decorator

### DevOps & Infrastructure
- ✅ Bicep infrastructure templates
- ✅ Automated deployment scripts
- ✅ GitHub Actions CI/CD pipeline
- ✅ Azure Static Web Apps integration
- ✅ Cosmos DB serverless setup
- ✅ Application Insights monitoring
- ✅ Environment variable management

### Documentation
- ✅ Comprehensive README
- ✅ Deployment guide
- ✅ Admin guide
- ✅ API documentation
- ✅ Setup instructions
- ✅ Troubleshooting guide
- ✅ Architecture diagrams

## 🐛 Troubleshooting

### Issue: "Failed to verify alert: Request failed with status code 404"
**Solution**: 
1. Ensure backend has been deployed with latest routes
2. Run `func start --python` locally or redeploy to Azure
3. Check that admin token is valid
4. Verify function route is correct in admin endpoints

### Issue: "CORS error in browser"
**Solution**: 
1. Ensure functions have CORS configured in host.json
2. Check `allowedOrigins` includes your frontend URL
3. For local dev, `allowedOrigins: ["*"]` is fine

### Issue: "Unauthorized" error on admin endpoints
**Solution**: 
1. Verify you're logged in as admin user
2. Check JWT token is valid (not expired)
3. Confirm Bearer token is in Authorization header
4. Check user has `role: "admin"` in Cosmos DB

### Issue: "Cannot connect to Cosmos DB"
**Solution**: 
1. Verify `COSMOS_ENDPOINT` and `COSMOS_KEY` in local.settings.json
2. Ensure Cosmos DB account is accessible
3. Check network/firewall rules
4. Verify connection string format

### Issue: "Module not found - 'auth_utils' or 'security_utils'"
**Solution**: 
1. Ensure files are in project root: `auth_utils.py`, `security_utils.py`
2. Run `pip install -r requirements.txt`
3. Check function.json has correct `scriptFile`

### Issue: "Rate limit exceeded" - 429 error
**Solution**: 
1. This is normal - wait before retrying
2. Rate limits: Register 5/5min, Login 10/5min, Submit 20/5min
3. Reset in 5 minutes or wait for time window to pass

## 📚 Additional Resources

- [Azure Functions Python Guide](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-python)
- [Cosmos DB Documentation](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Bicep Language Reference](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/file)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 📄 License

This project is provided as-is for educational and commercial use.

## 👤 Contributors

Azure Disaster Response Platform v2.0
**Built with**: React, Python, Azure, Cosmos DB

---

**📖 Documentation Files**
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment steps
- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) - Admin features and management
- [PROJECT_COMPLETION.md](./PROJECT_COMPLETION.md) - Project features summary
- [COMPLETION_SUMMARY.txt](./COMPLETION_SUMMARY.txt) - Detailed completion status

**🚀 Get Started**
```bash
# Local development
func start --python    # Terminal 1: Backend
cd frontend && npm run dev  # Terminal 2: Frontend

# Production deployment
./deploy-production.sh
```

**✨ Key Features**
- 👤 JWT Authentication with bcrypt hashing
- 🎛️ Admin Dashboard for content moderation
- 📊 Real-time alert filtering and search
- 🔒 Security hardening with rate limiting
- ☁️ Serverless Cosmos DB backend
- 🚀 GitHub Actions CI/CD automation
