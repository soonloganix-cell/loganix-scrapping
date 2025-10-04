const express = require('express');
const meupController = require('../controllers/meup');

const router = express.Router();

/**
 * GET /meup/get_data
 * Get MeUp domains data with pagination
 * 
 * Query Parameters:
 * - page_from: Starting page number (required)
 * - page_to: Ending page number (required)
 * 
 * Authentication Headers:
 * - Cookie: MeUp session cookie (required)
 * - X-Xsrf-Token: CSRF token (required)
 * 
 * Alternative Authentication:
 * - Query parameters: ?cookie=YOUR_COOKIE&token=YOUR_TOKEN
 * - Request body: {"cookie": "YOUR_COOKIE", "token": "YOUR_TOKEN"}
 * - Environment variables: MEUP_COOKIE, MEUP_XSRF_TOKEN
 * 
 * Example:
 * GET /meup/get_data?page_from=1&page_to=5&cookie=YOUR_COOKIE&token=YOUR_TOKEN
 */
router.get('/get_data', async (req, res) => {
  await meupController.getData(req, res);
});

/**
 * GET /meup/test_connection
 * Test connection to MeUp API
 * 
 * Authentication Headers:
 * - Cookie: MeUp session cookie (required)
 * - X-Xsrf-Token: CSRF token (required)
 * 
 * Alternative Authentication:
 * - Query parameters: ?cookie=YOUR_COOKIE&token=YOUR_TOKEN
 * - Request body: {"cookie": "YOUR_COOKIE", "token": "YOUR_TOKEN"}
 * - Environment variables: MEUP_COOKIE, MEUP_XSRF_TOKEN
 * 
 * Example:
 * GET /meup/test_connection?cookie=YOUR_COOKIE&token=YOUR_TOKEN
 */
router.get('/test_connection', async (req, res) => {
  await meupController.testConnection(req, res);
});

module.exports = router;
