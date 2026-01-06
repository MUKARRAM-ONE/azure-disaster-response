import json
import logging
import os
import time
import random
import string
from datetime import datetime
import azure.functions as func
from azure.cosmos import CosmosClient, exceptions


def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Azure Function to submit disaster alerts to Cosmos DB.
    Accepts POST requests with location, type, and severity.
    """
    logging.info('SubmitAlert function processing a request.')

    # Handle CORS preflight
    if req.method == "OPTIONS":
        return func.HttpResponse(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )

    # Validate HTTP method
    if req.method != "POST":
        return func.HttpResponse(
            json.dumps({"error": "Method not allowed. Use POST."}),
            status_code=405,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )

    try:
        # Parse request body
        req_body = req.get_json()
        location = req_body.get('location')
        alert_type = req_body.get('type')
        severity = req_body.get('severity')

        # Validate required fields
        if not location or not alert_type or not severity:
            return func.HttpResponse(
                json.dumps({
                    "error": "Missing required fields. Please provide location, type, and severity."
                }),
                status_code=400,
                mimetype="application/json",
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            )

        # Get Cosmos DB configuration
        endpoint = os.environ.get('COSMOS_ENDPOINT')
        key = os.environ.get('COSMOS_KEY')
        database_id = os.environ.get('COSMOS_DATABASE_ID', 'DisasterResponseDB')
        container_id = os.environ.get('COSMOS_CONTAINER_ID', 'Alerts')

        if not endpoint or not key:
            raise Exception("Cosmos DB connection settings not configured")

        # Initialize Cosmos DB client
        client = CosmosClient(endpoint, key)
        database = client.get_database_client(database_id)
        container = database.get_container_client(container_id)

        # Generate unique ID
        # NOTE: ID generation uses timestamp + random string. For high-load production
        # environments, consider using the 'uuid' module for better collision resistance.
        random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=9))
        alert_id = f"{int(time.time() * 1000)}-{random_suffix}"

        # Create alert document
        alert_document = {
            "id": alert_id,
            "location": location,
            "type": alert_type,
            "severity": severity,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "status": "new"
        }

        # Save to Cosmos DB
        created_item = container.create_item(body=alert_document)

        logging.info(f"Alert saved successfully: {created_item['id']}")

        # Return success response
        return func.HttpResponse(
            json.dumps({
                "success": True,
                "message": "Alert submitted successfully",
                "data": created_item
            }),
            status_code=201,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )

    except ValueError:
        return func.HttpResponse(
            json.dumps({
                "error": "Invalid JSON in request body"
            }),
            status_code=400,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )
    except Exception as error:
        logging.error(f'Error saving alert to Cosmos DB: {str(error)}')
        
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "error": "Failed to save alert",
                "details": str(error)
            }),
            status_code=500,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )
