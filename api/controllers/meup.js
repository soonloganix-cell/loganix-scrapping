const MeUpService = require('../services/meup');

class MeUpController {
  /**
   * Get MeUp data with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getData(req, res) {
    try {
      // Get authentication credentials from various sources
      const { cookie, token } = this.getCredentials(req);
      
      if (!cookie || !token) {
        return res.status(400).json({
          success: false,
          error: 'Authentication credentials are required',
          message: 'Please provide MeUp cookie and X-Xsrf-Token via headers, query parameters, or request body'
        });
      }

      // Create MeUp service instance
      const meUpService = new MeUpService(cookie, token);

      // Get query parameters
      const pageFrom = parseInt(req.query.page_from);
      const pageTo = parseInt(req.query.page_to);

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
      const result = await meUpService.getDataWithPaginationAndStore(pageFrom, pageTo);

      // Return response
      if (result.success) {
        res.json({
          success: true,
          message: 'Data saved successfully at table meup_domains',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to process pages',
          message: result.error || 'Unknown error occurred',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('MeUp controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Test connection to MeUp API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnection(req, res) {
    try {
      // Get authentication credentials from various sources
      const { cookie, token } = this.getCredentials(req);
      
      if (!cookie || !token) {
        return res.status(400).json({
          success: false,
          error: 'Authentication credentials are required',
          message: 'Please provide MeUp cookie and X-Xsrf-Token via headers, query parameters, or request body'
        });
      }

      // Create MeUp service instance
      const meUpService = new MeUpService(cookie, token);

      // Test connection
      const result = await meUpService.testConnection();

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
      console.error('MeUp connection test error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get authentication credentials from request
   * @param {Object} req - Express request object
   * @returns {Object} Object containing cookie and token
   */
  getCredentials(req) {
    // Try different sources for credentials
    const cookie = req.headers.cookie || 
                   req.body.cookie || 
                   req.query.cookie || 
                   process.env.MEUP_COOKIE ||
                   null;

    const token = req.headers['x-xsrf-token'] || 
                  req.headers['X-Xsrf-Token'] ||
                  req.body.token || 
                  req.query.token || 
                  process.env.MEUP_XSRF_TOKEN ||
                  null;

    return { cookie, token };
  }
}

module.exports = new MeUpController();
