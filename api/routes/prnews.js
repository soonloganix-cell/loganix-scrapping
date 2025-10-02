const express = require('express');
const prNewsController = require('../controllers/prnews');

const router = express.Router();

/**
 * GET /prnews/test
 * Test connection to PRNews API (HTTP requests)
 */
router.get('/test', async (req, res) => {
  await prNewsController.testConnection(req, res);
});

/**
 * GET /prnews/test-puppeteer
 * Test connection to PRNews API using Puppeteer (bypasses Cloudflare)
 */
router.get('/test-puppeteer', async (req, res) => {
  await prNewsController.testConnectionPuppeteer(req, res);
});

/**
 * GET /prnews/get_data
 * Get PRNews data using HTTP requests (may be blocked by Cloudflare)
 */
router.get('/get_data_deprecated', async (req, res) => {
  await prNewsController.getData(req, res);
});

/**
 * GET /prnews/get_data-puppeteer
 * Get PRNews data using Puppeteer (bypasses Cloudflare protection)
 */
router.get('/get_data', async (req, res) => {
  await prNewsController.getDataPuppeteer(req, res);
});

module.exports = router;


