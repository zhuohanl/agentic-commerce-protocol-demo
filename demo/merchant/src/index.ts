/**
 * Main application entry point
 */

// OTel must be imported before any other modules
import './instrumentation';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getPool, initializeDatabase, closeDatabase } from './config/database';
import { SessionManager } from './services/SessionManager';
import { CheckoutController } from './controllers/CheckoutController';
import { ProductController } from './controllers/ProductController';
import { ProductFeedGenerator } from './services/ProductFeedGenerator';
import { ProductCatalog } from './models/product';
import { createRoutes } from './routes';
import { authenticateApiKey } from './middleware/auth';
import { validateApiVersion, validateContentType } from './middleware/validation';
import { errorHandler } from './middleware/error';
import { logRequest } from './middleware/logging';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware - log all requests with Request-Id
app.use(logRequest);

// Global middleware
app.use(validateContentType);

// Health check endpoint (no auth required)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '2025-09-12',
  });
});

// Initialize services
const pool = getPool();
const sessionManager = new SessionManager(pool);
const checkoutController = new CheckoutController(sessionManager);
const productController = new ProductController(pool);
const productCatalog = new ProductCatalog(pool);
const feedGenerator = new ProductFeedGenerator(
  productCatalog,
  process.env.BASE_URL || 'https://merchant.example.com'
);

// Product Feed endpoints (no auth required - public feeds)
app.get('/product-feed.json', async (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=900'); // Cache for 15 mins
  res.send(await feedGenerator.generateJSON());
});

app.get('/product-feed.xml', async (_req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=900');
  res.send(await feedGenerator.generateXML());
});

app.get('/product-feed.csv', async (_req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
  res.setHeader('Cache-Control', 'public, max-age=900');
  res.send(await feedGenerator.generateCSV());
});

app.get('/product-feed/validate', async (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(await feedGenerator.validateFeed());
});

// Protected routes (require auth and API version)
const protectedRoutes = createRoutes(checkoutController, productController);
app.use('/', authenticateApiKey, validateApiVersion, protectedRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`\n🚀 Merchant Server`);
      console.log(`   Port: ${PORT}`);
      console.log(`   API Version: ${process.env.API_VERSION || '2025-09-12'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

// Start the server
startServer();