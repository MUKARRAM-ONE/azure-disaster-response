#!/bin/bash

# Azure Disaster Response Platform - Complete Deployment Script
# This script deploys the entire application to Azure

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
print_message "$BLUE" "  Azure Disaster Response Platform - Complete Deployment"
print_message "$BLUE" "═══════════════════════════════════════════════════════════"
echo

# Check prerequisites
print_message "$YELLOW" "→ Checking prerequisites..."

if ! command -v az &> /dev/null; then
    print_message "$RED" "✗ Azure CLI is not installed. Please install it first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_message "$RED" "✗ Node.js is not installed. Please install it first."
    exit 1
fi

if ! command -v func &> /dev/null; then
    print_message "$RED" "✗ Azure Functions Core Tools not installed. Please install it first."
    exit 1
fi

print_message "$GREEN" "✓ Prerequisites check passed"
echo

# Login to Azure
print_message "$YELLOW" "→ Checking Azure login status..."
az account show > /dev/null 2>&1 || {
    print_message "$YELLOW" "Not logged in. Opening Azure login..."
    az login
}
print_message "$GREEN" "✓ Logged in to Azure"
echo

# Get or set subscription
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

# Deploy infrastructure using Bicep
print_message "$YELLOW" "→ Deploying infrastructure with Bicep..."
DEPLOYMENT_OUTPUT=$(az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file main.bicep \
    --parameters projectName="$PROJECT_NAME" environment="$ENVIRONMENT" location="$LOCATION" \
    --query properties.outputs \
    --output json)

# Extract outputs
COSMOS_CONNECTION_STRING=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.cosmosConnectionString.value')
COSMOS_DATABASE_ID=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.cosmosDatabaseName.value')
COSMOS_CONTAINER_ID=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.cosmosContainerName.value')
FUNCTION_APP_NAME=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.functionAppName.value')
STATIC_WEB_APP_NAME=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.staticWebAppName.value')

print_message "$GREEN" "✓ Infrastructure deployed successfully"
print_message "$BLUE" "  Function App: $FUNCTION_APP_NAME"
print_message "$BLUE" "  Static Web App: $STATIC_WEB_APP_NAME"
print_message "$BLUE" "  Cosmos DB: $COSMOS_DATABASE_ID"
echo

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)
print_message "$YELLOW" "→ Generated JWT secret"

# Configure Function App settings
print_message "$YELLOW" "→ Configuring Function App settings..."
az functionapp config appsettings set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$FUNCTION_APP_NAME" \
    --settings \
        "COSMOS_CONNECTION_STRING=$COSMOS_CONNECTION_STRING" \
        "COSMOS_DATABASE_ID=$COSMOS_DATABASE_ID" \
        "COSMOS_CONTAINER_ID=$COSMOS_CONTAINER_ID" \
        "COSMOS_PARTITION_KEY=/type" \
        "JWT_SECRET=$JWT_SECRET" \
        "JWT_EXPIRES_MINUTES=10080" \
    --output none

print_message "$GREEN" "✓ Function App configured"
echo

# Deploy Functions
print_message "$YELLOW" "→ Building and deploying Azure Functions..."

# Install Python dependencies
python3 -m pip install --target .python_packages/lib/site-packages -r requirements.txt > /dev/null 2>&1

# Deploy functions
func azure functionapp publish "$FUNCTION_APP_NAME" --python

print_message "$GREEN" "✓ Functions deployed"
echo

# Get Function App URL
FUNCTION_APP_URL="https://${FUNCTION_APP_NAME}.azurewebsites.net"
print_message "$BLUE" "  Function App URL: $FUNCTION_APP_URL"
echo

# Build and deploy frontend
print_message "$YELLOW" "→ Building frontend..."
cd frontend

# Create production .env file
cat > .env.production << EOF
VITE_API_URL=${FUNCTION_APP_URL}/api
EOF

# Install dependencies and build
npm install > /dev/null 2>&1
npm run build

print_message "$GREEN" "✓ Frontend built"
echo

# Get Static Web App deployment token
print_message "$YELLOW" "→ Getting Static Web App deployment token..."
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
    --name "$STATIC_WEB_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "properties.apiKey" \
    --output tsv)

# Deploy to Static Web Apps
print_message "$YELLOW" "→ Deploying frontend to Azure Static Web Apps..."

# Install SWA CLI if not already installed
if ! command -v swa &> /dev/null; then
    print_message "$YELLOW" "  Installing Azure Static Web Apps CLI..."
    npm install -g @azure/static-web-apps-cli > /dev/null 2>&1
fi

swa deploy ./dist \
    --deployment-token "$DEPLOYMENT_TOKEN" \
    --env production

cd ..

print_message "$GREEN" "✓ Frontend deployed"
echo

# Get Static Web App URL
STATIC_WEB_APP_URL=$(az staticwebapp show \
    --name "$STATIC_WEB_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "defaultHostname" \
    --output tsv)

print_message "$BLUE" "═══════════════════════════════════════════════════════════"
print_message "$GREEN" "           🎉 DEPLOYMENT SUCCESSFUL! 🎉"
print_message "$BLUE" "═══════════════════════════════════════════════════════════"
echo
print_message "$GREEN" "Application URLs:"
print_message "$BLUE" "  Frontend:  https://${STATIC_WEB_APP_URL}"
print_message "$BLUE" "  API:       ${FUNCTION_APP_URL}/api"
echo
print_message "$GREEN" "Resources created:"
print_message "$BLUE" "  Resource Group: $RESOURCE_GROUP"
print_message "$BLUE" "  Location:       $LOCATION"
print_message "$BLUE" "  Function App:   $FUNCTION_APP_NAME"
print_message "$BLUE" "  Static Web App: $STATIC_WEB_APP_NAME"
print_message "$BLUE" "  Cosmos DB:      $COSMOS_DATABASE_ID"
echo
print_message "$YELLOW" "Next steps:"
print_message "$BLUE" "  1. Visit https://${STATIC_WEB_APP_URL} to access your app"
print_message "$BLUE" "  2. Create an account and start submitting alerts"
print_message "$BLUE" "  3. Monitor via Azure Portal: https://portal.azure.com"
echo
print_message "$YELLOW" "Important security notes:"
print_message "$BLUE" "  - JWT Secret has been automatically generated and configured"
print_message "$BLUE" "  - All connections use HTTPS with proper CORS configuration"
print_message "$BLUE" "  - Consider enabling Azure AD authentication for additional security"
echo

# Save deployment info
cat > deployment-info.txt << EOF
Disaster Response Platform - Deployment Information
====================================================

Deployment Date: $(date)
Environment: ${ENVIRONMENT}
Location: ${LOCATION}

URLs:
- Frontend: https://${STATIC_WEB_APP_URL}
- API: ${FUNCTION_APP_URL}/api

Azure Resources:
- Resource Group: ${RESOURCE_GROUP}
- Function App: ${FUNCTION_APP_NAME}
- Static Web App: ${STATIC_WEB_APP_NAME}
- Cosmos DB: ${COSMOS_DATABASE_ID}
- Container: ${COSMOS_CONTAINER_ID}

Endpoints:
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user
- POST /api/SubmitAlert - Submit disaster alert
- GET /api/GetAlerts - Get all alerts
- GET /api/Alerts/{id} - Get single alert

Subscription: ${SUBSCRIPTION_NAME} (${SUBSCRIPTION_ID})

To update the deployment:
  ./deploy-production.sh

To view logs:
  az webapp log tail --name ${FUNCTION_APP_NAME} --resource-group ${RESOURCE_GROUP}

To delete all resources:
  az group delete --name ${RESOURCE_GROUP} --yes
EOF

print_message "$GREEN" "✓ Deployment information saved to deployment-info.txt"
echo
print_message "$GREEN" "Deployment completed successfully!"
