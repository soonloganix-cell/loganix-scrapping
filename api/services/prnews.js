const axios = require('axios');
const cheerio = require('cheerio');
const PrNewsDomainsRepository = require('../repositories/prnews_domains');
const { sequelize } = require('../../config/database');

class PrNewsService {
  constructor(sessionToken) {
    this.sessionToken = sessionToken;
    this.prNewsDomainsRepo = new PrNewsDomainsRepository(sequelize);
  }

  /**
   * Create axios client with cookie session
   */
  createClient() {
    const client = axios.create();
    
    // Set default headers
    client.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    client.defaults.headers.common['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8';
    client.defaults.headers.common['Accept-Language'] = 'en-US,en;q=0.9';
    client.defaults.headers.common['Accept-Encoding'] = 'gzip, deflate, br';
    client.defaults.headers.common['Referer'] = 'https://prnews.io/sites';
    client.defaults.headers.common['Upgrade-Insecure-Requests'] = '1';
    client.defaults.headers.common['Sec-Fetch-Dest'] = 'document';
    client.defaults.headers.common['Sec-Fetch-Mode'] = 'navigate';
    client.defaults.headers.common['Sec-Fetch-Site'] = 'same-origin';
    client.defaults.headers.common['Cache-Control'] = 'max-age=0';

    if (this.sessionToken) {
      // Properly format the cookie header
      client.defaults.headers.common['Cookie'] = this.sessionToken;
    }

    return client;
  }

  /**
   * Get data from PRNews page
   * @param {number} pageNumber - Page number to fetch
   * @returns {Promise<Object>} HTML response
   */
  async getPageData(pageNumber) {
    try {
      const client = this.createClient();
      const url = `https://prnews.io/sites/page/${pageNumber}/perpage/96`;
      
      console.log(`Making request to: ${url}`);
      console.log(`Headers:`, client.defaults.headers.common);
      
      const response = await client.get(url);
      
      return {
        success: true,
        data: response.data,
        pageNumber: pageNumber
      };
    } catch (error) {
      console.error('Error fetching PRNews page:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      console.error('Response data:', error.response?.data);
      
      return {
        success: false,
        error: error.message,
        pageNumber: pageNumber,
        details: error.response?.data || null,
        status: error.response?.status,
        headers: error.response?.headers
      };
    }
  }

  /**
   * Extract data from HTML response using Cheerio
   * @param {string} html - HTML content
   * @returns {Array} Array of domain data objects
   */
  async getDataFromHTML(html) {
    try {
      const domainsData = [];
      
      // Load HTML into Cheerio
      const $ = cheerio.load(html);
      
      // Find the cards container
      const $cardsContainer = $('.cards');
      if ($cardsContainer.length === 0) {
        console.log('No cards container found in HTML');
        return domainsData;
      }
      
      // Find all card divs with data-platform-info attribute
      $cardsContainer.find('div[data-platform-info]').each((index, element) => {
        const $card = $(element);
        
        // Extract URL from <div class="card_url">radaronline.com</div>
        const url = $card.find('.card_url').text().trim();
        
        // Extract price from <div class="card_price">974 USD</div>
        const price = $card.find('.card_price').text().trim();
        
        // Extract audience from <div class="card_audience">2.5M</div>
        const audience = $card.find('.card_audience').text().trim();
        
        // Extract class from <div class="card_badge card_badge--recommended">Mention</div>
        const classValue = $card.find('.card_badge').text().trim();
        
        // Only add if we have at least a URL
        if (url) {
          domainsData.push({
            url: url,
            price: price || null,
            audience: audience || null,
            class: classValue || null
          });
        }
      });
      
      console.log(`Extracted ${domainsData.length} domains from HTML using Cheerio`);
      return domainsData;
      
    } catch (error) {
      console.error('Error parsing HTML with Cheerio:', error.message);
      return [];
    }
  }

  /**
   * Test connection to PRNews API
   * @returns {Promise<Object>} Test result
   */
  async testConnection() {
    try {
      const client = this.createClient();
      const url = 'https://prnews.io/sites';
      
      console.log(`Testing connection to: ${url}`);
      console.log(`Headers:`, client.defaults.headers.common);
      
      const response = await client.get(url);
      
      return {
        success: true,
        status: response.status,
        headers: response.headers,
        message: 'Connection test successful'
      };
    } catch (error) {
      console.error('Connection test failed:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        headers: error.response?.headers,
        message: 'Connection test failed'
      };
    }
  }

  /**
   * Get data with details and store in database
   * @param {number} pageNumber - Page number to process
   * @returns {Promise<Object>} Processing result
   */
  async getDataWithDetailsAndStore(pageNumber) {
    try {
      console.log(`Fetching PRNews page ${pageNumber}...`);
      
      // Get page data
      const pageResult = await this.getPageData(pageNumber);
      
      if (!pageResult.success) {
        return {
          success: false,
          error: 'Failed to fetch page data',
          message: pageResult.error,
          pageNumber: pageNumber
        };
      }

      // Extract data from HTML
      const domainsData = await this.getDataFromHTML(pageResult.data);
      
      // Store domains in database
      let dbResult = null;
      if (domainsData.length > 0) {
        console.log(`Storing ${domainsData.length} domains in database...`);
        dbResult = await this.prNewsDomainsRepo.bulkCreate(domainsData);
        
        if (dbResult.success) {
          console.log(`✅ Successfully stored ${dbResult.count} domains in database`);
        } else {
          console.error('❌ Failed to store domains in database:', dbResult.error);
        }
      }
      
      return {
        success: true,
        data: { items: domainsData },
        databaseResult: dbResult,
        processedDomains: domainsData.length,
        pageNumber: pageNumber,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error in getDataWithDetailsAndStore:', error.message);
      return {
        success: false,
        error: error.message,
        pageNumber: pageNumber,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = PrNewsService;


