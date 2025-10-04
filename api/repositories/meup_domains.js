const MeUpDomains = require('../models/MeUpDomains');

class MeUpDomainsRepository {
  constructor(sequelize) {
    this.meUpDomainsModel = new MeUpDomains(sequelize);
    this.model = this.meUpDomainsModel.getModel();
  }

  /**
   * Insert a single MeUp domain record
   * @param {Object} domainData - Domain data object
   * @returns {Promise<Object>} Created domain record
   */
  async postMeUpDomain(domainData) {
    try {
      const domain = await this.model.create({
        id: domainData.id,
        name: domainData.name,
        price: domainData.price,
        originalPrice: domainData.originalPrice,
        backlinkType: domainData.backlinkType,
        sample: domainData.sample,
        minimumWordCount: domainData.minimumWordCount,
        contentAdvertiser: domainData.contentAdvertiser,
        contentPublisher: domainData.contentPublisher,
        contentPrice: domainData.contentPrice,
        purchasesCount: domainData.purchasesCount,
        hotSelling: domainData.hotSelling,
        visibility: domainData.visibility,
        duration: domainData.duration,
        note: domainData.note,
        isTrustedPublisher: domainData.isTrustedPublisher,
        createdAt: domainData.createdAt,
        updatedAt: domainData.updatedAt
      });

      return {
        success: true,
        data: domain,
        message: 'Domain created successfully'
      };
    } catch (error) {
      console.error('Error creating MeUp domain:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create domain'
      };
    }
  }

  /**
   * Bulk create multiple MeUp domain records
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
        name: domainData.name,
        price: domainData.price,
        originalPrice: domainData.originalPrice,
        backlinkType: domainData.backlinkType,
        sample: domainData.sample,
        minimumWordCount: domainData.minimumWordCount,
        contentAdvertiser: domainData.contentAdvertiser,
        contentPublisher: domainData.contentPublisher,
        contentPrice: domainData.contentPrice,
        purchasesCount: domainData.purchasesCount,
        hotSelling: domainData.hotSelling,
        visibility: domainData.visibility,
        duration: domainData.duration,
        note: domainData.note,
        isTrustedPublisher: domainData.isTrustedPublisher,
        createdAt: domainData.createdAt,
        updatedAt: domainData.updatedAt
      }));

      const result = await this.model.bulkCreate(preparedData, {
        updateOnDuplicate: ['name', 'price', 'originalPrice', 'backlinkType', 'sample', 
                           'minimumWordCount', 'contentAdvertiser', 'contentPublisher', 
                           'contentPrice', 'purchasesCount', 'hotSelling', 'visibility', 
                           'duration', 'note', 'isTrustedPublisher', 'updatedAt']
      });

      return {
        success: true,
        data: result,
        count: result.length,
        message: `Successfully created/updated ${result.length} domains`
      };
    } catch (error) {
      console.error('Error bulk creating MeUp domains:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to bulk create domains'
      };
    }
  }

  /**
   * Find domain by ID
   * @param {number} id - Domain ID
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
      await this.meUpDomainsModel.sync(options);
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

module.exports = MeUpDomainsRepository;
