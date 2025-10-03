const path = require('path');
const SearcheyeDomainsRepository = require('../repositories/searcheye_domains');
const JsonLoader = require('../helpers/jsonLoader');
const { sequelize } = require('../../config/database');

class SearcheyeService {
  constructor() {
    this.searcheyeDomainsRepo = new SearcheyeDomainsRepository(sequelize);
  }

  async loadJsonData() {
    try {
      const jsonPath = path.join(__dirname, '../../manual/searcheye/data.json');
      return await JsonLoader.loadJsonData(jsonPath);
    } catch (error) {
      console.error('❌ Error loading JSON data:', error.message);
      throw error;
    }
  }

  extractDataFromJson(jsonData) {
    try {
      console.log('🔄 Extracting data from JSON...');
      
      const extractedData = [];
      let errorCount = 0;
      
      for (let i = 0; i < jsonData.length; i++) {
        try {
          const item = jsonData[i];
          
          // Convert keywords array to comma-separated string
          let keywordsString = null;
          if (item.keywords && Array.isArray(item.keywords)) {
            keywordsString = item.keywords.join(', ');
          }
          
          const extractedItem = {
            id: item.id || null,
            type: item.type || null,
            relevance_score: item.relevance_score || null,
            domain_name: item.domain_name || null,
            domain_rating: item.domain_rating || null,
            favicon: item.favicon || null,
            organic_traffic: item.organic_traffic || null,
            minimum_turnaround_time: item.minimum_turnaround_time || null,
            trending_state: item.trending_state || null,
            is_verified: item.is_verified || null,
            purchased: item.purchased || null,
            keywords: keywordsString,
            business_type_id: item.business_type_id || null,
            website_feedbacks: item.website_feedbacks || null,
            impressions: item.impressions || null,
            socials: item.socials ? JSON.stringify(item.socials) : null
          };
          
          extractedData.push(extractedItem);
        } catch (itemError) {
          errorCount++;
          console.error(`❌ Error processing record ${i + 1}:`, itemError.message);
          console.error(`❌ Problematic record:`, JSON.stringify(jsonData[i], null, 2));
          
          if (errorCount > 10) {
            console.error('❌ Too many errors, stopping extraction');
            throw new Error(`Too many extraction errors (${errorCount})`);
          }
        }
      }
      
      console.log(`✅ Extracted ${extractedData.length} records (${errorCount} errors)`);
      return extractedData;
    } catch (error) {
      console.error('❌ Error extracting data:', error.message);
      throw error;
    }
  }

  async processDataInChunks(data, chunkSize = 4000) {
    try {
      console.log(`🔄 Processing ${data.length} records in chunks of ${chunkSize}...`);
      
      const chunks = [];
      for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
      }
      
      console.log(`📦 Created ${chunks.length} chunks for processing`);
      
      let totalInserted = 0;
      let totalErrors = 0;
      const results = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`🔄 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} records)...`);
        
        try {
          const result = await this.searcheyeDomainsRepo.bulkCreate(chunk);
          
          if (result.success) {
            totalInserted += result.count;
            console.log(`✅ Chunk ${i + 1} processed successfully: ${result.count} records inserted`);
            results.push({
              chunk: i + 1,
              success: true,
              count: result.count
            });
          } else {
            totalErrors += chunk.length;
            console.error(`❌ Chunk ${i + 1} failed:`, result.error);
            results.push({
              chunk: i + 1,
              success: false,
              error: result.error
            });
          }
        } catch (chunkError) {
          totalErrors += chunk.length;
          console.error(`❌ Chunk ${i + 1} processing error:`, chunkError.message);
          results.push({
            chunk: i + 1,
            success: false,
            error: chunkError.message
          });
        }
      }
      
      console.log(`📊 Processing Summary:`);
      console.log(`   ✅ Total inserted: ${totalInserted}`);
      console.log(`   ❌ Total errors: ${totalErrors}`);
      console.log(`   📦 Total chunks: ${chunks.length}`);
      
      return {
        success: true,
        totalRecords: data.length,
        totalInserted,
        totalErrors,
        totalChunks: chunks.length,
        results
      };
    } catch (error) {
      console.error('❌ Error processing data in chunks:', error.message);
      throw error;
    }
  }

  async getDataWithDetailsAndStore() {
    try {
      console.log('🚀 Starting SearcheyeDomains data processing...');
      
      // Step 1: Load JSON data
      const jsonData = await this.loadJsonData();
      
      // Step 2: Extract and transform data
      const extractedData = this.extractDataFromJson(jsonData);
      
      // Step 3: Ensure table exists
      await this.searcheyeDomainsRepo.sync();
      console.log('✅ Database table synchronized');
      
      // Step 4: Process data in chunks
      const processingResult = await this.processDataInChunks(extractedData);
      
      console.log('🎉 SearcheyeDomains data processing completed successfully!');
      
      return {
        success: true,
        message: 'SearcheyeDomains data processing completed successfully',
        data: processingResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ SearcheyeDomains service error:', error);
      throw error;
    }
  }
}

module.exports = SearcheyeService;
