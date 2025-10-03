const express = require('express');
const nobsMktController = require('../controllers/nobsmkt');

const router = express.Router();

/**
 * GET /nobsmkt/get_data
 * Process NobsMkt data from JSON file and insert into database
 * 
 * This endpoint:
 * - Loads data from /manual/nobsmarketplace/data.json
 * - Extracts relevant fields from each record
 * - Processes data in chunks of 4,000 records
 * - Inserts data into the nobsmkt table
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "NobsMkt data processed successfully",
 *   "data": {
 *     "totalRecords": 1000,
 *     "totalProcessed": 1000,
 *     "totalErrors": 0
 *   }
 * }
 */
router.get('/get_data', async (req, res) => {
  await nobsMktController.getData(req, res);
});

module.exports = router;

