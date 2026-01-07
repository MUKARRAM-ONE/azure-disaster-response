#!/bin/bash

# Disaster Response Platform - Quick Start Script
# This script sets up and runs your Azure Functions app locally

echo "🚀 Disaster Response Platform - Local Setup"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install npm dependencies
echo "📦 Installing Node.js dependencies..."
npm install
echo ""

# Check if Azure Functions Core Tools is installed
if ! command -v func &> /dev/null; then
    echo "⚠️  Azure Functions Core Tools not found."
    echo "Installing globally..."
    npm install -g azure-functions-core-tools@4 --unsafe-perm true
fi

echo "✅ Azure Functions Core Tools: $(func --version)"
echo ""

# Check if local.settings.json exists
if [ ! -f "local.settings.json" ]; then
    echo "⚠️  local.settings.json not found. Creating from template..."
    cp local.settings.json.template local.settings.json 2>/dev/null || cat > local.settings.json << 'EOF'
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_ENDPOINT": "https://localhost:8081",
    "COSMOS_KEY": "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=="
  },
  "Host": {
    "CORS": "*"
  }
}
EOF
    echo "✅ Created local.settings.json with default values"
fi

echo ""
echo "=============================================="
echo "✨ Setup Complete!"
echo "=============================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Start the Azure Function:"
echo "   npm start"
echo ""
echo "2. Open your browser to:"
echo "   http://localhost:7071/index.html"
echo ""
echo "3. Or test the API directly:"
echo "   curl -X POST http://localhost:7071/api/SubmitAlert \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"type\":\"Fire\",\"location\":\"Seattle\",\"severity\":\"High\",\"message\":\"Large fire in downtown area\"}'"
echo ""
echo "⚠️  Note: For local testing without Cosmos DB, the function will"
echo "   attempt to connect to Cosmos DB Emulator on localhost:8081"
echo ""
echo "   To connect to real Azure Cosmos DB, update local.settings.json"
echo "   with your actual COSMOS_ENDPOINT and COSMOS_KEY"
echo ""
