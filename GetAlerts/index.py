import json
import logging
import os
from azure.cosmos import CosmosClient
import azure.functions as func

# Cosmos DB setup
COSMOS_CONNECTION = os.environ.get('COSMOS_CONNECTION_STRING')
COSMOS_DATABASE = 'disaster-response'
COSMOS_CONTAINER = 'Alerts'

def get_cosmos_container():
    """Get Cosmos DB container client."""
    client = CosmosClient.from_connection_string(COSMOS_CONNECTION)
    database = client.get_database_client(COSMOS_DATABASE)
    return database.get_container_client(COSMOS_CONTAINER)

def cors_headers():
    """Return CORS headers."""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }

def cors_response(body, status_code=200):
    """Return HTTP response with CORS headers."""
    return func.HttpResponse(
        json.dumps(body) if isinstance(body, dict) else body,
        status_code=status_code,
        headers=cors_headers(),
        mimetype='application/json'
    )

def validate_bearer_token(req: func.HttpRequest):
    """Extract Bearer token from Authorization header."""
    auth_header = req.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    return auth_header.split(' ')[1]

def main(req: func.HttpRequest) -> func.HttpResponse:
    """GET /api/Alerts - List alerts with pagination."""
    
    # Handle CORS preflight
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=cors_headers())
    
    # Require bearer token
    token = validate_bearer_token(req)
    if not token:
        return cors_response({'error': 'Unauthorized'}, 401)
    
    try:
        limit = int(req.params.get('limit', 20))
        offset = int(req.params.get('offset', 0))
        limit = min(limit, 100)  # Max 100 items per page
        
        # Query Cosmos DB
        container = get_cosmos_container()
        query = "SELECT * FROM c ORDER BY c.timestamp DESC"
        items = list(container.query_items(query, max_item_count=1000))
        
        total = len(items)
        paginated = items[offset:offset + limit]
        
        return cors_response({
            'alerts': paginated,
            'total': total,
            'limit': limit,
            'offset': offset
        }, 200)
    
    except Exception as e:
        logging.error(f'Error listing alerts: {str(e)}')
        return cors_response({'error': str(e)}, 500)
