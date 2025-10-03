const express = require('express');
const searcheyeController = require('../controllers/searcheye');

const router = express.Router();

/**
 * GET /searcheye/get_data
 * Processes JSON data and stores it in the database
 */
router.get('/get_data', async (req, res) => {
  await searcheyeController.getData(req, res);
});

module.exports = router;
