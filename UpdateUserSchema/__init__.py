import json
import logging
import os
import uuid
from datetime import datetime
import bcrypt
import azure.functions as func
from azure.cosmos import CosmosClient

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
    """Admin endpoint to initialize users with role and verification fields."""
    
    auth_header = req.headers.get('Authorization', '')
    admin_key = os.environ.get('ADMIN_INIT_KEY', '')
    
    if not admin_key or auth_header != f'Bearer {admin_key}':
        return func.HttpResponse(
            json.dumps({'error': 'Unauthorized'}),
            status_code=401,
            mimetype='application/json'
        )
    
    try:
        action = req.params.get('action', 'update_schema')
        
        if action == 'update_schema':
            return update_user_schema()
        elif action == 'create_admin':
            return create_admin_user()
        else:
            return func.HttpResponse(
                json.dumps({'error': 'Unknown action'}),
                status_code=400,
                mimetype='application/json'
            )
    
    except Exception as e:
        logging.error(f'Error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype='application/json'
        )

def update_user_schema():
    """Update all existing users with new fields."""
    container = get_cosmos_container('users')
    users = list(container.query_items(
        'SELECT * FROM c',
        enable_cross_partition_query=True
    ))
    
    updated_count = 0
    for user in users:
        # Add new fields if missing
        if 'role' not in user:
            user['role'] = 'user'
        if 'verified' not in user:
            user['verified'] = False
        if 'blocked' not in user:
            user['blocked'] = False
        if 'createdAt' not in user:
            user['createdAt'] = datetime.utcnow().isoformat() + 'Z'
        
        container.upsert_item(user)
        updated_count += 1
    
    return func.HttpResponse(
        json.dumps({'message': f'Updated {updated_count} users'}),
        status_code=200,
        mimetype='application/json'
    )

def create_admin_user():
    """Create default admin user."""
    container = get_cosmos_container('users')
    
    admin_email = 'admin@disaster-response.com'
    admin_password = 'Admin@DisasterResponse123'
    
    # Check if admin exists
    existing = list(container.query_items(
        'SELECT * FROM c WHERE c.email = @email',
        parameters=[{'name': '@email', 'value': admin_email}],
        enable_cross_partition_query=True
    ))
    
    if existing:
        return func.HttpResponse(
            json.dumps({'message': 'Admin user already exists', 'email': admin_email}),
            status_code=200,
            mimetype='application/json'
        )
    
    # Hash password
    password_hash = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
    
    admin_user = {
        'id': str(uuid.uuid4()),
        'email': admin_email,
        'name': 'System Administrator',
        'passwordHash': password_hash,
        'role': 'admin',
        'verified': True,
        'blocked': False,
        'createdAt': datetime.utcnow().isoformat() + 'Z',
        'type': 'user'
    }
    
    container.create_item(admin_user)
    
    return func.HttpResponse(
        json.dumps({
            'message': 'Admin user created',
            'email': admin_email,
            'password': admin_password,
            'note': 'Please change this password after first login'
        }),
        status_code=201,
        mimetype='application/json'
    )
