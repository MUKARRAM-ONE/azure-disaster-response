import json
import logging
import os
from azure.cosmos import CosmosClient
import azure.functions as func
from auth_utils import require_user, cors_headers, json_response
from security_utils import add_security_headers

# Configure logging
logging.basicConfig(level=logging.INFO)

# Cosmos DB setup
COSMOS_ENDPOINT = os.environ.get('COSMOS_ENDPOINT')
COSMOS_KEY = os.environ.get('COSMOS_KEY')
COSMOS_DATABASE = os.environ.get('COSMOS_DATABASE_NAME', 'DisasterResponseDB')
COSMOS_CONTAINER = os.environ.get('COSMOS_CONTAINER_ID', 'alerts')

def get_cosmos_container():
    """Get Cosmos DB container client."""
    client = CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY)
    database = client.get_database_client(COSMOS_DATABASE)
    return database.get_container_client(COSMOS_CONTAINER)

def main(req: func.HttpRequest) -> func.HttpResponse:
    """GET /api/Alerts - List alerts with pagination."""
    
    # Handle CORS preflight
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=cors_headers())
    
    # Require bearer token
    user, error_response = require_user(req)
    if error_response:
        return error_response
    
    try:
        limit = int(req.params.get('limit', 20))
        offset = int(req.params.get('offset', 0))
        limit = min(limit, 100)  # Max 100 items per page
        
        # Query Cosmos DB
        container = get_cosmos_container()
        query = "SELECT * FROM c ORDER BY c.timestamp DESC"
        items = list(container.query_items(query, max_item_count=1000, enable_cross_partition_query=True))
        
        total = len(items)
        paginated = items[offset:offset + limit]
        
        logging.info(f"GetAlerts: User {user.get('email')} fetched {len(paginated)} alerts (total: {total})")
        
        response = json_response({
            'alerts': paginated,
            'total': total,
            'limit': limit,
            'offset': offset
        }, 200)
        return add_security_headers(response)
    
    except Exception as e:
        logging.error(f'Error listing alerts: {str(e)}')
        return json_response({'error': str(e)}, 500)
