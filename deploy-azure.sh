#!/bin/bash
# Azure deployment automation script
# This script deploys the entire Disaster Response Platform to Azure

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
RG_NAME="disaster-response-rg"
LOCATION="eastus"
COSMOS_ACCOUNT="disaster-response-cosmos"
COSMOS_DB="disaster-response"
COSMOS_CONTAINER="Alerts"
FUNCTION_APP="func-disaster-response"
STORAGE_ACCOUNT="stdisasterapp$(date +%s | tail -c 6)"
SWA_NAME="disaster-response-web"
GITHUB_REPO="MUKARRAM-ONE/azure-disaster-response"
GITHUB_BRANCH="main"

# Helper functions
log_info() { echo -e "${BLUE}ℹ ${1}${NC}"; }
log_success() { echo -e "${GREEN}✓ ${1}${NC}"; }
log_warning() { echo -e "${YELLOW}⚠ ${1}${NC}"; }
log_error() { echo -e "${RED}✗ ${1}${NC}"; exit 1; }

log_step() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Step: ${1}${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Check prerequisites
check_prerequisites() {
  log_step "Checking Prerequisites"
  
  command -v az &> /dev/null || log_error "Azure CLI not found. Install from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
  command -v git &> /dev/null || log_error "Git not found"
  command -v python3 &> /dev/null || log_error "Python 3 not found"
  
  log_success "All prerequisites found"
  
  # Check if logged in to Azure
  az account show &> /dev/null || log_error "Not logged in to Azure. Run: az login"
  
  SUBSCRIPTION=$(az account show --query id -o tsv)
  log_success "Connected to subscription: $SUBSCRIPTION"
}

# Create resource group
create_resource_group() {
  log_step "Creating Resource Group"
  
  log_info "Creating resource group: $RG_NAME in $LOCATION"
  az group create --name "$RG_NAME" --location "$LOCATION" --output none
  
  log_success "Resource group created"
}

# Deploy Cosmos DB
deploy_cosmos_db() {
  log_step "Deploying Cosmos DB"
  
  log_info "Creating Cosmos DB account: $COSMOS_ACCOUNT"
  az cosmosdb create \
    --name "$COSMOS_ACCOUNT" \
    --resource-group "$RG_NAME" \
    --kind GlobalDocumentDB \
    --locations regionName=$LOCATION failoverPriority=0 \
    --output none
  
  log_success "Cosmos DB account created"
  
  log_info "Creating database: $COSMOS_DB"
  az cosmosdb sql database create \
    --account-name "$COSMOS_ACCOUNT" \
    --resource-group "$RG_NAME" \
    --name "$COSMOS_DB" \
    --output none
  
  log_success "Database created"
  
  log_info "Creating container: $COSMOS_CONTAINER"
  az cosmosdb sql container create \
    --account-name "$COSMOS_ACCOUNT" \
    --database-name "$COSMOS_DB" \
    --resource-group "$RG_NAME" \
    --name "$COSMOS_CONTAINER" \
    --partition-key-path "/type" \
    --throughput 400 \
    --output none
  
  log_success "Container created"
  
  # Get connection string
  COSMOS_CONNECTION=$(az cosmosdb keys list \
    --name "$COSMOS_ACCOUNT" \
    --resource-group "$RG_NAME" \
    --type connection-strings \
    --query "connectionStrings[0].connectionString" -o tsv)
  
  log_success "Cosmos DB connection string retrieved"
  echo ""
  echo "Connection string: ${COSMOS_CONNECTION:0:50}..."
}

# Create storage account for functions
create_storage_account() {
  log_step "Creating Storage Account"
  
  log_info "Creating storage account: $STORAGE_ACCOUNT"
  az storage account create \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$RG_NAME" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --output none
  
  log_success "Storage account created"
}

# Deploy Function App
deploy_function_app() {
  log_step "Deploying Function App"
  
  log_info "Creating App Service Plan"
  az appservice plan create \
    --name "${FUNCTION_APP}-plan" \
    --resource-group "$RG_NAME" \
    --sku B1 \
    --is-linux \
    --output none
  
  log_success "App Service Plan created"
  
  log_info "Creating Function App"
  az functionapp create \
    --name "$FUNCTION_APP" \
    --storage-account "$STORAGE_ACCOUNT" \
    --resource-group "$RG_NAME" \
    --plan "${FUNCTION_APP}-plan" \
    --runtime python \
    --runtime-version 3.11 \
    --functions-version 4 \
    --output none
  
  log_success "Function App created"
  
  log_info "Configuring Function App settings"
  az functionapp config appsettings set \
    --name "$FUNCTION_APP" \
    --resource-group "$RG_NAME" \
    --settings \
      COSMOS_CONNECTION_STRING="$COSMOS_CONNECTION" \
      AUTH0_DOMAIN="your-auth0-domain" \
      AUTH0_AUDIENCE="https://disaster-response-api" \
    --output none
  
  log_success "Function App configured"
  
  log_info "Configuring CORS"
  az functionapp cors add \
    --name "$FUNCTION_APP" \
    --resource-group "$RG_NAME" \
    --allowed-origins "*" \
    --output none
  
  log_success "CORS enabled"
}

# Deploy Function code
deploy_function_code() {
  log_step "Deploying Function Code"
  
  log_info "Building and deploying functions from current directory"
  func azure functionapp publish "$FUNCTION_APP" --build remote
  
  log_success "Functions deployed"
  
  FUNCTION_URL=$(az functionapp show \
    --name "$FUNCTION_APP" \
    --resource-group "$RG_NAME" \
    --query defaultHostName -o tsv)
  
  log_success "Function App URL: https://$FUNCTION_URL"
}

# Create Static Web App
deploy_static_web_app() {
  log_step "Deploying Azure Static Web Apps"
  
  log_info "This requires a GitHub token and repository setup"
  log_warning "You must:"
  echo "1. Create a GitHub Personal Access Token (https://github.com/settings/tokens)"
  echo "2. Have the repository pushed to GitHub"
  echo ""
  read -p "Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Skipping Static Web Apps setup. Deploy manually in Azure Portal"
    return
  fi
  
  read -p "Enter GitHub token: " GITHUB_TOKEN
  
  log_info "Creating Static Web Apps resource"
  az staticwebapp create \
    --name "$SWA_NAME" \
    --resource-group "$RG_NAME" \
    --source "https://github.com/$GITHUB_REPO" \
    --location "$LOCATION" \
    --branch "$GITHUB_BRANCH" \
    --repository-token "$GITHUB_TOKEN" \
    --app-location "frontend" \
    --api-location "." \
    --output-location "dist" \
    --output none
  
  log_success "Static Web App created"
  
  # Get SWA URL
  SWA_URL=$(az staticwebapp show \
    --name "$SWA_NAME" \
    --resource-group "$RG_NAME" \
    --query "defaultHostname" -o tsv)
  
  log_success "Static Web App URL: https://$SWA_URL"
  
  # Configure environment variables
  log_info "Configuring environment variables"
  read -p "Enter Auth0 Domain: " AUTH0_DOMAIN
  read -p "Enter Auth0 Client ID: " AUTH0_CLIENT_ID
  
  az staticwebapp appsettings set \
    --name "$SWA_NAME" \
    --resource-group "$RG_NAME" \
    --setting-names \
      VITE_AUTH0_DOMAIN="$AUTH0_DOMAIN" \
      VITE_AUTH0_CLIENT_ID="$AUTH0_CLIENT_ID" \
      VITE_AUTH0_AUDIENCE="https://disaster-response-api" \
      VITE_AUTH0_REDIRECT_URI="https://$SWA_URL" \
      VITE_API_URL="https://$FUNCTION_URL/api" \
    --output none
  
  log_success "Environment variables configured"
}

# Summary
print_summary() {
  log_step "Deployment Complete! 🎉"
  
  echo ""
  echo "📋 Deployment Summary:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Resource Group:     $RG_NAME"
  echo "Region:             $LOCATION"
  echo ""
  echo "Cosmos DB:"
  echo "  Account:          $COSMOS_ACCOUNT"
  echo "  Database:         $COSMOS_DB"
  echo "  Container:        $COSMOS_CONTAINER"
  echo ""
  echo "Functions:"
  echo "  App Name:         $FUNCTION_APP"
  echo "  URL:              https://$FUNCTION_URL"
  echo ""
  echo "Static Web App:"
  echo "  Name:             $SWA_NAME"
  echo "  URL:              https://$SWA_URL"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "🔐 Auth0 Configuration Remaining:"
  echo "  1. Update Auth0 Callback URLs:"
  echo "     - https://$SWA_URL"
  echo "  2. Update Auth0 Logout URLs:"
  echo "     - https://$SWA_URL"
  echo "  3. Update Auth0 Web Origins:"
  echo "     - https://$SWA_URL"
  echo ""
  echo "📝 Next Steps:"
  echo "  1. Visit: https://$SWA_URL"
  echo "  2. Test application workflow"
  echo "  3. Check Function logs: az functionapp log tail --name $FUNCTION_APP --resource-group $RG_NAME"
  echo "  4. Monitor Cosmos DB: Azure Portal → Cosmos DB → Metrics"
}

# Main execution
main() {
  echo -e "${GREEN}"
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║  Disaster Response Platform v2 - Azure Deployment Script  ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  echo ""
  
  check_prerequisites
  create_resource_group
  deploy_cosmos_db
  create_storage_account
  deploy_function_app
  deploy_function_code
  deploy_static_web_app
  print_summary
}

# Run main
main
