import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import itemRoutes from './routes/item.route.js';
import stockRoutes from './routes/stock.route.js';
import stockUsageRoutes from './routes/stockUsage.route.js';

dotenv.config();

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());

// Configure CORS based on environment
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const clientUrlProduction = process.env.CLIENT_URL_PRODUCTION || 'https://picc-inventory-client.onrender.com';
const isProduction = process.env.NODE_ENV === 'production';

// In production, use the production client URL; in development, use the development client URL
const allowedOrigins = isProduction 
  ? [clientUrlProduction]
  : [clientUrl, 'http://localhost:5174']; // Also allow the fallback port

console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log('CORS allowed origins:', allowedOrigins);

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin is allowed or if we're in development mode
      if (allowedOrigins.includes(origin) || !isProduction) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/stockUsage', stockUsageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 