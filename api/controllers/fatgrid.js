const FatGridService = require('../services/fatgrid');

class FatGridController {
  /**
   * Get FatGrid data (domains + unlocks)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getData(req, res) {
    try {
      // Get session token from various sources
      const sessionToken = this.getSessionToken(req);
      
      if (!sessionToken) {
        return res.status(400).json({
          success: false,
          error: 'Session token is required',
          message: 'Please provide FatGrid session token via Authorization header, query parameter, or request body'
        });
      }

      // Create FatGrid service instance
      const fatgridService = new FatGridService(sessionToken);

      // Get query parameters
      const limit = parseInt(req.query.limit) || 100;
      const pageFrom = parseInt(req.query.page_from) || 1;
      const pageTo = parseInt(req.query.page_to) || 1;
      const sort = req.query.sort || '-totalTraffic';
      const type = req.query.type || 'guest_post';

      // Validate pagination parameters
      if (pageFrom > pageTo) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pagination parameters',
          message: 'page_from cannot be greater than page_to'
        });
      }

      // Initialize results array
      const allResults = [];
      let totalProcessedDomains = 0;
      let totalDatabaseResults = [];

      // Loop through pages from page_from to page_to
      for (let currentPage = pageFrom; currentPage <= pageTo; currentPage++) {
        console.log(`Processing page ${currentPage} of ${pageTo}...`);
        
        const params = {
          page: currentPage,
          limit: limit,
          sort: sort,
          type: type
        };

        // Get data from service with detailed info and database storage
        const result = await fatgridService.getDataWithDetailsAndStore(params);
        
        if (result.success) {
          allResults.push(result);
          totalProcessedDomains += result.processedDomains || 0;
          if (result.databaseResult) {
            totalDatabaseResults.push(result.databaseResult);
          }
        } else {
          console.error(`Failed to process page ${currentPage}:`, result.error);
          allResults.push({
            page: currentPage,
            success: false,
            error: result.error
          });
        }

        // Add delay between pages (except for the last page)
        if (currentPage < pageTo) {
          console.log('Waiting 1 second before processing next page...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Combine all results
      const combinedResult = {
        success: true,
        message: `Successfully processed pages ${pageFrom} to ${pageTo}`,
        pagination: {
          pageFrom: pageFrom,
          pageTo: pageTo,
          totalPages: pageTo - pageFrom + 1,
          limit: limit
        },
        results: allResults,
        summary: {
          totalProcessedDomains: totalProcessedDomains,
          totalDatabaseResults: totalDatabaseResults.length,
          successfulPages: allResults.filter(r => r.success).length,
          failedPages: allResults.filter(r => !r.success).length
        },
        timestamp: new Date().toISOString()
      };

      // Return response
      if (combinedResult.success) {
        res.json({
          success: true,
          message: 'Data saved successfully at table fatgrid_domains',
          data: combinedResult,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to process all pages',
          message: 'Some pages failed to process',
          data: combinedResult,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('FatGrid controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get session token from request
   * @param {Object} req - Express request object
   * @returns {string|null} Session token
   */
  getSessionToken(req) {
    // Try different sources for session token
    return req.headers.authorization?.replace('Bearer ', '') || 
           req.body.sessionToken || 
           req.query.sessionToken || 
           process.env.FATGRID_SESSION_TOKEN ||
           null;
  }
}

module.exports = new FatGridController();
