// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');

// Import database configuration
const { testConnection } = require('./config/database');

// Import route modules
const fatgridRoutes = require('./api/routes/fatgrid');
const prnewsRoutes = require('./api/routes/prnews');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/fatgrid', fatgridRoutes);
app.use('/prnews', prnewsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'API Scraping Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      fatgrid: {
        getData: 'GET /fatgrid/get_data'
      },
      prnews: {
        getData: 'GET /prnews/get_data'
      }
    },
    usage: {
      setup: 'Set FATGRID_SESSION_TOKEN environment variable or use config.js',
      start: 'npm start or node server.js',
      development: 'npm run dev (with nodemon)'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 API Scraping Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API docs: http://localhost:${PORT}/`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 FatGrid endpoint: http://localhost:${PORT}/fatgrid/get_data`);
  
  // Test database connection
  await testConnection();
});

module.exports = app;