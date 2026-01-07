#!/bin/bash
# Local development setup script

set -e

echo "🚀 Setting up Disaster Response Platform v2 locally..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
command -v node &> /dev/null || { echo "❌ Node.js required"; exit 1; }
command -v python3 &> /dev/null || { echo "❌ Python 3 required"; exit 1; }
command -v func &> /dev/null || { echo "❌ Azure Functions Core Tools required"; exit 1; }

echo -e "${GREEN}✓ All prerequisites found${NC}\n"

# Setup frontend
echo -e "${BLUE}Setting up frontend...${NC}"
cd frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}\n"

# Setup backend
echo -e "${BLUE}Setting up backend...${NC}"
cd ../
pip install -r requirements.txt
echo -e "${GREEN}✓ Backend dependencies installed${NC}\n"

# Create .env files
echo -e "${BLUE}Creating environment files...${NC}"

cat > frontend/.env.local << 'EOF'
VITE_AUTH0_DOMAIN=dev-xxxxxx.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id-here
VITE_AUTH0_AUDIENCE=https://disaster-response-api
VITE_AUTH0_REDIRECT_URI=http://localhost:3000
VITE_API_URL=http://localhost:7071/api
EOF

cat > local.settings.json << 'EOF'
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "COSMOS_CONNECTION_STRING": "your-cosmos-connection-string-here"
  },
  "Host": {
    "CORS": "*"
  }
}
EOF

echo -e "${GREEN}✓ Environment files created${NC}\n"

echo -e "${BLUE}📝 Configuration complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Auth0 credentials"
echo "2. Update local.settings.json with Cosmos connection string (or use Table Storage for testing)"
echo "3. Run: npm run dev (in frontend directory)"
echo "4. Run: func start (in root directory)"
echo "5. Visit: http://localhost:3000"
