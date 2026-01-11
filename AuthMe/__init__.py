import azure.functions as func
from auth_utils import cors_headers, json_response, require_user


def main(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == 'OPTIONS':
        return func.HttpResponse(status_code=204, headers=cors_headers())

    user, error_response = require_user(req)
    if error_response:
        return error_response

    profile = {
        'id': user.get('sub'),
        'email': user.get('email'),
        'name': user.get('name')
    }
    return json_response({'user': profile}, 200)
