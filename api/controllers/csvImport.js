const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CsvImportService = require('../services/csvImport');
const { sequelizePostgres } = require('../../config/database');

/**
 * CSV Import Controller
 * Handles HTTP requests for CSV import functionality
 */
class CsvImportController {
  constructor() {
    this.csvImportService = new CsvImportService(sequelizePostgres);
    
    // Configure multer for file uploads
    this.upload = multer({
      dest: 'uploads/', // Temporary directory for uploaded files
      fileFilter: (req, file, cb) => {
        // Check if file is CSV
        if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed'), false);
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
      }
    });
  }

  /**
   * Get multer middleware for file upload
   * @returns {Function} Multer middleware
   */
  getUploadMiddleware() {
    return this.upload.single('csv');
  }

  /**
   * Handle CSV file upload and import
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async importCsv(req, res) {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No CSV file uploaded. Please provide a CSV file in the "csv" field.'
        });
      }

      // Get table parameter from query string
      const table = req.query.table || 'sites';
      const supportedTables = ['sites', 'publisher_sites', 'vendor_sites'];
      
      if (!supportedTables.includes(table)) {
        return res.status(400).json({
          success: false,
          error: `Unsupported table: ${table}. Supported tables: ${supportedTables.join(', ')}`
        });
      }

      console.log(`📁 File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);
      console.log(`🎯 Target table: ${table}`);

      // Import CSV data
      const result = await this.csvImportService.importCsvData(req.file.path, table);

      // Clean up uploaded file
      try {
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Temporary file cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up temporary file:', cleanupError.message);
      }

      // Return result
      if (result.success) {
        res.json({
          success: true,
          message: 'CSV import completed successfully',
          data: {
            totalProcessed: result.totalProcessed,
            totalInserted: result.totalInserted,
            totalErrors: result.totalErrors,
            chunksProcessed: result.chunksProcessed
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || 'CSV import failed',
          data: {
            totalProcessed: result.totalProcessed,
            totalInserted: result.totalInserted,
            totalErrors: result.totalErrors,
            chunksProcessed: result.chunksProcessed,
            errors: result.errors
          }
        });
      }

    } catch (error) {
      console.error('❌ Error in CSV import controller:', error);
      
      // Clean up uploaded file if it exists
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.warn('⚠️ Could not clean up temporary file:', cleanupError.message);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error during CSV import',
        details: error.message
      });
    }
  }

  /**
   * Test PostgreSQL database connection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnection(req, res) {
    try {
      const table = req.query.table || 'sites';
      const result = await this.csvImportService.testConnection(table);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ Error testing PostgreSQL connection:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test PostgreSQL connection',
        details: error.message
      });
    }
  }

  /**
   * Get import statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStats(req, res) {
    try {
      const table = req.query.table || 'sites';
      let result;
      
      switch (table) {
        case 'sites':
          result = await this.csvImportService.sitesRepository.getTotalCount();
          break;
        case 'publisher_sites':
          result = await this.csvImportService.publisherSitesRepository.getTotalCount();
          break;
        case 'vendor_sites':
          result = await this.csvImportService.vendorSitesRepository.getTotalCount();
          break;
        default:
          return res.status(400).json({
            success: false,
            error: `Unsupported table: ${table}. Supported tables: sites, publisher_sites, vendor_sites`
          });
      }
      
      if (result.success) {
        res.json({
          success: true,
          data: {
            totalSites: result.count
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('❌ Error getting import statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get statistics',
        details: error.message
      });
    }
  }
}

module.exports = CsvImportController;
