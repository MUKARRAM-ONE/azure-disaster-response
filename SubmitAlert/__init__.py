import json
import logging
import os
import uuid
from datetime import datetime
import azure.functions as func
from azure.cosmos import CosmosClient
from auth_utils import require_user, cors_headers, json_response
from security_utils import (
    rate_limit, sanitize_input, validate_location,
    validate_severity, validate_disaster_type, add_security_headers
)

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

@rate_limit(max_requests=20, window_seconds=300)  # 20 alerts per 5 minutes
def submit_alert(req: func.HttpRequest, user: dict) -> func.HttpResponse:
    """POST /api/SubmitAlert - Submit a new disaster alert."""
    try:
        req_body = req.get_json()
        
        # Validate and sanitize required fields
        disaster_type = sanitize_input(req_body.get('type', ''), max_length=50)
        location = sanitize_input(req_body.get('location', ''), max_length=200)
        severity = sanitize_input(req_body.get('severity', ''), max_length=20)
        message = sanitize_input(req_body.get('message', ''), max_length=2000)
        
        # Validate fields
        if not validate_disaster_type(disaster_type):
            return json_response({'error': 'Invalid disaster type'}, 400)
        
        if not validate_location(location):
            return json_response({'error': 'Invalid location format'}, 400)
        
        if not validate_severity(severity):
            return json_response({'error': 'Invalid severity level'}, 400)
        
        if len(message) < 20:
            return json_response({'error': 'Message must be at least 20 characters'}, 400)
        
        # Create alert document
        alert_id = str(uuid.uuid4())
        alert = {
            'id': alert_id,
            'type': disaster_type,
            'location': location,
            'severity': severity,
            'message': message,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'verified': False,  # Alerts start as unverified
            'createdBy': {
                'id': user.get('sub'),
                'email': user.get('email'),
                'name': user.get('name'),
                'verified': user.get('verified', False)  # Include user verification status
            }
        }
        
        # Insert into Cosmos DB
        container = get_cosmos_container()
        container.create_item(body=alert)
        
        logging.info(f"Alert created: {alert_id} by {user.get('email')}")
        
        response = json_response({'alertId': alert_id, 'data': alert}, 201)
        return add_security_headers(response)
    
    except json.JSONDecodeError:
        return json_response({'error': 'Invalid JSON'}, 400)
    except Exception as e:
        logging.error(f'Error submitting alert: {str(e)}')
        return json_response({'error': str(e)}, 500)

def list_alerts(req: func.HttpRequest, user: dict) -> func.HttpResponse:
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
        
        return json_response({
            'alerts': paginated,
            'total': total,
            'limit': limit,
            'offset': offset
        }, 200)
    
    except Exception as e:
        logging.error(f'Error listing alerts: {str(e)}')
        return json_response({'error': str(e)}, 500)

def get_alert(req: func.HttpRequest, user: dict, alert_id: str) -> func.HttpResponse:
    """GET /api/Alerts/{id} - Get a specific alert."""
    try:
        container = get_cosmos_container()
        query = "SELECT * FROM c WHERE c.id = @id"
        items = list(container.query_items(query, parameters=[{'name': '@id', 'value': alert_id}], max_item_count=1))
        
        if not items:
            return json_response({'error': 'Alert not found'}, 404)
        
        return json_response(items[0], 200)
    
    except Exception as e:
        logging.error(f'Error getting alert: {str(e)}')
        return json_response({'error': str(e)}, 500)

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Main entry point - route based on method and path."""
    # Handle CORS preflight
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=cors_headers())
    
    user, error_response = require_user(req)
    if error_response:
        return error_response
    
    # Default: submit alert (POST /api/SubmitAlert)
    return submit_alert(req, user)
