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
    """POST /api/admin/verify-user - Verify/unverify a user."""
    
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
        target_user_id = req_body.get('userId')
        verified = req_body.get('verified', True)
        
        if not target_user_id:
            return json_response({'error': 'Missing userId'}, 400)
        
        # Get target user
        target_users = list(users_container.query_items(
            'SELECT * FROM c WHERE c.id = @id',
            parameters=[{'name': '@id', 'value': target_user_id}],
            enable_cross_partition_query=True
        ))
        
        if not target_users:
            return json_response({'error': 'User not found'}, 404)
        
        target_user = target_users[0]
        target_user['verified'] = verified
        
        users_container.upsert_item(target_user)
        
        return json_response({
            'message': f'User {"verified" if verified else "unverified"}',
            'userId': target_user_id,
            'verified': verified
        }, 200)
    
    except Exception as e:
        logging.error(f'Error verifying user: {str(e)}')
        return json_response({'error': str(e)}, 500)
