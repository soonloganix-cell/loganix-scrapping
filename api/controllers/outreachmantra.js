const OutreachmantraService = require('../services/outreachmantra');

class OutreachmantraController {
  /**
   * Get OutreachMantra data with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getData(req, res) {
    try {
      // Get authorization token from various sources
      const token = this.getToken(req);
      
      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Authorization token is required',
          message: 'Please provide OutreachMantra token via Authorization header, query parameter, or request body'
        });
      }

      // Create OutreachMantra service instance
      const outreachmantraService = new OutreachmantraService(token);

      // Get query parameters
      const pageFrom = parseInt(req.query.page_from);
      const pageTo = parseInt(req.query.page_to);
      const inventoryPrefsId = req.query.inventoryPrefsId || '';

      // Validate required parameters
      if (!pageFrom || !pageTo) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters',
          message: 'Both page_from and page_to parameters are required'
        });
      }

      // Validate pagination parameters
      if (pageFrom > pageTo) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pagination parameters',
          message: 'page_from cannot be greater than page_to'
        });
      }

      if (pageFrom < 1 || pageTo < 1) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pagination parameters',
          message: 'page_from and page_to must be greater than 0'
        });
      }

      // Get data from service with pagination and database storage
      const result = await outreachmantraService.getDataWithPaginationAndStore(
        pageFrom, 
        pageTo, 
        inventoryPrefsId
      );

      // Return response
      if (result.success) {
        res.json({
          success: true,
          message: 'Data saved successfully at table outreachmantra_domains',
          data: result,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to process pages',
          message: result.error || 'Unknown error occurred',
          data: result,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('OutreachMantra controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Test connection to OutreachMantra API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnection(req, res) {
    try {
      // Get authorization token from various sources
      const token = this.getToken(req);
      
      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Authorization token is required',
          message: 'Please provide OutreachMantra token via Authorization header, query parameter, or request body'
        });
      }

      // Create OutreachMantra service instance
      const outreachmantraService = new OutreachmantraService(token);

      // Test connection
      const result = await outreachmantraService.testConnection();

      if (result.success) {
        res.json({
          success: true,
          message: 'Connection test successful',
          data: result,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Connection test failed',
          message: result.message,
          data: result,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('OutreachMantra connection test error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get authorization token from request
   * @param {Object} req - Express request object
   * @returns {string|null} Authorization token
   */
  getToken(req) {
    // Try different sources for authorization token
    return req.headers.authorization?.replace('Bearer ', '') || 
           req.body.token || 
           req.query.token || 
           process.env.OUTREACHMANTRA_TOKEN ||
           null;
  }
}

module.exports = new OutreachmantraController();
