require('dotenv').config({ path: __dirname + '/.env' });
console.log('Environment variables:', {
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const runSystemCheck = require('./utils/systemCheck');
const fileRoutes = require('./routes/file.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;
const HOST = '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get('/ping', (req, res) => {
  console.log('Received ping request');
  res.json({ 
    message: 'pong', 
    timestamp: new Date(),
    serverInfo: {
      hostname: require('os').hostname(),
      platform: process.platform,
      nodeVersion: process.version
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  console.log('Received health check request');
  try {
    const systemStatus = await runSystemCheck();
    res.json({ status: 'healthy', ...systemStatus });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      details: error.details
    });
  }
});

// Routes
app.use('/api/test', require('./routes/test'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/developer', require('./routes/developer'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/admins', require('./routes/admins.routes'));
app.use('/api/files', fileRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/messages', require('./routes/message.routes'));

// 404 handler
app.use((req, res, next) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID Format',
      details: err.message
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate Entry',
      details: err.message
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Please provide a valid authentication token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'Your session has expired. Please log in again'
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Perform graceful shutdown
  shutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Perform graceful shutdown
  shutdown();
});

// Graceful shutdown function
async function shutdown() {
  console.log('Initiating graceful shutdown...');
  
  // Close server
  if (server) {
    server.close(() => {
      console.log('Server closed');
    });
  }
  
  // Close database connection
  try {
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
  
  // Exit process
  process.exit(1);
}

let server;

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Run system check before starting server
    try {
      await runSystemCheck();
      console.log('System check passed');
      
      // Start server after successful system check
      server = app.listen(PORT, HOST, () => {
        const addr = server.address();
        console.log(`Server is running at http://${HOST}:${PORT}`);
        console.log('Server address:', addr);
        console.log('Try accessing:');
        console.log(`  - http://${HOST}:${PORT}/ping`);
        console.log(`  - http://localhost:${PORT}/ping`);
        console.log(`  - http://127.0.0.1:${PORT}/ping`);
      });

      server.on('error', (error) => {
        console.error('Server error:', error);
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use`);
        }
      });
      
      // Handle graceful shutdown on SIGTERM
      process.on('SIGTERM', () => {
        console.log('SIGTERM received');
        shutdown();
      });
      
    } catch (error) {
      console.error('System check failed:', error);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
} 