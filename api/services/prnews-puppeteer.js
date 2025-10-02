const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const PrNewsDomainsRepository = require('../repositories/prnews_domains');
const { sequelize } = require('../../config/database');

class PrNewsPuppeteerService {
  constructor(sessionToken) {
    this.sessionToken = sessionToken;
    this.prNewsDomainsRepo = new PrNewsDomainsRepository(sequelize);
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize browser and page
   */
  async initBrowser() {
    if (this.browser) {
      return;
    }

    console.log('🚀 Launching browser...');
    this.browser = await puppeteer.launch({
      headless: true, // Set to false for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set user agent
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await this.page.setViewport({ width: 1366, height: 768 });
    
    // Add stealth measures
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
    
    // Set additional headers
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    });

    // Set cookies if provided
    if (this.sessionToken) {
      await this.setCookies();
    }
  }

  /**
   * Set cookies from session token
   */
  async setCookies() {
    if (!this.sessionToken) {
      return;
    }

    console.log('🍪 Setting cookies...');
    
    // Parse cookie string into individual cookies
    const cookies = this.parseCookieString(this.sessionToken);
    
    // Set cookies in the browser
    for (const cookie of cookies) {
      try {
        await this.page.setCookie({
          name: cookie.name,
          value: cookie.value,
          domain: '.prnews.io',
          path: '/',
          httpOnly: false,
          secure: true,
          sameSite: 'Lax'
        });
      } catch (error) {
        console.warn(`Failed to set cookie ${cookie.name}:`, error.message);
      }
    }
  }

  /**
   * Parse cookie string into array of cookie objects
   */
  parseCookieString(cookieString) {
    const cookies = [];
    const pairs = cookieString.split(';');
    
    for (const pair of pairs) {
      const [name, value] = pair.trim().split('=');
      if (name && value) {
        cookies.push({ name: name.trim(), value: value.trim() });
      }
    }
    
    return cookies;
  }

  /**
   * Get page data using Puppeteer
   */
  async getPageData(pageNumber) {
    try {
      await this.initBrowser();
      
      const url = `https://prnews.io/sites/page/${pageNumber}/perpage/96`;
      console.log(`🌐 Navigating to: ${url}`);
      
      // Navigate to the page
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // Wait a bit for any dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if we're on a Cloudflare challenge page
      let pageTitle = await this.page.title();
      let attempts = 0;
      const maxAttempts = 3;
      
      while (pageTitle.includes('Just a moment') && attempts < maxAttempts) {
        console.log(`⚠️  Detected Cloudflare challenge page (attempt ${attempts + 1}/${maxAttempts}), waiting...`);
        await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
        
        // Check if the page has changed
        pageTitle = await this.page.title();
        attempts++;
        
        if (!pageTitle.includes('Just a moment')) {
          console.log('✅ Cloudflare challenge resolved!');
          break;
        }
      }
      
      if (pageTitle.includes('Just a moment')) {
        throw new Error('Cloudflare challenge could not be resolved after multiple attempts');
      }
      
      // Wait for the cards container to be present
      await this.page.waitForSelector('.cards', { timeout: 10000 });
      console.log('✅ Found .cards selector');
      
      // Get the HTML content
      const html = await this.page.content();
      
      return {
        success: true,
        data: html,
        pageNumber: pageNumber
      };
    } catch (error) {
      console.error('Error fetching PRNews page with Puppeteer:', error.message);
      return {
        success: false,
        error: error.message,
        pageNumber: pageNumber
      };
    }
  }

  /**
   * Extract data from HTML response using Cheerio
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
   */
  async testConnection() {
    try {
      await this.initBrowser();
      
      const url = 'https://prnews.io/sites';
      console.log(`Testing connection to: ${url}`);
      
      // Navigate to the page
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // Wait a bit for any dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the page title to verify we're not on a Cloudflare challenge page
      const title = await this.page.title();
      const url_final = this.page.url();
      
      // Check if we're on a Cloudflare challenge page
      if (title.includes('Just a moment')) {
        console.log('⚠️  Detected Cloudflare challenge page, waiting...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        const newTitle = await this.page.title();
        const newUrl = this.page.url();
        return {
          success: true,
          title: newTitle,
          url: newUrl,
          message: 'Connection test successful (after Cloudflare challenge)'
        };
      }
      
      return {
        success: true,
        title: title,
        url: url_final,
        message: 'Connection test successful'
      };
    } catch (error) {
      console.error('Connection test failed:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Connection test failed'
      };
    }
  }

  /**
   * Get data with details and store in database
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

  /**
   * Close browser
   */
  async closeBrowser() {
    if (this.browser) {
      console.log('🔒 Closing browser...');
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

module.exports = PrNewsPuppeteerService;
