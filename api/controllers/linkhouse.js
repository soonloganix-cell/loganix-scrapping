const LinkHouseService = require('../services/linkhouse');

class LinkHouseController {
  /**
   * Get LinkHouse data with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getData(req, res) {
    try {
      // Get authentication credentials from various sources
      const { cookie, referer } = this.getCredentials(req);
      
      if (!cookie) {
        return res.status(400).json({
          success: false,
          error: 'Cookie is required',
          message: 'Please provide LinkHouse cookie via headers, query parameters, or request body'
        });
      }

      // Create LinkHouse service instance
      const linkHouseService = new LinkHouseService(cookie, referer);

      // Get query parameters
      const pageFrom = parseInt(req.query.page_from);
      const pageTo = parseInt(req.query.page_to);
      const sort = req.query.sort || 'priority';
      const by = req.query.by || 'desc';
      const perPage = parseInt(req.query.per_page) || 200;
      const offerType = req.query.offer_type || '';
      const sale = parseInt(req.query.sale) || 0;
      const saleBf = parseInt(req.query.sale_bf) || 0;
      const spring25FiltersEnabled = parseInt(req.query.spring25_filters_enabled) || 1;
      const hash = req.query.hash || '';

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

      // Prepare options object
      const options = {
        sort,
        by,
        perPage,
        offerType,
        sale,
        saleBf,
        spring25FiltersEnabled,
        hash
      };

      // Get data from service with pagination and database storage
      const result = await linkHouseService.getDataWithPaginationAndStore(pageFrom, pageTo, options);

      // Return response
      if (result.success) {
        res.json({
          success: true,
          message: 'Data saved successfully at table linkhouse_domains',
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
      console.error('LinkHouse controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Test connection to LinkHouse API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnection(req, res) {
    try {
      // Get authentication credentials from various sources
      const { cookie, referer } = this.getCredentials(req);
      
      if (!cookie) {
        return res.status(400).json({
          success: false,
          error: 'Cookie is required',
          message: 'Please provide LinkHouse cookie via headers, query parameters, or request body'
        });
      }

      // Create LinkHouse service instance
      const linkHouseService = new LinkHouseService(cookie, referer);

      // Test connection
      const result = await linkHouseService.testConnection();

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
      console.error('LinkHouse connection test error:', error);
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
   * @returns {Object} Object containing cookie and referer
   */
  getCredentials(req) {
    // Try different sources for credentials
    const cookie = req.headers.cookie || 
                   req.body.cookie || 
                   req.query.cookie || 
                   process.env.LINKHOUSE_COOKIE ||
                   null;

    const referer = req.headers.referer || 
                    req.headers.referrer ||
                    req.body.referer || 
                    req.query.referer || 
                    process.env.LINKHOUSE_REFERER ||
                    null;

    return { cookie, referer };
  }
}

module.exports = new LinkHouseController();
