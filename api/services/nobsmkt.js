const path = require('path');
const NobsMktRepository = require('../repositories/nobsmkt');
const JsonLoader = require('../helpers/jsonLoader');
const { sequelize } = require('../../config/database');

class NobsMktService {
  constructor() {
    this.nobsMktRepo = new NobsMktRepository(sequelize);
    this.chunkSize = 4000;
  }

  async loadJsonData() {
    try {
      const jsonPath = path.join(__dirname, '../../manual/nobsmarketplace/data.json');
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
          const extractedItem = {
            id: item.id || null,
            partner_code: item.partner_code || null,
            domain: item.domain || null,
            company_name: item.company_name || null,
            first_name: item.first_name || null,
            last_name: item.last_name || null,
            email: item.email || null,
            languages: item.languages || null,
            currency: item.currency || null,
            payment_type: item.payment_type || null,
            payment_description: item.payment_description || null,
            payment_type_confirm: item.payment_type_confirm || null,
            partner_type: item.partner_type || null,
            google_drive_link: item.google_drive_link || null,
            hosting_location: item.hosting_location || null,
            company_id: item.company_id || null,
            niche_id: item.niche_id || null,
            secondly_niche_id: item.secondly_niche_id || null,
            content_length: item.content_length || null,
            stock_images: item.stock_images || null,
            turn_around_time: item.turn_around_time || null,
            rating: item.rating || null,
            tags: item.tags || null,
            status: item.status || null
          };
          extractedData.push(extractedItem);
        } catch (itemError) {
          errorCount++;
          console.error(`❌ Error processing record ${i + 1}:`, itemError.message);
          console.error(`❌ Problematic record:`, JSON.stringify(jsonData[i], null, 2));
          
          // Continue processing other records
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

  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async processDataInChunks(data) {
    try {
      console.log(`🔄 Processing ${data.length} records in chunks of ${this.chunkSize}...`);
      
      // Get initial count
      const initialCount = await this.nobsMktRepo.count();
      console.log(`📊 Initial record count: ${initialCount}`);
      
      const chunks = this.chunkArray(data, this.chunkSize);
      console.log(`📦 Created ${chunks.length} chunks`);
      
      let totalProcessed = 0;
      let totalErrors = 0;
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`📦 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} records)...`);
        
        try {
          const result = await this.nobsMktRepo.bulkCreate(chunk);
          
          if (result.success) {
            totalProcessed += result.count;
            console.log(`✅ Chunk ${i + 1}: Successfully processed ${result.count} records`);
            
            // Verify a sample record was actually inserted
            if (chunk.length > 0 && chunk[0].id) {
              const sampleRecord = await this.nobsMktRepo.findById(chunk[0].id);
              if (sampleRecord) {
                console.log(`✅ Verification: Sample record ID ${chunk[0].id} found in database`);
              } else {
                console.warn(`⚠️  Warning: Sample record ID ${chunk[0].id} not found in database after bulk create`);
              }
            }
          } else {
            totalErrors += chunk.length;
            console.error(`❌ Chunk ${i + 1}: Failed - ${result.error}`);
            if (result.details) {
              console.error(`❌ Detailed error:`, result.details);
            }
          }
        } catch (error) {
          totalErrors += chunk.length;
          console.error(`❌ Chunk ${i + 1}: Error - ${error.message}`);
        }
        
        // Small delay between chunks to avoid overwhelming the database
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Get final count
      const finalCount = await this.nobsMktRepo.count();
      const actualInserted = finalCount - initialCount;
      
      console.log(`📊 Processing complete:`);
      console.log(`   ✅ Successfully processed: ${totalProcessed} records`);
      console.log(`   ❌ Failed: ${totalErrors} records`);
      console.log(`   📊 Initial count: ${initialCount}`);
      console.log(`   📊 Final count: ${finalCount}`);
      console.log(`   📊 Actually inserted: ${actualInserted} records`);
      
      return {
        success: true,
        totalProcessed,
        totalErrors,
        totalRecords: data.length,
        initialCount,
        finalCount,
        actualInserted
      };
    } catch (error) {
      console.error('❌ Error processing data in chunks:', error.message);
      throw error;
    }
  }

  async getDataWithDetailsAndStore() {
    try {
      console.log('🚀 Starting NobsMkt data processing...');
      
      // Sync database table
      console.log('🗄️  Syncing database table...');
      await this.nobsMktRepo.sync();
      console.log('✅ Database table synced');
      
      // Load JSON data
      const jsonData = await this.loadJsonData();
      
      // Extract data
      const extractedData = this.extractDataFromJson(jsonData);
      
      // Process in chunks
      const result = await this.processDataInChunks(extractedData);
      
      console.log('🎉 NobsMkt data processing completed successfully!');
      return result;
      
    } catch (error) {
      console.error('❌ Error in getDataWithDetailsAndStore:', error.message);
      throw error;
    }
  }
}

module.exports = NobsMktService;

