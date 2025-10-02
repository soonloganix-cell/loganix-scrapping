const axios = require('axios');
const FatgridDomainsRepository = require('../repositories/fatgrid_domains');
const { sequelize } = require('../../config/database');

// FatGrid API configuration
const FATGRID_BASE_URL = process.env.FATGRID_BASE_URL || 'https://api.fatgrid.com';

class FatGridService {
  constructor(sessionToken) {
    this.sessionToken = sessionToken;
    this.client = this.createClient();
    this.fatgridDomainsRepo = new FatgridDomainsRepository(sequelize);
  }

  /**
   * Create axios client with session token
   */
  createClient() {
    const client = axios.create({
      baseURL: FATGRID_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (this.sessionToken) {
      client.defaults.headers.common['Authorization'] = `Bearer ${this.sessionToken}`;
    }

    return client;
  }

  /**
   * Get domains list from FatGrid API
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Domains data
   */
  async getDomainsList(params = {}) {
    try {
      const defaultParams = {
        page: 1,
        limit: 100,
        sort: '-totalTraffic',
        type: 'guest_post',
      };

      const queryParams = { ...defaultParams, ...params };

      const response = await this.client.get('/api/domains/list', {
        params: queryParams,
      });

      return {
        success: true,
        data: response.data,
        params: queryParams,
      };
    } catch (error) {
      console.error('Error fetching domains list:', error.message);
      return {
        success: false,
        error: error.message,
        details: error.response?.data || null,
      };
    }
  }

  /**
   * Get domain full name from ID
   * @param {string} id - Domain ID
   * @returns {Promise<Object>} Domain information
   */
  async getDomainFromId(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Domain ID is required'
        };
      }

      const response = await this.client.get(`/api/domains/${id}/info`);
      
      return {
        success: true,
        data: response.data,
        domainId: id
      };
    } catch (error) {
      console.error('Error fetching domain from ID:', error.message);
      return {
        success: false,
        error: error.message,
        domainId: id,
        details: error.response?.data || null
      };
    }
  }

  /**
   * Get user's unlocked domains
   * @returns {Promise<Object>} Unlocked domains data
   */
  async getUserUnlocks() {
    try {
      const response = await this.client.get('/api/user-unlocks/my-unlocks');

      return {
        success: true,
        data: response.data,
        count: response.data.length,
      };
    } catch (error) {
      console.error('Error fetching user unlocks:', error.message);
      return {
        success: false,
        error: error.message,
        details: error.response?.data || null,
      };
    }
  }

  /**
   * Get comprehensive data (domains + unlocks)
   * @param {Object} params - Query parameters for domains
   * @returns {Promise<Object>} Combined data
   */
  async getData(params = {}) {
    try {
      console.log('Fetching FatGrid data...');

      const [domainsResult] = await Promise.all([this.getDomainsList(params)]);

      return domainsResult;
    } catch (error) {
      console.error('Error getting FatGrid data:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Test connection to FatGrid API
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      const response = await this.client.get('/api/domains/list', {
        params: { page: 1, limit: 1 },
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

  /**
   * Get comprehensive data with detailed domain info and store in database
   * @param {Object} params - Query parameters for domains
   * @returns {Promise<Object>} Combined data with database storage result
   */
  async getDataWithDetailsAndStore(params = {}) {
    try {
      console.log('Fetching FatGrid data with detailed info...');
      
      const initialResult = await this.getData(params);
      
      if (!initialResult.success || !initialResult.data || !initialResult.data.items) {
        return {
          success: false,
          error: 'Failed to fetch initial data',
          message: 'Could not retrieve domains from FatGrid API'
        };
      }

      const domains = initialResult.data.items;
      const domainsToStore = [];
      
      console.log(`Processing ${domains.length} domains for detailed info...`);
      
      for (let i = 0; i < domains.length; i++) {
        const domain = domains[i];
        console.log(`Fetching detailed info for domain ${domain.id}...`);
        
        try {
          const domainInfo = await this.getDomainFromId(domain.id);
          
          if (domainInfo.success && domainInfo.data && domainInfo.data.url) {
            // Add detailed info to the domain object
            domains[i].detailedInfo = domainInfo.data.url;
            
            // Prepare domain data for database storage
            const domainData = {
              id: domain.id,
              url: domainInfo.data.url, // Use the actual URL from detailed info
              bestPrice: domain.bestPrice,
              class: domain.type,
              currency: domain.currency,
              resources: domain.resources,
              dr: domain.dr,
              linkFollow: domain.linkFollow,
              authorityScore: domain.authorityScore,
              organicTraffic: domain.organicTraffic,
              backlinks: domain.backlinks,
              refDomains: domain.refDomains,
              db: domain.database,
              categories: domain.categories,
              totalTraffic: domain.totalTraffic,
              traffic: domain.traffic,
              totalOrganicTraffic: domain.totalOrganicTraffic,
              createdAt: domain.createdAt,
              bestNichePrices: domain.bestNichePrices,
              tags: domain.tags,
              note: domain.note,
              isFavorite: domain.isFavorite
            };
            
            domainsToStore.push(domainData);
          } else {
            console.warn(`Failed to get detailed info for domain ${domain.id}:`, domainInfo.error);
            domains[i].detailedInfo = null;
            domains[i].detailedInfoError = domainInfo.error;
          }
        } catch (error) {
          console.error(`Error fetching detailed info for domain ${domain.id}:`, error.message);
          domains[i].detailedInfo = null;
          domains[i].detailedInfoError = error.message;
        }

        // Add 500ms delay between domain requests (except for the last domain)
        if (i < domains.length - 1) {
          console.log('Waiting 500ms before processing next domain...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Store domains in database
      let dbResult = null;
      if (domainsToStore.length > 0) {
        console.log(`Storing ${domainsToStore.length} domains in database...`);
        dbResult = await this.fatgridDomainsRepo.bulkCreate(domainsToStore);
        
        if (dbResult.success) {
          console.log(`✅ Successfully stored ${dbResult.count} domains in database`);
        } else {
          console.error('❌ Failed to store domains in database:', dbResult.error);
        }
      }
      
      // Update the result with processed domains
      initialResult.data.items = domains;
      
      return {
        success: true,
        data: initialResult.data,
        databaseResult: dbResult,
        processedDomains: domainsToStore.length,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error in getDataWithDetailsAndStore:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = FatGridService;
