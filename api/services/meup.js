const axios = require('axios');
const MeUpDomainsRepository = require('../repositories/meup_domains');
const { sequelize } = require('../../config/database');

// MeUp API configuration
const MEUP_BASE_URL = process.env.MEUP_BASE_URL || 'https://take.meup.com';

class MeUpService {
  constructor(cookie, token) {
    this.cookie = cookie;
    this.token = token;
    this.client = this.createClient();
    this.meUpDomainsRepo = new MeUpDomainsRepository(sequelize);
  }

  /**
   * Create axios client with required headers
   */
  createClient() {
    const client = axios.create({
      baseURL: MEUP_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://take.meup.com/?rows=50&page=2',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (this.cookie) {
      client.defaults.headers.common['Cookie'] = this.cookie;
    }

    if (this.token) {
      client.defaults.headers.common['X-Xsrf-Token'] = this.token;
    }

    return client;
  }

  /**
   * Get domains list from MeUp API
   * @param {number} page - Page number to fetch
   * @returns {Promise<Object>} Domains data
   */
  async getDomainsList(page = 1) {
    try {
      const response = await this.client.get('/api/v1/links/index', {
        params: {
          page: page,
          limit: 50
        }
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
   * Process domain data to prepare for database insertion
   * @param {Object} domainData - Raw domain data from API
   * @returns {Object} Processed domain data
   */
  processDomainData(domainData) {
    // Combine price with currency code if currency exists
    let priceString = domainData.price?.toString() || '0';
    if (domainData.currency && domainData.currency.code) {
      priceString = `${priceString} ${domainData.currency.code}`;
    }

    // Join niche names if niches array exists
    let nichesString = '';
    if (domainData.niches && Array.isArray(domainData.niches)) {
      const nicheNames = domainData.niches
        .map(niche => niche.niche?.name)
        .filter(name => name)
        .join(', ');
      nichesString = nicheNames;
    }

    return {
      id: domainData.id,
      name: domainData.name,
      price: priceString,
      originalPrice: domainData.originalPrice,
      backlinkType: domainData.backlinkType,
      sample: domainData.sample,
      minimumWordCount: domainData.minimumWordCount,
      contentAdvertiser: domainData.contentAdvertiser || 0,
      contentPublisher: domainData.contentPublisher || 0,
      contentPrice: parseFloat(domainData.contentPrice) || 0.00,
      purchasesCount: domainData.purchasesCount,
      hotSelling: domainData.hotSelling || 0,
      visibility: domainData.visibility || 1,
      duration: domainData.duration,
      note: domainData.note,
      isTrustedPublisher: domainData.isTrustedPublisher || false,
      createdAt: domainData.createdAt,
      updatedAt: domainData.updatedAt,
      niches: nichesString // Store niches as string for reference
    };
  }

  /**
   * Get comprehensive data with pagination and store in database
   * @param {number} pageFrom - Starting page number
   * @param {number} pageTo - Ending page number
   * @returns {Promise<Object>} Combined data with database storage result
   */
  async getDataWithPaginationAndStore(pageFrom, pageTo) {
    try {
      console.log(`Fetching MeUp data from page ${pageFrom} to ${pageTo}...`);
      
      const allResults = [];
      let totalProcessedDomains = 0;
      let totalDatabaseResults = [];

      // Loop through pages from pageFrom to pageTo
      for (let currentPage = pageFrom; currentPage <= pageTo; currentPage++) {
        console.log(`Processing page ${currentPage} of ${pageTo}...`);
        
        try {
          // Get data from API
          const result = await this.getDomainsList(currentPage);
          
          if (result.success && result.data && result.data.data) {
            const domains = result.data.data;
            console.log(`Found ${domains.length} domains on page ${currentPage}`);
            
            // Process domain data for database insertion
            const processedDomains = domains.map(domain => this.processDomainData(domain));
            
            // Store domains in database
            let dbResult = null;
            if (processedDomains.length > 0) {
              console.log(`Storing ${processedDomains.length} domains in database...`);
              dbResult = await this.meUpDomainsRepo.bulkCreate(processedDomains);
              
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
              processedDomainsCount: processedDomains.length,
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
          console.log('Waiting 7 seconds before processing next page...');
          await new Promise(resolve => setTimeout(resolve, 7000));
        }
      }

      return {
        success: true,
        message: `Successfully processed pages ${pageFrom} to ${pageTo}`,
        pagination: {
          pageFrom: pageFrom,
          pageTo: pageTo,
          totalPages: pageTo - pageFrom + 1,
          limit: 50
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
   * Test connection to MeUp API
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      const response = await this.client.get('/api/v1/links/index', {
        params: {
          page: 1,
          limit: 1
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

module.exports = MeUpService;
