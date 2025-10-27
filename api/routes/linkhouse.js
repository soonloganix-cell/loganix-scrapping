const express = require('express');
const linkhouseController = require('../controllers/linkhouse');

const router = express.Router();

/**
 * GET /linkhouse/get_data
 * Get LinkHouse domains data with pagination
 * 
 * Query Parameters:
 * - page_from: Starting page number (required)
 * - page_to: Ending page number (required)
 * - sort: Sort field (default: priority)
 * - by: Sort direction (default: desc)
 * - per_page: Items per page (default: 200)
 * - offer_type: Offer type filter (optional)
 * - sale: Sale filter (default: 0)
 * - sale_bf: Sale BF filter (default: 0)
 * - spring25_filters_enabled: Spring 25 filters (default: 1)
 * - hash: Hash parameter (optional)
 * 
 * Authentication Headers:
 * - Cookie: LinkHouse session cookie (required)
 * - Referer: Referer header (optional)
 * 
 * Alternative Authentication:
 * - Query parameters: ?cookie=YOUR_COOKIE&referer=YOUR_REFERER
 * - Request body: {"cookie": "YOUR_COOKIE", "referer": "YOUR_REFERER"}
 * - Environment variables: LINKHOUSE_COOKIE, LINKHOUSE_REFERER
 * 
 * Example:
 * GET /linkhouse/get_data?page_from=1&page_to=5&cookie=YOUR_COOKIE&per_page=200
 */
router.get('/get_data', async (req, res) => {
  await linkhouseController.getData(req, res);
});

/**
 * GET /linkhouse/test_connection
 * Test connection to LinkHouse API
 * 
 * Authentication Headers:
 * - Cookie: LinkHouse session cookie (required)
 * - Referer: Referer header (optional)
 * 
 * Alternative Authentication:
 * - Query parameters: ?cookie=YOUR_COOKIE&referer=YOUR_REFERER
 * - Request body: {"cookie": "YOUR_COOKIE", "referer": "YOUR_REFERER"}
 * - Environment variables: LINKHOUSE_COOKIE, LINKHOUSE_REFERER
 * 
 * Example:
 * GET /linkhouse/test_connection?cookie=YOUR_COOKIE&referer=YOUR_REFERER
 */
router.get('/test_connection', async (req, res) => {
  await linkhouseController.testConnection(req, res);
});

module.exports = router;
