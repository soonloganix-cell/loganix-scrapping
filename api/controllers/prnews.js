const PrNewsService = require('../services/prnews');
const PrNewsPuppeteerService = require('../services/prnews-puppeteer');

class PrNewsController {
  /**
   * Test connection to PRNews API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnection(req, res) {
    try {
      const sessionToken = this.getSessionToken(req);

      if (!sessionToken) {
        return res.status(400).json({
          success: false,
          error: 'Session token is required',
          message: 'Please provide session token via Cookie header, query parameter, or request body'
        });
      }

      const prNewsService = new PrNewsService(sessionToken);
      const result = await prNewsService.testConnection();

      res.json({
        success: result.success,
        message: result.message,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('PRNews test connection error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Test connection using Puppeteer
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnectionPuppeteer(req, res) {
    try {
      const sessionToken = this.getSessionToken(req);

      if (!sessionToken) {
        return res.status(400).json({
          success: false,
          error: 'Session token is required',
          message: 'Please provide session token via Cookie header, query parameter, or request body'
        });
      }

      const prNewsService = new PrNewsPuppeteerService(sessionToken);
      const result = await prNewsService.testConnection();
      
      // Close browser after test
      await prNewsService.closeBrowser();

      res.json({
        success: result.success,
        message: result.message,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('PRNews Puppeteer test connection error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get PRNews data using Puppeteer (bypasses Cloudflare)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDataPuppeteer(req, res) {
    try {
      const sessionToken = this.getSessionToken(req);

      if (!sessionToken) {
        return res.status(400).json({
          success: false,
          error: 'Session token is required',
          message: 'Please provide session token via Cookie header, query parameter, or request body'
        });
      }

      const prNewsService = new PrNewsPuppeteerService(sessionToken);

      const pageFrom = parseInt(req.query.page_from) || 1;
      const pageTo = parseInt(req.query.page_to) || 1;

      if (pageFrom > pageTo) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pagination parameters',
          message: 'page_from cannot be greater than page_to'
        });
      }

      const allResults = [];
      let totalProcessedDomains = 0;
      let totalDatabaseResults = [];

      for (let currentPage = pageFrom; currentPage <= pageTo; currentPage++) {
        console.log(`Processing page ${currentPage} of ${pageTo}...`);

        const result = await prNewsService.getDataWithDetailsAndStore(currentPage);

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

        if (currentPage < pageTo) {
          console.log('Waiting 1 second before processing next page...');
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Close browser after processing
      await prNewsService.closeBrowser();

      const combinedResult = {
        success: true,
        message: `Successfully processed pages ${pageFrom} to ${pageTo}`,
        pagination: {
          pageFrom: pageFrom,
          pageTo: pageTo,
          totalPages: pageTo - pageFrom + 1,
          limit: 96
        },
        results: allResults,
        summary: {
          totalProcessedDomains: totalProcessedDomains,
          totalDatabaseResults: totalDatabaseResults.length,
          successfulPages: allResults.filter((r) => r.success).length,
          failedPages: allResults.filter((r) => !r.success).length
        },
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Data saved successfully at table prnews_domains',
        data: combinedResult,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('PRNews Puppeteer controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get PRNews data (same flow shape as fatgrid controller)
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
          message:
            'Please provide session token via Authorization header, query parameter, or request body',
        });
      }

      // Create PRNews service instance
      const prNewsService = new PrNewsService(sessionToken);

      // Read query params - limit is always 96, only page_from and page_to
      const pageFrom = parseInt(req.query.page_from) || 1;
      const pageTo = parseInt(req.query.page_to) || 1;

      if (pageFrom > pageTo) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pagination parameters',
          message: 'page_from cannot be greater than page_to',
        });
      }

      // Aggregate across pages with 1 second interval
      const allResults = [];
      let totalProcessedDomains = 0;
      let totalDatabaseResults = [];

      for (let currentPage = pageFrom; currentPage <= pageTo; currentPage++) {
        console.log(`Processing page ${currentPage} of ${pageTo}...`);

        const result = await prNewsService.getDataWithDetailsAndStore(currentPage);

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
            error: result.error,
          });
        }

        // Add 1 second delay between pages (except for the last page)
        if (currentPage < pageTo) {
          console.log('Waiting 1 second before processing next page...');
          await new Promise((resolve) => setTimeout(resolve, 1000));
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
          limit: 96,
        },
        results: allResults,
        summary: {
          totalProcessedDomains: totalProcessedDomains,
          totalDatabaseResults: totalDatabaseResults.length,
          successfulPages: allResults.filter((r) => r.success).length,
          failedPages: allResults.filter((r) => !r.success).length,
        },
        timestamp: new Date().toISOString(),
      };

      res.json({
        success: true,
        message: 'Data saved successfully at table prnews_domains',
        data: combinedResult,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('PRNews controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  getSessionToken(req) {
    // Try to get session token from various sources
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      return cookieHeader;
    }

    // Fallback to other methods
    return req.body.sessionToken ||
           req.query.sessionToken ||
           process.env.PRNEWS_SESSION_TOKEN ||
           null;
  }
}

module.exports = new PrNewsController();
