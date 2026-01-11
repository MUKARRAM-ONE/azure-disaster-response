#!/bin/bash

# Azure Disaster Response Platform - Simplified Deployment Script
# Deploys only backend infrastructure (no Static Web Apps)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="disaster-response"
LOCATION="centralindia"
ENVIRONMENT="prod"
RESOURCE_GROUP="${PROJECT_NAME}-rg-${ENVIRONMENT}"

# Print colored message
print_message() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

print_message "$BLUE" "═══════════════════════════════════════════════════════════"
print_message "$BLUE" "  Azure Disaster Response - Backend Deployment"
print_message "$BLUE" "═══════════════════════════════════════════════════════════"
echo

# Check prerequisites
print_message "$YELLOW" "→ Checking prerequisites..."
command -v az >/dev/null 2>&1 || { print_message "$RED" "✗ Azure CLI is not installed"; exit 1; }
command -v node >/dev/null 2>&1 || { print_message "$RED" "✗ Node.js is not installed"; exit 1; }
command -v func >/dev/null 2>&1 || { print_message "$RED" "✗ Azure Functions Core Tools not installed"; exit 1; }
print_message "$GREEN" "✓ Prerequisites check passed"
echo

# Check Azure login
print_message "$YELLOW" "→ Checking Azure login status..."
if ! az account show >/dev/null 2>&1; then
    print_message "$RED" "✗ Not logged in to Azure. Please run: az login"
    exit 1
fi
print_message "$GREEN" "✓ Logged in to Azure"
echo

# Get subscription info
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
print_message "$BLUE" "Using subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"
echo

# Create resource group
print_message "$YELLOW" "→ Creating resource group: $RESOURCE_GROUP in $LOCATION..."
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --output none
print_message "$GREEN" "✓ Resource group created"
echo

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Deploy infrastructure using simplified Bicep
print_message "$YELLOW" "→ Deploying infrastructure with Bicep..."
DEPLOYMENT_OUTPUT=$(az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file main-simple.bicep \
    --parameters projectName="$PROJECT_NAME" environment="$ENVIRONMENT" jwtSecret="$JWT_SECRET" \
    --query properties.outputs \
    --output json)

# Extract outputs
FUNCTION_APP_NAME=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.functionAppName.value')
FUNCTION_APP_URL=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.functionAppUrl.value')
COSMOS_ACCOUNT=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.cosmosAccountName.value')

print_message "$GREEN" "✓ Infrastructure deployed successfully"
print_message "$BLUE" "  Function App: $FUNCTION_APP_NAME"
print_message "$BLUE" "  Function URL: $FUNCTION_APP_URL"
print_message "$BLUE" "  Cosmos DB: $COSMOS_ACCOUNT"
echo

# Install Python dependencies
print_message "$YELLOW" "→ Installing Python dependencies..."
pip install -r requirements.txt --quiet
print_message "$GREEN" "✓ Dependencies installed"
echo

# Deploy Functions
print_message "$YELLOW" "→ Deploying Azure Functions..."
func azure functionapp publish "$FUNCTION_APP_NAME" --python
print_message "$GREEN" "✓ Functions deployed"
echo

# Save deployment info
print_message "$YELLOW" "→ Saving deployment information..."
cat > deployment-info.txt << EOF
═══════════════════════════════════════════════════════════
  Azure Disaster Response - Deployment Information
═══════════════════════════════════════════════════════════

Deployment Date: $(date)
Region: $LOCATION
Resource Group: $RESOURCE_GROUP

Backend (Azure Functions):
  Function App Name: $FUNCTION_APP_NAME
  Function App URL: $FUNCTION_APP_URL
  
API Endpoints:
  - Register: $FUNCTION_APP_URL/api/auth/register
  - Login: $FUNCTION_APP_URL/api/auth/login
  - Get Me: $FUNCTION_APP_URL/api/auth/me
  - Submit Alert: $FUNCTION_APP_URL/api/SubmitAlert
  - Get Alerts: $FUNCTION_APP_URL/api/GetAlerts
  - Get Alert: $FUNCTION_APP_URL/api/Alerts/{id}

Database:
  Cosmos DB Account: $COSMOS_ACCOUNT
  Database: DisasterDB
  Container: Alerts

Frontend Deployment:
  1. Update frontend/src/main.jsx with your Function App URL:
     API_BASE_URL = '$FUNCTION_APP_URL/api'
  
  2. Build the frontend:
     cd frontend && npm install && npm run build
  
  3. Deploy to any static hosting service:
     - Azure Storage Static Website
     - GitHub Pages
     - Netlify
     - Vercel

Security:
  JWT Secret: [SAVED IN AZURE]
  JWT Expiry: 7 days (10080 minutes)

Next Steps:
  1. Test API endpoints with curl or Postman
  2. Update frontend configuration
  3. Deploy frontend separately
  4. Configure custom domain (optional)

═══════════════════════════════════════════════════════════
EOF

print_message "$GREEN" "✓ Deployment information saved to deployment-info.txt"
echo

print_message "$GREEN" "═══════════════════════════════════════════════════════════"
print_message "$GREEN" "  🎉 Backend Deployment Complete! 🎉"
print_message "$GREEN" "═══════════════════════════════════════════════════════════"
echo
print_message "$BLUE" "Your backend is now running at:"
print_message "$BLUE" "  $FUNCTION_APP_URL"
echo
print_message "$YELLOW" "Next steps:"
print_message "$YELLOW" "  1. Review deployment-info.txt for all details"
print_message "$YELLOW" "  2. Update frontend API URL in frontend/src/main.jsx"
print_message "$YELLOW" "  3. Deploy frontend using: cd frontend && npm run build"
echo
