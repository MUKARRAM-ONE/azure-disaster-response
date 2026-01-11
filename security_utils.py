"""
Security utilities for Azure Functions
Includes rate limiting, input validation, and security headers
"""
import re
import time
from functools import wraps
from typing import Dict, Callable

# Simple in-memory rate limiter (for production use Redis or Azure Cache)
rate_limit_store: Dict[str, list] = {}

def rate_limit(max_requests: int = 10, window_seconds: int = 60):
    """
    Rate limiting decorator
    Args:
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds
    """
    def decorator(func_to_wrap: Callable):
        @wraps(func_to_wrap)
        def wrapper(req, *args, **kwargs):
            import azure.functions as func
            
            # Get client identifier (IP or user)
            client_id = req.headers.get('X-Forwarded-For', req.headers.get('X-Real-IP', 'unknown'))
            
            current_time = time.time()
            key = f"{func_to_wrap.__name__}:{client_id}"
            
            # Clean old entries
            if key in rate_limit_store:
                rate_limit_store[key] = [
                    timestamp for timestamp in rate_limit_store[key]
                    if current_time - timestamp < window_seconds
                ]
            else:
                rate_limit_store[key] = []
            
            # Check rate limit
            if len(rate_limit_store[key]) >= max_requests:
                return func.HttpResponse(
                    '{"error": "Rate limit exceeded. Please try again later."}',
                    status_code=429,
                    headers={
                        'Content-Type': 'application/json',
                        'Retry-After': str(window_seconds)
                    }
                )
            
            # Add current request
            rate_limit_store[key].append(current_time)
            
            return func_to_wrap(req, *args, **kwargs)
        return wrapper
    return decorator


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email)) and len(email) <= 254


def validate_password(password):
    """
    Validate password strength
    Returns: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if len(password) > 128:
        return False, "Password is too long"
    if not re.search(r'[A-Za-z]', password):
        return False, "Password must contain at least one letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, ""


def sanitize_input(text, max_length=1000):
    """Sanitize user input"""
    if not text:
        return ""
    # Remove null bytes and control characters
    text = ''.join(char for char in text if ord(char) >= 32 or char in '\n\r\t')
    # Truncate to max length
    return text[:max_length].strip()


def validate_location(location):
    """Validate location format"""
    if not location or len(location) < 3:
        return False
    if len(location) > 200:
        return False
    # Allow letters, numbers, spaces, and common punctuation
    return bool(re.match(r'^[a-zA-Z0-9\s,.-]+$', location))


def validate_severity(severity):
    """Validate severity level"""
    valid_levels = ['Low', 'Medium', 'High', 'Critical']
    return severity in valid_levels


def validate_disaster_type(disaster_type):
    """Validate disaster type"""
    valid_types = [
        'Flood', 'Fire', 'Earthquake', 'Hurricane', 'Tornado',
        'Tsunami', 'Landslide', 'Drought', 'Avalanche', 'Volcanic Eruption',
        'Wildfire', 'Storm', 'Cyclone', 'Other'
    ]
    return disaster_type in valid_types


def add_security_headers(response):
    """Add security headers to response"""
    import azure.functions as func
    
    if not hasattr(response, 'headers'):
        return response
    
    security_headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'",
    }
    
    for header, value in security_headers.items():
        if header not in response.headers:
            response.headers[header] = value
    
    return response


def validate_json_content_type(req):
    """Validate that request has JSON content type"""
    content_type = req.headers.get('Content-Type', '')
    return 'application/json' in content_type.lower()
