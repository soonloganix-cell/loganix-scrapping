const express = require('express');
const fatgridController = require('../controllers/fatgrid');

const router = express.Router();

/**
 * GET /fatgrid/get_data
 * Get FatGrid domains and unlocked domains data with pagination
 * 
 * Query Parameters:
 * - limit: Number of domains per page (default: 100)
 * - page_from: Starting page number (default: 1)
 * - page_to: Ending page number (default: 1)
 * - sort: Sort order (default: '-totalTraffic')
 * - type: Domain type (default: 'guest_post')
 * 
 * Authentication:
 * - Authorization header: Bearer YOUR_TOKEN
 * - Query parameter: ?sessionToken=YOUR_TOKEN
 * - Request body: {"sessionToken": "YOUR_TOKEN"}
 * - Environment variable: FATGRID_SESSION_TOKEN
 * 
 * Example:
 * GET /fatgrid/get_data?limit=50&page_from=1&page_to=3
 */
router.get('/get_data', async (req, res) => {
  await fatgridController.getData(req, res);
});

module.exports = router;
