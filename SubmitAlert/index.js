const { CosmosClient } = require("@azure/cosmos");

module.exports = async function (context, req) {
    context.log('SubmitAlert function processing a request.');

    // CORS headers
    context.res = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    };

    // Handle OPTIONS request for CORS preflight
    if (req.method === "OPTIONS") {
        context.res.status = 200;
        return;
    }

    // Validate HTTP method
    if (req.method !== "POST") {
        context.res.status = 405;
        context.res.body = { error: "Method not allowed. Use POST." };
        return;
    }

    // Extract and validate request body
    const { location, type, severity } = req.body || {};

    if (!location || !type || !severity) {
        context.res.status = 400;
        context.res.body = { 
            error: "Missing required fields. Please provide location, type, and severity." 
        };
        return;
    }

    try {
        // Initialize Cosmos DB client
        const endpoint = process.env.COSMOS_ENDPOINT;
        const key = process.env.COSMOS_KEY;
        const databaseId = process.env.COSMOS_DATABASE_ID || "DisasterResponseDB";
        const containerId = process.env.COSMOS_CONTAINER_ID || "Alerts";

        if (!endpoint || !key) {
            throw new Error("Cosmos DB connection settings not configured");
        }

        const client = new CosmosClient({ endpoint, key });
        const database = client.database(databaseId);
        const container = database.container(containerId);

        // Create alert document
        const alertDocument = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            location,
            type,
            severity,
            timestamp: new Date().toISOString(),
            status: "new"
        };

        // Save to Cosmos DB
        const { resource: createdItem } = await container.items.create(alertDocument);

        context.log(`Alert saved successfully: ${createdItem.id}`);

        // Return success response
        context.res.status = 201;
        context.res.body = {
            success: true,
            message: "Alert submitted successfully",
            data: createdItem
        };

    } catch (error) {
        context.log.error('Error saving alert to Cosmos DB:', error);
        
        context.res.status = 500;
        context.res.body = {
            success: false,
            error: "Failed to save alert",
            details: error.message
        };
    }
};
