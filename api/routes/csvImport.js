const express = require('express');
const CsvImportController = require('../controllers/csvImport');

const router = express.Router();
const csvImportController = new CsvImportController();

/**
 * POST /loganix_csv_sql
 * Import CSV data to PostgreSQL database
 * 
 * @route POST /loganix_csv_sql
 * @desc Upload and import CSV file to PostgreSQL sites table
 * @access Public
 * @param {File} csv - CSV file to import (multipart/form-data)
 * @returns {Object} Import result with statistics
 * 
 * @example
 * curl -X POST http://localhost:3000/api/loganix_csv_sql \
 *   -F "csv=@data.csv"
 */
router.post('/loganix_csv_sql', csvImportController.getUploadMiddleware(), (req, res) => {
  csvImportController.importCsv(req, res);
});

/**
 * GET /loganix_csv_sql/test
 * Test PostgreSQL database connection
 * 
 * @route GET /loganix_csv_sql/test
 * @desc Test PostgreSQL database connection
 * @access Public
 * @returns {Object} Connection test result
 * 
 * @example
 * curl -X GET http://localhost:3000/api/loganix_csv_sql/test
 */
router.get('/loganix_csv_sql/test', (req, res) => {
  csvImportController.testConnection(req, res);
});

/**
 * GET /loganix_csv_sql/stats
 * Get import statistics
 * 
 * @route GET /loganix_csv_sql/stats
 * @desc Get total number of sites in database
 * @access Public
 * @returns {Object} Statistics data
 * 
 * @example
 * curl -X GET http://localhost:3000/api/loganix_csv_sql/stats
 */
router.get('/loganix_csv_sql/stats', (req, res) => {
  csvImportController.getStats(req, res);
});

module.exports = router;
