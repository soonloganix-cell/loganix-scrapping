const express = require('express');
const outreachmantraController = require('../controllers/outreachmantra');

const router = express.Router();

/**
 * GET /outreachmantra/get_data
 * Get OutreachMantra domains data with pagination
 * 
 * Query Parameters:
 * - page_from: Starting page number (required)
 * - page_to: Ending page number (required)
 * - inventoryPrefsId: Inventory preferences ID (optional)
 * 
 * Authentication:
 * - Authorization header: Bearer YOUR_TOKEN
 * - Query parameter: ?token=YOUR_TOKEN
 * - Request body: {"token": "YOUR_TOKEN"}
 * - Environment variable: OUTREACHMANTRA_TOKEN
 * 
 * Example:
 * GET /outreachmantra/get_data?page_from=1&page_to=5&token=YOUR_TOKEN
 */
router.get('/get_data', async (req, res) => {
  await outreachmantraController.getData(req, res);
});

/**
 * GET /outreachmantra/test_connection
 * Test connection to OutreachMantra API
 * 
 * Authentication:
 * - Authorization header: Bearer YOUR_TOKEN
 * - Query parameter: ?token=YOUR_TOKEN
 * - Request body: {"token": "YOUR_TOKEN"}
 * - Environment variable: OUTREACHMANTRA_TOKEN
 * 
 * Example:
 * GET /outreachmantra/test_connection?token=YOUR_TOKEN
 */
router.get('/test_connection', async (req, res) => {
  await outreachmantraController.testConnection(req, res);
});

module.exports = router;
