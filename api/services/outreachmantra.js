const axios = require('axios');
const OutreachmantraDomainsRepository = require('../repositories/outreachmantra_domains');
const { sequelize } = require('../../config/database');

// OutreachMantra API configuration
const OUTREACHMANTRA_BASE_URL = process.env.OUTREACHMANTRA_BASE_URL || 'https://api.outreachmantra.com';

class OutreachmantraService {
  constructor(token) {
    this.token = token;
    this.client = this.createClient();
    this.outreachmantraDomainsRepo = new OutreachmantraDomainsRepository(sequelize);
  }

  /**
   * Create axios client with authorization token
   */
  createClient() {
    const client = axios.create({
      baseURL: OUTREACHMANTRA_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (this.token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }

    return client;
  }

  /**
   * Get domains list from OutreachMantra API
   * @param {number} pageNumber - Page number to fetch
   * @param {string} inventoryPrefsId - Inventory preferences ID (optional)
   * @returns {Promise<Object>} Domains data
   */
  async getDomainsList(pageNumber = 1, inventoryPrefsId = '') {
    try {
      const requestBody = {
        pageSize: 20,
        pageNumber: pageNumber,
        inventoryPrefsId: inventoryPrefsId
      };

      const response = await this.client.post('/om/marketplace/list', requestBody);

      return {
        success: true,
        data: response.data,
        pageNumber: pageNumber,
      };
    } catch (error) {
      console.error('Error fetching domains list:', error.message);
      return {
        success: false,
        error: error.message,
        pageNumber: pageNumber,
        details: error.response?.data || null,
      };
    }
  }

  /**
   * Get comprehensive data with pagination and store in database
   * @param {number} pageFrom - Starting page number
   * @param {number} pageTo - Ending page number
   * @param {string} inventoryPrefsId - Inventory preferences ID (optional)
   * @returns {Promise<Object>} Combined data with database storage result
   */
  async getDataWithPaginationAndStore(pageFrom, pageTo, inventoryPrefsId = '') {
    try {
      console.log(`Fetching OutreachMantra data from page ${pageFrom} to ${pageTo}...`);
      
      const allResults = [];
      let totalProcessedDomains = 0;
      let totalDatabaseResults = [];

      // Loop through pages from pageFrom to pageTo
      for (let currentPage = pageFrom; currentPage <= pageTo; currentPage++) {
        console.log(`Processing page ${currentPage} of ${pageTo}...`);
        
        try {
          // Get data from API
          const result = await this.getDomainsList(currentPage, inventoryPrefsId);
          
          if (result.success && result.data) {
            const domains = result.data.responseList;
            console.log(`Found ${domains.length} domains on page ${currentPage}`);
            
            // Store domains in database
            let dbResult = null;
            if (domains.length > 0) {
              console.log(`Storing ${domains.length} domains in database...`);
              dbResult = await this.outreachmantraDomainsRepo.bulkCreate(domains);
              
              if (dbResult.success) {
                console.log(`✅ Successfully stored ${dbResult.count} domains from page ${currentPage}`);
                totalProcessedDomains += dbResult.count;
                totalDatabaseResults.push(dbResult);
              } else {
                console.error(`❌ Failed to store domains from page ${currentPage}:`, dbResult.error);
              }
            }
            
            allResults.push({
              page: currentPage,
              success: true,
              domainsCount: domains.length,
              databaseResult: dbResult,
              data: result.data
            });
          } else {
            console.error(`Failed to fetch page ${currentPage}:`, result.error);
            allResults.push({
              page: currentPage,
              success: false,
              error: result.error,
              domainsCount: 0
            });
          }
        } catch (pageError) {
          console.error(`Error processing page ${currentPage}:`, pageError.message);
          allResults.push({
            page: currentPage,
            success: false,
            error: pageError.message,
            domainsCount: 0
          });
        }

        // Wait 4 seconds between requests (except for the last page)
        if (currentPage < pageTo) {
          console.log('Waiting 4 seconds before processing next page...');
          await new Promise(resolve => setTimeout(resolve, 4000));
        }
      }

      return {
        success: true,
        message: `Successfully processed pages ${pageFrom} to ${pageTo}`,
        pagination: {
          pageFrom: pageFrom,
          pageTo: pageTo,
          totalPages: pageTo - pageFrom + 1,
          pageSize: 20
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
      
    } catch (error) {
      console.error('Error in getDataWithPaginationAndStore:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test connection to OutreachMantra API
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      const response = await this.client.post('/om/marketplace/list', {
        pageSize: 1,
        pageNumber: 1,
        inventoryPrefsId: ''
      });

      return {
        success: true,
        message: 'Connection successful',
        statusCode: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Connection failed',
        error: error.message,
        statusCode: error.response?.status || 0,
      };
    }
  }
}

module.exports = OutreachmantraService;
