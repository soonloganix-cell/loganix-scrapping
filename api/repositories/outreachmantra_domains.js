const OutreachmantraDomains = require('../models/OutreachmantraDomains');

class OutreachmantraDomainsRepository {
  constructor(sequelize) {
    this.outreachmantraDomainsModel = new OutreachmantraDomains(sequelize);
    this.model = this.outreachmantraDomainsModel.getModel();
  }

  /**
   * Insert a single OutreachMantra domain record
   * @param {Object} domainData - Domain data object
   * @returns {Promise<Object>} Created domain record
   */
  async postOutreachmantraDomain(domainData) {
    try {
      const domain = await this.model.create({
        id: domainData.id,
        websiteUrl: domainData.websiteUrl,
        categories: Array.isArray(domainData.categories) ? domainData.categories.join(', ') : domainData.categories,
        tatInDays: domainData.tatInDays,
        monthlyTraffic: domainData.monthlyTraffic,
        samplePostUrl: domainData.samplePostUrl,
        guidelines: domainData.guidelines,
        domainVerified: domainData.domainVerified,
        gaValidated: domainData.gaValidated,
        successfulOrders: domainData.successfulOrders,
        userKartPostTypeList: domainData.userKartPostTypeList,
        wishlistPostTypeList: domainData.wishlistPostTypeList,
        da: domainData.da,
        DR: domainData.DR
      });

      return {
        success: true,
        data: domain,
        message: 'Domain created successfully'
      };
    } catch (error) {
      console.error('Error creating OutreachMantra domain:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create domain'
      };
    }
  }

  /**
   * Bulk create multiple OutreachMantra domain records
   * @param {Array} domainsData - Array of domain data objects
   * @returns {Promise<Object>} Bulk create result
   */
  async bulkCreate(domainsData) {
    try {
      if (!Array.isArray(domainsData) || domainsData.length === 0) {
        return {
          success: false,
          error: 'Invalid domains data',
          message: 'Domains data must be a non-empty array'
        };
      }

      // Prepare data for bulk insert
      const preparedData = domainsData.map(domainData => ({
        id: domainData.id,
        websiteUrl: domainData.websiteUrl,
        categories: Array.isArray(domainData.categories) ? domainData.categories.join(', ') : domainData.categories,
        tatInDays: domainData.tatInDays,
        monthlyTraffic: domainData.monthlyTraffic,
        samplePostUrl: domainData.samplePostUrl,
        guidelines: domainData.guidelines,
        domainVerified: domainData.domainVerified,
        gaValidated: domainData.gaValidated,
        successfulOrders: domainData.successfulOrders,
        userKartPostTypeList: domainData.userKartPostTypeList,
        wishlistPostTypeList: domainData.wishlistPostTypeList,
        da: domainData.da,
        DR: domainData.DR
      }));

      const result = await this.model.bulkCreate(preparedData, {
        updateOnDuplicate: ['websiteUrl', 'categories', 'tatInDays', 'monthlyTraffic', 
                           'samplePostUrl', 'guidelines', 'domainVerified', 'gaValidated', 
                           'successfulOrders', 'userKartPostTypeList', 'wishlistPostTypeList', 
                           'da', 'DR']
      });

      return {
        success: true,
        data: result,
        count: result.length,
        message: `Successfully created/updated ${result.length} domains`
      };
    } catch (error) {
      console.error('Error bulk creating OutreachMantra domains:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to bulk create domains'
      };
    }
  }

  /**
   * Find domain by ID
   * @param {string} id - Domain ID
   * @returns {Promise<Object>} Domain record
   */
  async findById(id) {
    try {
      const domain = await this.model.findByPk(id);
      return {
        success: true,
        data: domain,
        message: domain ? 'Domain found' : 'Domain not found'
      };
    } catch (error) {
      console.error('Error finding domain by ID:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to find domain'
      };
    }
  }

  /**
   * Get all domains with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated domains
   */
  async findAll(options = {}) {
    try {
      const { page = 1, limit = 100, offset = 0 } = options;
      const actualOffset = offset || (page - 1) * limit;

      const { count, rows } = await this.model.findAndCountAll({
        limit: parseInt(limit),
        offset: actualOffset,
        order: [['createdAt', 'DESC']]
      });

      return {
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        },
        message: `Found ${count} domains`
      };
    } catch (error) {
      console.error('Error finding all domains:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to find domains'
      };
    }
  }

  /**
   * Sync the model with database
   * @param {Object} options - Sync options
   */
  async sync(options = {}) {
    try {
      await this.outreachmantraDomainsModel.sync(options);
      return {
        success: true,
        message: 'Model synced successfully'
      };
    } catch (error) {
      console.error('Error syncing model:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to sync model'
      };
    }
  }
}

module.exports = OutreachmantraDomainsRepository;
