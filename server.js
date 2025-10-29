// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');

// Import database configuration
const { testConnection, testPostgresConnection } = require('./config/database');

// Import route modules
const fatgridRoutes = require('./api/routes/fatgrid');
const prnewsRoutes = require('./api/routes/prnews');
const nobsmktRoutes = require('./api/routes/nobsmkt');
const searcheyeRoutes = require('./api/routes/searcheye');
const outreachmantraRoutes = require('./api/routes/outreachmantra');
const meupRoutes = require('./api/routes/meup');
const loganixRoutes = require('./api/routes/loganix');
const linkhouseRoutes = require('./api/routes/linkhouse');
const csvImportRoutes = require('./api/routes/csvImport');

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
app.use('/nobsmkt', nobsmktRoutes);
app.use('/searcheye', searcheyeRoutes);
app.use('/outreachmantra', outreachmantraRoutes);
app.use('/meup', meupRoutes);
app.use('/loganix', loganixRoutes);
app.use('/linkhouse', linkhouseRoutes);
app.use('/', csvImportRoutes);

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
      },
      nobsmkt: {
        getData: 'GET /nobsmkt/get_data'
      },
      searcheye: {
        getData: 'GET /searcheye/get_data'
      },
      outreachmantra: {
        getData: 'GET /outreachmantra/get_data',
        testConnection: 'GET /outreachmantra/test_connection'
      },
      meup: {
        getData: 'GET /meup/get_data',
        testConnection: 'GET /meup/test_connection'
      },
      loganix: {
        getData: 'GET /loganix/get_data'
      },
      linkhouse: {
        getData: 'GET /linkhouse/get_data',
        testConnection: 'GET /linkhouse/test_connection'
      },
      csvImport: {
        importCsv: 'POST /loganix_csv_sql',
        testConnection: 'GET /loganix_csv_sql/test',
        getStats: 'GET /loganix_csv_sql/stats'
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
  console.log(`🎯 PRNews endpoint: http://localhost:${PORT}/prnews/get_data`);
  console.log(`🎯 NobsMkt endpoint: http://localhost:${PORT}/nobsmkt/get_data`);
  console.log(`🎯 Searcheye endpoint: http://localhost:${PORT}/searcheye/get_data`);
  console.log(`🎯 OutreachMantra endpoint: http://localhost:${PORT}/outreachmantra/get_data`);
  console.log(`🎯 MeUp endpoint: http://localhost:${PORT}/meup/get_data`);
  console.log(`🎯 Loganix endpoint: http://localhost:${PORT}/loganix/get_data`);
  console.log(`🎯 LinkHouse endpoint: http://localhost:${PORT}/linkhouse/get_data`);
  console.log(`🎯 CSV Import endpoint: http://localhost:${PORT}/loganix_csv_sql`);
  
  // Test database connections
  await testConnection();
  await testPostgresConnection();
});

module.exports = app;