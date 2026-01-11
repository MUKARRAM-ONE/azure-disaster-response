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
    """GET /api/admin/users - Get all users for admin management."""
    
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
        limit = int(req.params.get('limit', 100))
        offset = int(req.params.get('offset', 0))
        
        # Get all users without sensitive data
        all_users = list(users_container.query_items(
            'SELECT c.id, c.email, c.name, c.role, c.verified, c.blocked, c.createdAt FROM c ORDER BY c.createdAt DESC',
            enable_cross_partition_query=True
        ))
        
        # Paginate
        paginated_users = all_users[offset:offset + limit]
        
        return json_response({
            'users': paginated_users,
            'total': len(all_users),
            'limit': limit,
            'offset': offset
        }, 200)
    
    except Exception as e:
        logging.error(f'Error fetching users: {str(e)}')
        return json_response({'error': str(e)}, 500)
