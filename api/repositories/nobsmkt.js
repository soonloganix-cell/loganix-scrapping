const NobsMkt = require('../models/NobsMkt');

class NobsMktRepository {
  constructor(sequelize) {
    this.nobsMktModel = new NobsMkt(sequelize);
    this.model = this.nobsMktModel.getModel();
  }

  async postNobsMkt(data) {
    try {
      const nobsMkt = await this.model.create({
        id: data.id,
        partner_code: data.partner_code,
        domain: data.domain,
        company_name: data.company_name,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        languages: data.languages,
        currency: data.currency,
        payment_type: data.payment_type,
        payment_description: data.payment_description,
        payment_type_confirm: data.payment_type_confirm,
        partner_type: data.partner_type,
        google_drive_link: data.google_drive_link,
        hosting_location: data.hosting_location,
        company_id: data.company_id,
        niche_id: data.niche_id,
        secondly_niche_id: data.secondly_niche_id,
        content_length: data.content_length,
        stock_images: data.stock_images,
        turn_around_time: data.turn_around_time,
        rating: data.rating,
        tags: data.tags,
        status: data.status
      });
      return { success: true, data: nobsMkt };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async bulkCreate(dataArray) {
    try {
      console.log(`🔄 Attempting to bulk create ${dataArray.length} records...`);
      console.log(`📋 Sample record:`, JSON.stringify(dataArray[0], null, 2));
      
      const result = await this.model.bulkCreate(dataArray, { 
        updateOnDuplicate: [
          'partner_code', 'domain', 'company_name', 'first_name', 'last_name',
          'email', 'languages', 'currency', 'payment_type', 'payment_description',
          'payment_type_confirm', 'partner_type', 'google_drive_link', 'hosting_location',
          'company_id', 'niche_id', 'secondly_niche_id', 'content_length', 'stock_images',
          'turn_around_time', 'rating', 'tags', 'status'
        ],
        validate: true,
        returning: true
      });
      
      console.log(`✅ Bulk create successful. Created/updated ${result.length} records`);
      console.log(`📊 Result type:`, typeof result);
      console.log(`📊 Result is array:`, Array.isArray(result));
      
      return { success: true, data: result, count: result.length };
    } catch (error) {
      console.error(`❌ Bulk create failed:`, error.message);
      console.error(`❌ Error details:`, error);
      
      // Log more detailed error information
      if (error.errors) {
        console.error(`❌ Validation errors:`, error.errors);
      }
      if (error.original) {
        console.error(`❌ Original SQL error:`, error.original);
      }
      
      return { success: false, error: error.message, details: error };
    }
  }

  async sync(options = {}) {
    return await this.nobsMktModel.sync(options);
  }

  async count() {
    try {
      const count = await this.model.count();
      console.log(`📊 Current record count in table: ${count}`);
      return count;
    } catch (error) {
      console.error(`❌ Error counting records:`, error.message);
      return 0;
    }
  }

  async findById(id) {
    try {
      const record = await this.model.findByPk(id);
      return record;
    } catch (error) {
      console.error(`❌ Error finding record by ID ${id}:`, error.message);
      return null;
    }
  }
}

module.exports = NobsMktRepository;

