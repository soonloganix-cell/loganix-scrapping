const path = require('path');
const fs = require('fs').promises;
const JsonLoader = require('../helpers/jsonLoader');

class LoganixService {
  constructor() {
    this.currentSiteId = 2; // Start site_id at 2
  }

  async loadJsonData() {
    try {
      const jsonPath = path.join(__dirname, '../../manual/loganix/data.json');
      return await JsonLoader.loadJsonData(jsonPath);
    } catch (error) {
      console.error('❌ Error loading JSON data:', error.message);
      throw error;
    }
  }

  /**
   * Escape single quotes for PostgreSQL
   */
  escapeSql(value) {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    return `'${String(value).replace(/'/g, "''")}'`;
  }

  /**
   * Strip HTML entities
   */
  stripHtmlEntities(text) {
    if (!text) return text;
    return String(text).replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }

  /**
   * Truncate string to max length
   */
  truncate(str, maxLength) {
    if (!str) return str;
    const cleaned = String(str);
    return cleaned.length > maxLength ? cleaned.substring(0, maxLength) : cleaned;
  }

  /**
   * Parse TAT string to days
   */
  parseTatToDays(tatString) {
    if (!tatString) return null;
    const cleaned = this.stripHtmlEntities(tatString).toLowerCase();
    
    // Extract number from string
    const match = cleaned.match(/(\d+)/);
    if (!match) return 7; // default
    
    const num = parseInt(match[1]);
    
    if (cleaned.includes('week')) return num * 7;
    if (cleaned.includes('month')) return num * 30;
    if (cleaned.includes('day')) return num;
    
    return num; // assume days
  }

  /**
   * Map DF/NF to link_type enum
   */
  mapLinkType(dfnf) {
    if (!dfnf) return 'dofollow';
    const upper = String(dfnf).toUpperCase();
    if (upper === 'DF') return 'dofollow';
    if (upper === 'NF') return 'nofollow';
    return 'dofollow';
  }

  /**
   * Map language to ISO code
   */
  mapLanguage(lang) {
    if (!lang) return null;
    const lower = String(lang).toLowerCase();
    if (lower.includes('english') || lower === 'en') return 'en';
    if (lower === 'n/a') return null;
    if (lower.length === 2) return lower;
    if (lower.length === 5) return lower;
    return null;
  }

  /**
   * Get country code from language (English → US)
   */
  getCountryFromLang(lang) {
    if (!lang) return 'US';
    const lower = String(lang).toLowerCase();
    if (lower.includes('english') || lower === 'en') return 'US';
    return 'US'; // default
  }

  /**
   * Parse our_notes field to extract publisher data
   */
  parseOurNotes(notesText) {
    if (!notesText) return {};
    
    const data = {};
    const lines = notesText.split('\n');
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        const cleanKey = key.trim();
        data[cleanKey] = value || null;
      }
    }
    
    return data;
  }

  /**
   * Generate INSERT statement for stl_v2_sites_staging
   */
  generateSitesInsert(item, siteId) {
    const domain = this.escapeSql(this.truncate(item.root, 255));
    const linkType = this.escapeSql(this.mapLinkType(item['DF/NF']));
    const startingAt = item.Price || item.price || 0;
    const tat = this.escapeSql(this.truncate(this.stripHtmlEntities(item.TAT), 50));
    const spokenLanguage = this.escapeSql(this.mapLanguage(item.lang));
    const da = item.DA || item.da || 0;
    const dr = item.DR || item.dr || 0;
    const rd = item.RD || item.rd || 0;
    const tf = item.TF || item.tf || 0;
    const cf = item.CF || item.cf || 0;
    const traffic = item.Traffic || item.ahrefs_traffic || 0;

    const sql = `INSERT INTO stl_v2_sites_staging (site_id, domain, link_type, starting_at, tat, spoken_language, da, dr, rd, tf, cf, traffic_total, created_at, updated_at) VALUES (${siteId}, ${domain}, ${linkType}, ${startingAt}, ${tat}, ${spokenLanguage}, ${da}, ${dr}, ${rd}, ${tf}, ${cf}, ${traffic}, NOW(), NOW());`;
    
    return sql;
  }

  /**
   * Generate INSERT statement for stl_v2_details_staging
   */
  generateDetailsInsert(item, siteId) {
    const avgPublisherDelay = this.parseTatToDays(item.TAT);
    const guidelines = this.escapeSql(this.truncate(item.notes || item.client_notes, 10000));
    const notesInternal = this.escapeSql(this.truncate(item.internal_notes, 10000));

    const sql = `INSERT INTO stl_v2_details_staging (site_id, avg_publisher_delay, guidelines, notes_internal) VALUES (${siteId}, ${avgPublisherDelay}, ${guidelines}, ${notesInternal});`;
    
    return sql;
  }

  /**
   * Generate INSERT statements for stl_v2_ai_category_staging
   */
  generateAiCategoryInserts(item, siteId) {
    const sqls = [];
    const categories = new Set();

    // Collect from all category fields
    if (item.master_category && Array.isArray(item.master_category)) {
      item.master_category.forEach(cat => categories.add(cat));
    }
    if (item.master_cat && Array.isArray(item.master_cat)) {
      item.master_cat.forEach(cat => categories.add(cat));
    }
    if (item.sub_category && Array.isArray(item.sub_category)) {
      item.sub_category.forEach(cat => categories.add(cat));
    }
    if (item.manual_cat) {
      categories.add(item.manual_cat);
    }
    if (item.john_categories) {
      categories.add(item.john_categories);
    }

    // Generate INSERT for each unique category
    categories.forEach(category => {
      if (category && String(category).trim()) {
        const cat = this.escapeSql(this.truncate(category, 100));
        sqls.push(`INSERT INTO stl_v2_ai_category_staging (site_id, category) VALUES (${siteId}, ${cat});`);
      }
    });

    return sqls;
  }

  /**
   * Generate INSERT statements for stl_v2_publisher_sites_staging
   */
  generatePublisherInsert(item, siteId) {
    const ourNotes = this.parseOurNotes(item.our_notes);
    if (!ourNotes.publisher && !ourNotes.website) return null;

    const website = this.escapeSql(this.truncate(ourNotes.website || item.root, 255));
    const publisher = this.escapeSql(this.truncate(ourNotes.publisher, 255));
    const tat = parseInt(ourNotes.tat) || this.parseTatToDays(item.TAT) || 7;
    const linkType = this.escapeSql(ourNotes.link_type || this.mapLinkType(item['DF/NF']));
    const guidelinesUrl = this.escapeSql(this.truncate(ourNotes.guidelines_url, 255));
    const priceGeneral = parseFloat(ourNotes.price_general) || null;
    const priceAdult = parseFloat(ourNotes.price_adult) || null;
    const priceGambling = parseFloat(ourNotes.price_gambling) || null;
    const priceCrypto = parseFloat(ourNotes.price_crypto) || null;
    const pricePayday = parseFloat(ourNotes.price_payday) || null;
    const priceGeneralEdits = parseFloat(ourNotes.price_general_edits) || null;
    const priceAdultEdits = parseFloat(ourNotes.price_adult_edits) || null;
    const priceGamblingEdits = parseFloat(ourNotes.price_gambling_edits) || null;
    const priceCryptoEdits = parseFloat(ourNotes.price_crypto_edits) || null;
    const pricePaydayEdits = parseFloat(ourNotes.price_payday_edits) || null;
    const youtubeEmbed = ourNotes.youtube_embed === 'yes' ? 'TRUE' : 'FALSE';
    const indexed = ourNotes.indexed === 'yes' ? 'TRUE' : 'FALSE';
    const doWePost = ourNotes.do_we_post === 'yes' ? 'TRUE' : 'FALSE';
    const lowMetricsClientOk = ourNotes.low_metrics === 'yes' ? 'TRUE' : 'FALSE';
    const preapproveTopic = ourNotes.preapprove_topic === 'yes' ? 'TRUE' : 'FALSE';
    const authorBio = ourNotes.author_bio === 'yes' ? 'TRUE' : 'FALSE';
    const addLinksToContent = ourNotes.add_links_to_content === 'yes' ? 'TRUE' : 'FALSE';
    const anchorLimit = ourNotes.anchor_limit === 'yes' ? 'TRUE' : 'FALSE';
    const permanentLink = ourNotes.permanent_link === 'yes' ? 'TRUE' : 'FALSE';
    const renewable = ourNotes.renewable === 'yes' ? 'TRUE' : (ourNotes.renewable === 'no' ? 'FALSE' : 'NULL');
    const wordCountMinimum = parseInt(ourNotes.word_count_minimum) || null;

    const sql = `INSERT INTO stl_v2_publisher_sites_staging (site_id, website, tat, link_type, guidelines_url, publisher, price_general, price_adult, price_gambling, price_crypto, price_payday, price_general_edits, price_adult_edits, price_gambling_edits, price_crypto_edits, price_payday_edits, youtube_embed, indexed, do_we_post, low_metrics_client_ok, preapprove_topic, author_bio, add_links_to_content, anchor_limit, permanent_link, renewable, word_count_minimum, created_at, updated_at) VALUES (${siteId}, ${website}, ${tat}, ${linkType}, ${guidelinesUrl}, ${publisher}, ${priceGeneral || 'NULL'}, ${priceAdult || 'NULL'}, ${priceGambling || 'NULL'}, ${priceCrypto || 'NULL'}, ${pricePayday || 'NULL'}, ${priceGeneralEdits || 'NULL'}, ${priceAdultEdits || 'NULL'}, ${priceGamblingEdits || 'NULL'}, ${priceCryptoEdits || 'NULL'}, ${pricePaydayEdits || 'NULL'}, ${youtubeEmbed}, ${indexed}, ${doWePost}, ${lowMetricsClientOk}, ${preapproveTopic}, ${authorBio}, ${addLinksToContent}, ${anchorLimit}, ${permanentLink}, ${renewable}, ${wordCountMinimum || 'NULL'}, NOW(), NOW());`;

    return sql;
  }

  /**
   * Generate INSERT statements for stl_v2_tags_staging
   */
  generateTagsInserts(item, siteId) {
    const sqls = [];
    
    if (item.employee_tags && Array.isArray(item.employee_tags)) {
      item.employee_tags.forEach(tag => {
        if (tag && String(tag).trim()) {
          const tagValue = this.escapeSql(this.truncate(tag, 100));
          sqls.push(`INSERT INTO stl_v2_tags_staging (site_id, tag) VALUES (${siteId}, ${tagValue});`);
        }
      });
    }

    return sqls;
  }

  /**
   * Generate INSERT statements for stl_v2_topics_staging
   */
  generateTopicsInserts(item, siteId) {
    const sqls = [];
    
    if (item.added_tags && String(item.added_tags).trim()) {
      const topics = String(item.added_tags).split(',');
      topics.forEach(topic => {
        if (topic && topic.trim()) {
          const topicValue = this.escapeSql(this.truncate(topic.trim(), 100));
          sqls.push(`INSERT INTO stl_v2_topics_staging (site_id, topic) VALUES (${siteId}, ${topicValue});`);
        }
      });
    }

    return sqls;
  }

  /**
   * Generate INSERT statements for stl_v2_traffic_trend_staging
   */
  generateTrafficTrendInserts(item, siteId) {
    const sqls = [];
    
    if (item.traffic_data && String(item.traffic_data).trim()) {
      const trafficValues = String(item.traffic_data).split(',');
      const today = new Date();
      
      // Limit to 15 entries as specified
      const limitedValues = trafficValues.slice(0, 1);
      
      limitedValues.forEach((traffic, index) => {
        const trafficInt = parseInt(traffic);
        if (!isNaN(trafficInt)) {
          // Use today's date for all entries (as specified by user)
          const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
          sqls.push(`INSERT INTO stl_v2_traffic_trend_staging (site_id, date, traffic_value) VALUES (${siteId}, '${dateStr}', ${trafficInt});`);
        }
      });
    }

    return sqls;
  }

  /**
   * Generate INSERT statement for stl_v2_geo_staging
   */
  generateGeoInsert(item, siteId) {
    const countryCode = this.getCountryFromLang(item.lang);
    const traffic = item.Traffic || item.ahrefs_traffic || 0;
    
    const sql = `INSERT INTO stl_v2_geo_staging (site_id, country_code, traffic, rank) VALUES (${siteId}, '${countryCode}', ${traffic}, 1);`;
    
    return sql;
  }

  /**
   * Generate all SQL for a single item
   */
  generateItemSql(item) {
    const siteId = this.currentSiteId++;
    const sqls = [];

    // 1. Main table (MUST HAVE)
    sqls.push(this.generateSitesInsert(item, siteId));

    // 2. Details (MUST HAVE)
    sqls.push(this.generateDetailsInsert(item, siteId));

    // 3. AI Categories (MUST HAVE)
    sqls.push(...this.generateAiCategoryInserts(item, siteId));

    // 4. Publisher (optional but parse from our_notes)
    const publisherSql = this.generatePublisherInsert(item, siteId);
    if (publisherSql) sqls.push(publisherSql);

    // 5. Tags (optional)
    sqls.push(...this.generateTagsInserts(item, siteId));

    // 6. Topics (optional)
    sqls.push(...this.generateTopicsInserts(item, siteId));

    // 7. Traffic Trend (optional, limit 15)
    sqls.push(...this.generateTrafficTrendInserts(item, siteId));

    // 8. Geo (optional, from lang)
    sqls.push(this.generateGeoInsert(item, siteId));

    return sqls;
  }

  /**
   * Main method to generate PostgreSQL file
   */
  async getDataWithDetailsAndStore() {
    try {
      console.log('🚀 Starting Loganix PostgreSQL file generation...');
      
      // Load JSON data
      const jsonData = await this.loadJsonData();
      let extractedData = jsonData.data;
      // extractedData = extractedData.slice(0, 10);
      
      console.log(`📊 Processing ${extractedData.length} records...`);

      // Generate SQL statements
      const allSqls = [];
      allSqls.push('-- Loganix PostgreSQL Insert File');
      allSqls.push('-- Generated: ' + new Date().toISOString());
      allSqls.push('-- Total Records: ' + extractedData.length);
      allSqls.push('');



      let processedCount = 0;
      for (const item of extractedData) {
        try {
          const itemSqls = this.generateItemSql(item);
          allSqls.push(...itemSqls);
          allSqls.push(''); // blank line between records
          processedCount++;
          
          if (processedCount % 100 === 0) {
            console.log(`✅ Processed ${processedCount}/${extractedData.length} records...`);
          }
        } catch (error) {
          console.error(`❌ Error processing record:`, error.message);
        }
      }

      // Write to file
      const outputPath = path.join(__dirname, '../../manual/loganix/output-postgre.sql');
      const sqlContent = allSqls.join('\n');
      
      await fs.writeFile(outputPath, sqlContent, 'utf8');
      
      console.log(`✅ Successfully generated SQL file at: ${outputPath}`);
      console.log(`📊 Total records processed: ${processedCount}`);
      console.log(`📊 Total SQL statements: ${allSqls.length}`);
      
      return {
        success: true,
        totalRecords: extractedData.length,
        totalProcessed: processedCount,
        outputPath: outputPath,
        sqlStatements: allSqls.length
      };
      
    } catch (error) {
      console.error('❌ Error in getDataWithDetailsAndStore:', error.message);
      throw error;
    }
  }
}

module.exports = LoganixService;
