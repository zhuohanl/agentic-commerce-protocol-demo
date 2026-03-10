// OTel must be imported before any other modules
import './instrumentation';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database';
import delegatePaymentRouter from './routes/delegatePayment';
import paymentIntentRouter from './routes/paymentIntent';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', delegatePaymentRouter);
app.use('/', paymentIntentRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    type: 'invalid_request',
    code: 'route_not_found',
    message: 'The requested endpoint does not exist',
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initDatabase();
    console.log('Database initialized');

    app.listen(PORT, () => {
      console.log(`PSP Mock Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
