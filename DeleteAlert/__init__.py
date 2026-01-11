import json
import logging
import os
from azure.cosmos import CosmosClient
import azure.functions as func
from auth_utils import require_user, json_response, cors_headers

# Cosmos DB setup
COSMOS_ENDPOINT = os.environ.get('COSMOS_ENDPOINT')
COSMOS_KEY = os.environ.get('COSMOS_KEY')
COSMOS_DATABASE = os.environ.get('COSMOS_DATABASE_NAME', 'DisasterResponseDB')

def get_cosmos_container(container_name):
    """Get Cosmos DB container client."""
    client = CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY)
    database = client.get_database_client(COSMOS_DATABASE)
    return database.get_container_client(container_name)

def main(req: func.HttpRequest) -> func.HttpResponse:
    """POST /api/admin/delete-alert - Delete an alert."""
    
    # Handle CORS preflight
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=cors_headers())
    
    # Require bearer token
    user, error_response = require_user(req)
    if error_response:
        return error_response
    
    # Check if admin
    users_container = get_cosmos_container('users')
    admin_check = list(users_container.query_items(
        'SELECT * FROM c WHERE c.id = @id AND c.role = @role',
        parameters=[
            {'name': '@id', 'value': user['id']},
            {'name': '@role', 'value': 'admin'}
        ],
        enable_cross_partition_query=True
    ))
    
    if not admin_check:
        return json_response({'error': 'Admin access required'}, 403)
    
    try:
        req_body = req.get_json()
        alert_id = req_body.get('alertId')
        reason = req_body.get('reason', '')
        
        if not alert_id:
            return json_response({'error': 'Missing alertId'}, 400)
        
        # Get alert
        alerts_container = get_cosmos_container('alerts')
        alerts = list(alerts_container.query_items(
            'SELECT * FROM c WHERE c.id = @id',
            parameters=[{'name': '@id', 'value': alert_id}],
            enable_cross_partition_query=True
        ))
        
        if not alerts:
            return json_response({'error': 'Alert not found'}, 404)
        
        alert = alerts[0]
        
        # Delete alert
        alerts_container.delete_item(item=alert['id'], partition_key=alert.get('type'))
        
        return json_response({
            'message': 'Alert deleted',
            'alertId': alert_id,
            'reason': reason
        }, 200)
    
    except Exception as e:
        logging.error(f'Error deleting alert: {str(e)}')
        return json_response({'error': str(e)}, 500)
