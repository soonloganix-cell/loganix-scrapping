const axios = require('axios');
const LinkHouseDomainsRepository = require('../repositories/linkhouse_domains');
const { sequelize } = require('../../config/database');

// LinkHouse API configuration
const LINKHOUSE_BASE_URL = process.env.LINKHOUSE_BASE_URL || 'https://app.linkhouse.co';

class LinkHouseService {
  constructor(cookie, referer) {
    this.cookie = cookie;
    this.referer = referer;
    this.client = this.createClient();
    this.linkHouseDomainsRepo = new LinkHouseDomainsRepository(sequelize);
  }

  /**
   * Create axios client with required headers
   */
  createClient() {
    const client = axios.create({
      baseURL: LINKHOUSE_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (this.cookie) {
      client.defaults.headers.common['Cookie'] = this.cookie;
    }

    if (this.referer) {
      client.defaults.headers.common['Referer'] = this.referer;
    }

    return client;
  }

  /**
   * Get domains list from LinkHouse API
   * @param {number} page - Page number to fetch
   * @param {string} sort - Sort field (default: priority)
   * @param {string} by - Sort direction (default: desc)
   * @param {number} perPage - Items per page (default: 200)
   * @param {string} offerType - Offer type filter (optional)
   * @param {number} sale - Sale filter (default: 0)
   * @param {number} saleBf - Sale BF filter (default: 0)
   * @param {number} spring25FiltersEnabled - Spring 25 filters (default: 1)
   * @param {string} hash - Hash parameter (optional)
   * @returns {Promise<Object>} Domains data
   */
  async getDomainsList(page = 1, sort = 'priority', by = 'desc', perPage = 200, offerType = '', sale = 0, saleBf = 0, spring25FiltersEnabled = 1, hash = '') {
    try {
      const params = {
        page: page,
        sort: sort,
        by: by,
        per_page: perPage,
        offer_type: offerType,
        sale: sale,
        sale_bf: saleBf,
        spring25_filters_enabled: spring25FiltersEnabled,
        hash: hash
      };

      const response = await this.client.get('/api/search-market-refactored', {
        params: params
      });

      return {
        success: true,
        data: response.data,
        page: page,
      };
    } catch (error) {
      console.error('Error fetching domains list:', error.message);
      return {
        success: false,
        error: error.message,
        page: page,
        details: error.response?.data || null,
      };
    }
  }

  /**
   * Get comprehensive data with pagination and store in database
   * @param {number} pageFrom - Starting page number
   * @param {number} pageTo - Ending page number
   * @param {Object} options - Additional query options
   * @returns {Promise<Object>} Combined data with database storage result
   */
  async getDataWithPaginationAndStore(pageFrom, pageTo, options = {}) {
    try {
      console.log(`Fetching LinkHouse data from page ${pageFrom} to ${pageTo}...`);
      
      const allResults = [];
      let totalProcessedDomains = 0;
      let totalDatabaseResults = [];

      // Extract options with defaults
      const {
        sort = 'priority',
        by = 'desc',
        perPage = 200,
        offerType = '',
        sale = 0,
        saleBf = 0,
        spring25FiltersEnabled = 1,
        hash = ''
      } = options;

      // Loop through pages from pageFrom to pageTo
      for (let currentPage = pageFrom; currentPage <= pageTo; currentPage++) {
        console.log(`Processing page ${currentPage} of ${pageTo}...`);
        
        try {
          // Get data from API
          const result = await this.getDomainsList(
            currentPage, 
            sort, 
            by, 
            perPage, 
            offerType, 
            sale, 
            saleBf, 
            spring25FiltersEnabled, 
            hash
          );
          
          if (result.success && result.data && result.data.data) {
            const domains = result.data.data;
            console.log(`Found ${domains.length} domains on page ${currentPage}`);
            
            // Store domains in database
            let dbResult = null;
            if (domains.length > 0) {
              console.log(`Storing ${domains.length} domains in database...`);
              dbResult = await this.linkHouseDomainsRepo.bulkCreate(domains);
              
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

        // Wait 5 seconds between requests (except for the last page)
        if (currentPage < pageTo) {
          console.log('Waiting 5 seconds before processing next page...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      return {
        success: true,
        message: `Successfully processed pages ${pageFrom} to ${pageTo}`,
        pagination: {
          pageFrom: pageFrom,
          pageTo: pageTo,
          totalPages: pageTo - pageFrom + 1,
          perPage: perPage
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
   * Test connection to LinkHouse API
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      const response = await this.client.get('/api/search-market-refactored', {
        params: {
          page: 1,
          sort: 'priority',
          by: 'desc',
          per_page: 1,
          offer_type: '',
          sale: 0,
          sale_bf: 0,
          spring25_filters_enabled: 1,
          hash: ''
        }
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

module.exports = LinkHouseService;
