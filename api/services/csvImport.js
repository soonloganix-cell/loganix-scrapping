const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const SitesRepository = require('../repositories/sites');
const PublisherSitesRepository = require('../repositories/publisherSites');
const VendorSitesRepository = require('../repositories/vendorSites');

/**
 * CSV Import Service
 * Handles CSV file processing and data import to PostgreSQL
 */
class CsvImportService {
  constructor(sequelizePostgres) {
    this.sitesRepository = new SitesRepository(sequelizePostgres);
    this.publisherSitesRepository = new PublisherSitesRepository(sequelizePostgres);
    this.vendorSitesRepository = new VendorSitesRepository(sequelizePostgres);
    this.chunkSize = 100;
  }

  /**
   * Process CSV file and convert to JSON
   * @param {string} filePath - Path to the CSV file
   * @returns {Promise<Array>} Array of JSON objects
   */
  async processCsvToJson(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          // Clean and process each row
          const cleanedData = this.cleanCsvRow(data);
          results.push(cleanedData);
        })
        .on('end', () => {
          console.log(`✅ CSV processing completed. Total rows: ${results.length}`);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('❌ Error processing CSV:', error);
          reject(error);
        });
    });
  }

  /**
   * Clean and format CSV row data
   * @param {Object} row - Raw CSV row data
   * @returns {Object} Cleaned row data
   */
  cleanCsvRow(row) {
    const cleanedRow = {};
    
    // Define default values for required fields
    const defaultValues = {
      is_direct: false,
      marked_as_sponsored: false,
      loganix_certified: false,
      created_at: new Date(),
    };
    
    // Process each field in the row
    Object.keys(row).forEach(key => {
      let value = row[key];
      
      // Handle empty strings and convert to null
      if (value === '' || value === 'null' || value === 'NULL') {
        value = null;
      }
      
      // Handle boolean values
      if (value === 'true' || value === 'TRUE' || value === '1') {
        value = true;
      } else if (value === 'false' || value === 'FALSE' || value === '0') {
        value = false;
      }
      
      // Handle numeric values
      if (value && !isNaN(value) && value !== '') {
        // Check if it's a decimal number
        if (value.toString().includes('.')) {
          value = parseFloat(value);
        } else {
          value = parseInt(value, 10);
        }
      }
      
      // Handle JSON fields
      if (key.includes('_display') || key.includes('details')) {
        if (value && typeof value === 'string') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // If JSON parsing fails, keep as string
            console.warn(`Warning: Could not parse JSON for field ${key}: ${value}`);
          }
        }
      }
      
      // Handle array fields (like meta_embeddings)
      if (key === 'meta_embeddings' && value && typeof value === 'string') {
        try {
          value = JSON.parse(value);
          if (Array.isArray(value)) {
            value = value.map(v => parseFloat(v));
          }
        } catch (e) {
          console.warn(`Warning: Could not parse array for field ${key}: ${value}`);
          value = null;
        }
      }
      
      cleanedRow[key] = value;
    });
    
    // Apply default values for required fields that are missing or null
    Object.keys(defaultValues).forEach(field => {
      if (!cleanedRow.hasOwnProperty(field) || cleanedRow[field] === null || cleanedRow[field] === undefined) {
        cleanedRow[field] = defaultValues[field];
      }
    });
    
    return cleanedRow;
  }

  /**
   * Clean data for sites table
   * @param {Array} jsonData - Raw JSON data
   * @returns {Array} Cleaned data for sites table
   */
  cleanSitesData(jsonData) {
    console.log('🔧 Cleaning data for sites table...');
    jsonData.forEach(item => {
      // Boolean fields
      item.is_direct = item.is_direct ? true : false;
      item.marked_as_sponsored = item.marked_as_sponsored ? true : false;
      item.loganix_certified = item.loganix_certified ? true : false;
      
      // Integer fields with defaults
      item.pr = item.pr ? item.pr : 0;
      item.link_fraud = item.link_fraud ? item.link_fraud : 0;
      item.ux_score = item.ux_score ? item.ux_score : 0;
      item.ai_visibility = item.ai_visibility ? item.ai_visibility : 0;
      item.cf = item.cf ? item.cf : 0;
      item.da = item.da ? item.da : 0;
      item.dr = item.dr ? item.dr : 0;
      item.rd = item.rd ? item.rd : 0;
      item.tf = item.tf ? item.tf : 0;
      item.backlinks_total = item.backlinks_total ? item.backlinks_total : 0;
      item.traffic_total = item.traffic_total ? item.traffic_total : 0;
      item.traffic_trend = item.traffic_trend ? item.traffic_trend : 0;
    });
    console.log('✅ Sites data cleaned');
    return jsonData;
  }

  /**
   * Clean data for publisher_sites table
   * @param {Array} jsonData - Raw JSON data
   * @returns {Array} Cleaned data for publisher_sites table
   */
  cleanPublisherSitesData(jsonData) {
    console.log('🔧 Cleaning data for publisher_sites table...');
    jsonData.forEach(item => {
      // Boolean fields
      item.youtube_embed = item.youtube_embed ? true : false;
      item.indexed = item.indexed !== false; // Default to true
      item.do_we_post = item.do_we_post ? true : false;
      item.low_metrics_client_ok = item.low_metrics_client_ok ? true : false;
      item.preapprove_topic = item.preapprove_topic ? true : false;
      item.author_bio = item.author_bio ? true : false;
      item.add_links_to_content = item.add_links_to_content ? true : false;
      item.anchor_limit = item.anchor_limit ? true : false;
      item.permanent_link = item.permanent_link !== false; // Default to true
      item.renewable = item.renewable ? true : false;
      
      // Integer fields with defaults
      item.tat = item.tat ? item.tat : 0;
      item.word_count_minimum = item.word_count_minimum ? item.word_count_minimum : 0;
      
      // Price fields
      item.price_general = item.price_general ? parseFloat(item.price_general) : 0;
      item.price_adult = item.price_adult ? parseFloat(item.price_adult) : 0;
      item.price_gambling = item.price_gambling ? parseFloat(item.price_gambling) : 0;
      item.price_crypto = item.price_crypto ? parseFloat(item.price_crypto) : 0;
      item.price_payday = item.price_payday ? parseFloat(item.price_payday) : 0;
      item.price_general_edits = item.price_general_edits ? parseFloat(item.price_general_edits) : 0;
      item.price_adult_edits = item.price_adult_edits ? parseFloat(item.price_adult_edits) : 0;
      item.price_gambling_edits = item.price_gambling_edits ? parseFloat(item.price_gambling_edits) : 0;
      item.price_crypto_edits = item.price_crypto_edits ? parseFloat(item.price_crypto_edits) : 0;
      item.price_payday_edits = item.price_payday_edits ? parseFloat(item.price_payday_edits) : 0;
    });
    console.log('✅ Publisher sites data cleaned');
    return jsonData;
  }

  /**
   * Clean data for vendor_sites table
   * @param {Array} jsonData - Raw JSON data
   * @returns {Array} Cleaned data for vendor_sites table
   */
  cleanVendorSitesData(jsonData) {
    console.log('🔧 Cleaning data for vendor_sites table...');
    jsonData.forEach(item => {
      // Boolean fields
      item.is_minimum_cost = item.is_minimum_cost ? true : false;
      
      // Integer fields with defaults
      item.tat = item.tat ? item.tat : 7; // Default to 7
      
      // Numeric fields
      item.cost = item.cost ? parseFloat(item.cost) : 0;
      
      // String fields with length limits
      if (item.vendor && item.vendor.length > 15) {
        item.vendor = item.vendor.substring(0, 15);
      }
      
      // Add created_at timestamp manually since timestamps are disabled
      if (!item.created_at) {
        item.created_at = new Date();
      }
    });
    console.log('✅ Vendor sites data cleaned');
    return jsonData;
  }

  /**
   * Split array into chunks
   * @param {Array} array - Array to chunk
   * @param {number} chunkSize - Size of each chunk
   * @returns {Array} Array of chunks
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Import CSV data to PostgreSQL in chunks
   * @param {string} filePath - Path to the CSV file
   * @param {string} table - Table name (sites, publisher_sites, vendor_sites)
   * @returns {Promise<Object>} Import result
   */
  async importCsvData(filePath, table = 'sites') {
    try {
      console.log('🔄 Starting CSV import process...');
      
      // Step 1: Process CSV to JSON
      console.log('📄 Processing CSV file...');
      const jsonData = await this.processCsvToJson(filePath);
      
      if (!jsonData || jsonData.length === 0) {
        return {
          success: false,
          error: 'No data found in CSV file',
          totalProcessed: 0,
          totalInserted: 0
        };
      }
      
      console.log(`📊 Total records to process: ${jsonData.length}`);
      console.log(`🎯 Target table: ${table}`);
      
      // Step 1.5: Clean data based on table type
      let cleanedData;
      switch (table) {
        case 'sites':
          cleanedData = this.cleanSitesData(jsonData);
          break;
        case 'publisher_sites':
          cleanedData = this.cleanPublisherSitesData(jsonData);
          break;
        case 'vendor_sites':
          cleanedData = this.cleanVendorSitesData(jsonData);
          break;
        default:
          throw new Error(`Unsupported table: ${table}. Supported tables: sites, publisher_sites, vendor_sites`);
      }
      
      // Step 2: Split into chunks
      const chunks = this.chunkArray(cleanedData, this.chunkSize);
      console.log(`📦 Split into ${chunks.length} chunks of ${this.chunkSize} records each`);
      
      let totalInserted = 0;
      let totalErrors = 0;
      const errors = [];
      
      // Step 3: Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`🔄 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} records)...`);
        
        try {
          let result;
          switch (table) {
            case 'sites':
              result = await this.sitesRepository.bulkCreate(chunk);
              break;
            case 'publisher_sites':
              result = await this.publisherSitesRepository.bulkCreate(chunk);
              break;
            case 'vendor_sites':
              result = await this.vendorSitesRepository.bulkCreate(chunk);
              break;
            default:
              throw new Error(`Unsupported table: ${table}`);
          }
          
          if (result.success) {
            totalInserted += result.count;
            console.log(`✅ Chunk ${i + 1} processed successfully. Inserted: ${result.count} records`);
          } else {
            totalErrors += chunk.length;
            errors.push({
              chunk: i + 1,
              error: result.error,
              records: chunk.length
            });
            console.error(`❌ Chunk ${i + 1} failed: ${result.error}`);
          }
        } catch (error) {
          totalErrors += chunk.length;
          errors.push({
            chunk: i + 1,
            error: error.message,
            records: chunk.length
          });
          console.error(`❌ Chunk ${i + 1} failed with exception: ${error.message}`);
        }
      }
      
      // Step 4: Return results
      const result = {
        success: totalErrors === 0,
        totalProcessed: jsonData.length,
        totalInserted,
        totalErrors,
        chunksProcessed: chunks.length,
        errors: errors.length > 0 ? errors : undefined
      };
      
      console.log('📈 Import Summary:');
      console.log(`   Total Processed: ${result.totalProcessed}`);
      console.log(`   Total Inserted: ${result.totalInserted}`);
      console.log(`   Total Errors: ${result.totalErrors}`);
      console.log(`   Chunks Processed: ${result.chunksProcessed}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in CSV import process:', error);
      return {
        success: false,
        error: error.message,
        totalProcessed: 0,
        totalInserted: 0
      };
    }
  }

  /**
   * Test database connection
   * @param {string} table - Table name to test (optional)
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection(table = 'sites') {
    try {
      let result;
      switch (table) {
        case 'sites':
          result = await this.sitesRepository.getTotalCount();
          break;
        case 'publisher_sites':
          result = await this.publisherSitesRepository.getTotalCount();
          break;
        case 'vendor_sites':
          result = await this.vendorSitesRepository.getTotalCount();
          break;
        default:
          return {
            success: false,
            message: `Unsupported table: ${table}`,
            error: `Supported tables: sites, publisher_sites, vendor_sites`
          };
      }
      
      return {
        success: result.success,
        message: result.success ? `PostgreSQL connection successful (${table})` : 'PostgreSQL connection failed',
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        message: 'PostgreSQL connection failed',
        error: error.message
      };
    }
  }
}

module.exports = CsvImportService;
