import json
import logging
import os
from azure.cosmos import CosmosClient
import azure.functions as func
from auth_utils import cors_headers, json_response, verify_password, issue_token
from security_utils import rate_limit, validate_email, sanitize_input, add_security_headers

COSMOS_ENDPOINT = os.environ.get('COSMOS_ENDPOINT')
COSMOS_KEY = os.environ.get('COSMOS_KEY')
COSMOS_DATABASE = os.environ.get('COSMOS_DATABASE_NAME', 'DisasterResponseDB')
COSMOS_CONTAINER = os.environ.get('COSMOS_CONTAINER_ID', 'users')


def get_container():
    client = CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY)
    database = client.get_database_client(COSMOS_DATABASE)
    return database.get_container_client(COSMOS_CONTAINER)


@rate_limit(max_requests=10, window_seconds=300)  # 10 login attempts per 5 minutes
def main(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == 'OPTIONS':
        return func.HttpResponse(status_code=204, headers=cors_headers())

    try:
        data = req.get_json()
    except ValueError:
        return json_response({'error': 'Invalid JSON payload'}, 400)

    email = sanitize_input((data.get('email') or '').strip().lower(), max_length=254)
    password = data.get('password') or ''

    if not email or not password:
        return json_response({'error': 'Email and password are required'}, 400)
    
    if not validate_email(email):
        return json_response({'error': 'Invalid email address'}, 400)

    try:
        container = get_container()
        items = list(container.query_items(
            query="SELECT * FROM c WHERE c.type = 'user' AND c.email = @email",
            parameters=[{'name': '@email', 'value': email}],
            enable_cross_partition_query=True
        ))
        if not items:
            return json_response({'error': 'Invalid credentials'}, 401)

        user_doc = items[0]
        
        # Check if user is blocked
        if user_doc.get('blocked', False):
            return json_response({'error': 'Account is blocked'}, 403)
        
        if not verify_password(password, user_doc.get('passwordHash', user_doc.get('password_hash', ''))):
            return json_response({'error': 'Invalid credentials'}, 401)

        token = issue_token(user_doc)
        profile = {
            'id': user_doc['id'],
            'email': user_doc['email'],
            'name': user_doc.get('name'),
            'verified': user_doc.get('verified', False),
            'role': user_doc.get('role', 'user')
        }
        response = json_response({'token': token, 'user': profile}, 200)
        return add_security_headers(response)

    except Exception as exc:
        logging.error(f"Login error: {exc}")
        return json_response({'error': 'Server error'}, 500)
