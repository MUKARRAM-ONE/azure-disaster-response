import json
import logging
import os
from azure.cosmos import CosmosClient
import azure.functions as func
from auth_utils import require_user, cors_headers, json_response

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
    """GET /api/Alerts/{alertId} - Get a specific alert."""
    
    # Handle CORS preflight
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=cors_headers())
    
    # Require bearer token
    user, error_response = require_user(req)
    if error_response:
        return error_response
    
    try:
        alert_id = req.route_params.get('alertId')
        if not alert_id:
            return json_response({'error': 'Missing alert ID'}, 400)
        
        # Query Cosmos DB
        container = get_cosmos_container()
        query = "SELECT * FROM c WHERE c.id = @id"
        items = list(container.query_items(
            query,
            parameters=[{'name': '@id', 'value': alert_id}],
            max_item_count=1,
            enable_cross_partition_query=True
        ))
        
        if not items:
            return json_response({'error': 'Alert not found'}, 404)
        
        return json_response(items[0], 200)
    
    except Exception as e:
        logging.error(f'Error getting alert: {str(e)}')
        return json_response({'error': str(e)}, 500)
