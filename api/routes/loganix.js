const express = require('express');
const loganixController = require('../controllers/loganix');

const router = express.Router();

/**
 * GET /loganix/get_data
 * Process Loganix data from JSON file and insert into database
 * 
 * This endpoint:
 * - Loads data from /manual/loganix/data.json
 * - Extracts relevant fields from each record
 * - Processes data in chunks of 4,000 records
 * - Inserts data into the loganix_domains table
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Loganix data processed successfully",
 *   "data": {
 *     "totalRecords": 1000,
 *     "totalProcessed": 1000,
 *     "totalErrors": 0,
 *     "initialCount": 0,
 *     "finalCount": 1000,
 *     "actualInserted": 1000
 *   }
 * }
 */
router.get('/get_data', async (req, res) => {
  await loganixController.getData(req, res);
});

module.exports = router;

