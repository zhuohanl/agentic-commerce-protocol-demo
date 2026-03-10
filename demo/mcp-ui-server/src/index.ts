// OTel must be imported before any other modules
import './instrumentation.js';

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerBrowseCatalogTool } from './tools/browse-catalog.js';
import { registerCollectBuyerInfoTool } from './tools/collect-buyer-info.js';
import { registerCollectPaymentDetailsTool } from './tools/collect-payment-details.js';
import { registerLookupItemsTool } from './tools/lookup-items.js';
import { setupCartRoutes } from './routes/cart.js';
import { setupPaymentRoutes } from './routes/payment.js';
import { MerchantSessionService } from './services/MerchantSessionService.js';
import { ProductSearchService } from './services/ProductSearchService.js';
import { ProductFeedService } from './services/ProductFeedService.js';
import { Logger } from './utils/logger.js';

// Load environment variables
config();

const app = express();
const port = parseInt(process.env.PORT || '3112', 10);

// Initialize product feed service first (for caching)
const productFeedService = new ProductFeedService();

// Initialize product search service (uses cached feed)
const productSearchService = new ProductSearchService(productFeedService);

// Export for use in other modules
export { productSearchService, productFeedService, port };

app.use(cors({
  origin: '*',
  exposedHeaders: ['Content-Type'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Store transports by session ID
const transports: { [sessionId: string]: SSEServerTransport } = {};

// Initialize merchant session service with environment variables
const merchantService = new MerchantSessionService(
  process.env.MERCHANT_BASE_URL || 'http://localhost:3000',
  process.env.MERCHANT_API_KEY || 'test_api_key_123',
  process.env.MERCHANT_API_VERSION || '2025-09-29'
);

// Global session ID for cart operations
const CART_SESSION_ID = 'cart-session-global';

// Helper function to create a server instance with tools
const getServer = () => {
  const server = new McpServer({
    name: "option-selector-mcp",
    version: "1.0.0"
  });

  // Register tools
  // registerBrowseCatalogTool(server, merchantService, CART_SESSION_ID);
  registerCollectBuyerInfoTool(server, merchantService, CART_SESSION_ID, port);
  registerCollectPaymentDetailsTool(server, merchantService, CART_SESSION_ID, port);
  registerLookupItemsTool(server, merchantService, productSearchService, CART_SESSION_ID, port);

  return server;
};

// Setup cart routes
setupCartRoutes(app, merchantService, productFeedService, CART_SESSION_ID, port);

// Setup payment routes
setupPaymentRoutes(app, merchantService, CART_SESSION_ID);

// SSE endpoint for establishing the stream
app.get('/mcp', async (req, res) => {
  try {
    // Create a new SSE transport for the client
    // The endpoint for POST messages is '/messages'
    const transport = new SSEServerTransport('/messages', res);

    // Store the transport by session ID
    const sessionId = transport.sessionId;
    transports[sessionId] = transport;

    // Set up onclose handler to clean up transport when closed
    transport.onclose = () => {
      Logger.connectionClosed(sessionId);
      delete transports[sessionId];
      // Don't clear merchant session - maintain state for single-user demo
      // merchantService.clearSession(CART_SESSION_ID);
    };

    // Connect the transport to the MCP server
    const server = getServer();
    await server.connect(transport);

    Logger.connectionEstablished(sessionId);
  } catch (error) {
    console.error('Error establishing SSE stream:', error);
    if (!res.headersSent) {
      res.status(500).send('Error establishing SSE stream');
    }
  }
});

// Messages endpoint for receiving client JSON-RPC requests
app.post('/messages', async (req, res) => {
  // Extract session ID from URL query parameter
  const sessionId = req.query.sessionId as string | undefined;

  if (!sessionId) {
    console.error('No session ID provided in request URL');
    res.status(400).send('Missing sessionId parameter');
    return;
  }

  const transport = transports[sessionId];

  if (!transport) {
    console.error(`No active transport found for session ID: ${sessionId}`);
    res.status(404).send('Session not found');
    return;
  }

  try {
    // Handle the POST message with the transport
    await transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    console.error('Error handling request:', error);
    if (!res.headersSent) {
      res.status(500).send('Error handling request');
    }
  }
});

// Start the server
app.listen(port, async () => {
  Logger.serverStarted(port);

  // Initialize product feed first, then search (search depends on feed cache)
  try {
    await productFeedService.initialize();
    await productSearchService.initialize();
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
});

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');

  // Close all active transports to properly clean up resources
  for (const sessionId in transports) {
    try {
      await transports[sessionId].close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }

  console.log('Server shutdown complete');
  process.exit(0);
});
