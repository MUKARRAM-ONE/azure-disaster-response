import os
import json
import jwt
import bcrypt
from datetime import datetime, timedelta
import azure.functions as func

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }

def json_response(body, status_code=200):
    return func.HttpResponse(
        json.dumps(body),
        status_code=status_code,
        headers=cors_headers(),
        mimetype='application/json'
    )

JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret-change-me')
JWT_ALGO = 'HS256'
JWT_EXPIRES_MINUTES = int(os.environ.get('JWT_EXPIRES_MINUTES', '10080'))  # default 7 days

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def issue_token(user: dict) -> str:
    payload = {
        'sub': user['id'],
        'email': user['email'],
        'name': user.get('name') or user['email'],
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(minutes=JWT_EXPIRES_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])

def get_bearer_token(req: func.HttpRequest):
    auth_header = req.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ', 1)[1]
    return None

def require_user(req: func.HttpRequest):
    token = get_bearer_token(req)
    if not token:
        return None, json_response({'error': 'Unauthorized'}, 401)
    try:
        user = decode_token(token)
        return user, None
    except Exception as exc:
        return None, json_response({'error': 'Invalid or expired token', 'detail': str(exc)}, 401)
