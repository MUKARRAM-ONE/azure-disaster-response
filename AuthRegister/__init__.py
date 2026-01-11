import json
import uuid
import logging
import os
from datetime import datetime
from azure.cosmos import CosmosClient
import azure.functions as func
from auth_utils import cors_headers, json_response, hash_password
from security_utils import (
    rate_limit, validate_email, validate_password,
    sanitize_input, add_security_headers
)

COSMOS_ENDPOINT = os.environ.get('COSMOS_ENDPOINT')
COSMOS_KEY = os.environ.get('COSMOS_KEY')
COSMOS_DATABASE = os.environ.get('COSMOS_DATABASE_NAME', 'DisasterResponseDB')
COSMOS_CONTAINER = os.environ.get('COSMOS_CONTAINER_ID', 'users')


def get_container():
    client = CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY)
    database = client.get_database_client(COSMOS_DATABASE)
    return database.get_container_client(COSMOS_CONTAINER)


@rate_limit(max_requests=5, window_seconds=300)  # 5 registrations per 5 minutes
def main(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == 'OPTIONS':
        return func.HttpResponse(status_code=204, headers=cors_headers())

    try:
        data = req.get_json()
    except ValueError:
        return json_response({'error': 'Invalid JSON payload'}, 400)

    email = sanitize_input((data.get('email') or '').strip().lower(), max_length=254)
    password = data.get('password') or ''
    name = sanitize_input((data.get('name') or '').strip(), max_length=100)

    # Validate email
    if not validate_email(email):
        return json_response({'error': 'Invalid email address'}, 400)
    
    # Validate password
    is_valid, error_msg = validate_password(password)
    if not is_valid:
        return json_response({'error': error_msg}, 400)

    try:
        container = get_container()
        existing = list(container.query_items(
            query="SELECT * FROM c WHERE c.type = 'user' AND c.email = @email",
            parameters=[{'name': '@email', 'value': email}],
            enable_cross_partition_query=True
        ))
        if existing:
            return json_response({'error': 'User already exists'}, 409)

        user_id = str(uuid.uuid4())
        user_doc = {
            'id': user_id,
            'type': 'user',
            'email': email,
            'name': name or email,
            'passwordHash': hash_password(password),
            'role': 'user',
            'verified': False,
            'blocked': False,
            'createdAt': datetime.utcnow().isoformat() + 'Z'
        }

        container.create_item(body=user_doc)
        
        response = json_response({'message': 'User registered successfully'}, 201)
        return add_security_headers(response)

    except Exception as exc:
        logging.error(f"Registration error: {exc}")
        return json_response({'error': 'Server error'}, 500)
