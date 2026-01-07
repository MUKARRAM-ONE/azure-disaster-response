const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

// Initialize Cosmos DB client
const endpoint = process.env.COSMOS_ENDPOINT || 'https://localhost:8081';
const key = process.env.COSMOS_KEY || '';
const client = new CosmosClient({ endpoint, key });

const databaseId = 'DisasterDB';
const containerId = 'Alerts';

app.http('SubmitAlert', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Processing disaster alert submission...');

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            };
        }

        try {
            // Parse request body
            const alertData = await request.json();
            
            // Validate required fields
            const { location, type, severity, message } = alertData;
            
            if (!location || !type || !severity || !message) {
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        error: 'Missing required fields: location, type, severity, message'
                    })
                };
            }

            // Validate severity level
            const validSeverities = ['Low', 'Medium', 'High', 'Critical'];
            if (!validSeverities.includes(severity)) {
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}`
                    })
                };
            }

            // Prepare document for Cosmos DB
            const alertDocument = {
                id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                location,
                type,
                severity,
                message,
                timestamp: new Date().toISOString(),
                status: 'active'
            };

            // Save to Cosmos DB
            const database = client.database(databaseId);
            const container = database.container(containerId);
            const { resource: createdItem } = await container.items.create(alertDocument);

            context.log(`Alert saved successfully: ${createdItem.id}`);

            return {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Alert submitted successfully',
                    alertId: createdItem.id,
                    data: createdItem
                })
            };

        } catch (error) {
            context.error('Error processing alert:', error);
            
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Failed to submit alert',
                    details: error.message
                })
            };
        }
    }
});
