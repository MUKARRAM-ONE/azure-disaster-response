import json
import logging
import os
import uuid
from datetime import datetime
import azure.functions as func
from azure.cosmos import CosmosClient
from functools import wraps

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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    """Extract and validate Bearer token from Authorization header."""
    auth_header = req.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    return auth_header.split(' ')[1]

def require_auth(f):
    """Decorator to require JWT Bearer token."""
    @wraps(f)
    def decorated(req: func.HttpRequest):
        token = validate_bearer_token(req)
        if not token:
            return cors_response({'error': 'Unauthorized'}, 401)
        return f(req, token)
    return decorated

@require_auth
def submit_alert(req: func.HttpRequest, token: str) -> func.HttpResponse:
    """POST /api/SubmitAlert - Submit a new disaster alert."""
    try:
        req_body = req.get_json()
        
        # Validate required fields
        required = ['type', 'location', 'severity', 'message']
        if not all(k in req_body for k in required):
            return cors_response({'error': 'Missing required fields'}, 400)
        
        if len(req_body.get('message', '')) < 20:
            return cors_response({'error': 'Message must be at least 20 characters'}, 400)
        
        # Create alert document
        alert_id = str(uuid.uuid4())
        alert = {
            'id': alert_id,
            'type': req_body['type'],
            'location': req_body['location'],
            'severity': req_body['severity'],
            'message': req_body['message'],
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }
        
        # Insert into Cosmos DB
        container = get_cosmos_container()
        container.create_item(alert)
        
        return cors_response({'alertId': alert_id, 'data': alert}, 201)
    
    except json.JSONDecodeError:
        return cors_response({'error': 'Invalid JSON'}, 400)
    except Exception as e:
        logging.error(f'Error submitting alert: {str(e)}')
        return cors_response({'error': str(e)}, 500)

@require_auth
def list_alerts(req: func.HttpRequest, token: str) -> func.HttpResponse:
    """GET /api/Alerts - List all alerts with pagination."""
    try:
        limit = int(req.params.get('limit', 20))
        offset = int(req.params.get('offset', 0))
        
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

@require_auth
def get_alert(req: func.HttpRequest, token: str, alert_id: str) -> func.HttpResponse:
    """GET /api/Alerts/{id} - Get a specific alert."""
    try:
        container = get_cosmos_container()
        query = "SELECT * FROM c WHERE c.id = @id"
        items = list(container.query_items(query, parameters=[{'name': '@id', 'value': alert_id}], max_item_count=1))
        
        if not items:
            return cors_response({'error': 'Alert not found'}, 404)
        
        return cors_response(items[0], 200)
    
    except Exception as e:
        logging.error(f'Error getting alert: {str(e)}')
        return cors_response({'error': str(e)}, 500)

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Main entry point - route based on method and path."""
    # Handle CORS preflight
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=cors_headers())
    
    # Default: submit alert (POST /api/SubmitAlert)
    return submit_alert(req)
