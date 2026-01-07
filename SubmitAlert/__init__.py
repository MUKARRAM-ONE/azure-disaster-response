import json
import logging
import os
import time
import uuid
from datetime import datetime, timezone
import azure.functions as func
from azure.data.tables import TableServiceClient, TableEntity


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

        # Get Azure Storage configuration
        connection_string = os.environ.get('AZURE_STORAGE_CONNECTION_STRING')
        table_name = os.environ.get('TABLE_NAME', 'Alerts')

        if not connection_string:
            raise Exception("Azure Storage connection string not configured")

        # Initialize Table Service client
        table_service = TableServiceClient.from_connection_string(connection_string)
        table_client = table_service.get_table_client(table_name)

        # Generate unique ID using UUID for better collision resistance
        alert_id = str(uuid.uuid4())
        timestamp_str = datetime.now(timezone.utc).isoformat()

        # Create alert entity for Table Storage
        # PartitionKey: alert type, RowKey: unique ID
        alert_entity = {
            "PartitionKey": alert_type,
            "RowKey": alert_id,
            "location": location,
            "type": alert_type,
            "severity": severity,
            "timestamp": timestamp_str,
            "status": "new"
        }

        # Save to Azure Table Storage
        table_client.create_entity(entity=alert_entity)

        logging.info(f"Alert saved successfully: {alert_id}")
        
        # Prepare response data
        created_item = {
            "id": alert_id,
            "location": location,
            "type": alert_type,
            "severity": severity,
            "timestamp": timestamp_str,
            "status": "new"
        }

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
        logging.error(f'Error saving alert to Table Storage: {str(error)}')
        
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
