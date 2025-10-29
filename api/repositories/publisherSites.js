const PublisherSites = require('../models/PublisherSites');

/**
 * PublisherSites Repository
 * Handles database operations for the PublisherSites model
 */
class PublisherSitesRepository {
  constructor(sequelizePostgres) {
    this.publisherSitesModel = new PublisherSites(sequelizePostgres);
    this.model = this.publisherSitesModel.getModel();
  }

  /**
   * Bulk create publisher sites in the database
   * @param {Array} sitesData - Array of publisher site objects to insert
   * @returns {Promise<Array>} Created publisher sites
   */
  async bulkCreate(sitesData) {
    try {
      // Remove meta_embeddings field from each site before logging (if exists)
      const sitesDataForLogging = sitesData.map(site => {
        const { meta_embeddings, ...siteWithoutEmbeddings } = site;
        return siteWithoutEmbeddings;
      });
      console.log(sitesDataForLogging);
      
      const createdSites = await this.model.bulkCreate(sitesData, {
        ignoreDuplicates: true,
        validate: true
      });
      return { success: true, data: createdSites, count: createdSites.length };
    } catch (error) {
      console.error('Error in PublisherSitesRepository.bulkCreate:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a single publisher site
   * @param {Object} siteData - Publisher site data to insert
   * @returns {Promise<Object>} Created publisher site
   */
  async create(siteData) {
    try {
      const createdSite = await this.model.create(siteData);
      return { success: true, data: createdSite };
    } catch (error) {
      console.error('Error in PublisherSitesRepository.create:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find publisher site by ID
   * @param {number} siteId - Publisher site ID to find
   * @returns {Promise<Object>} Found publisher site
   */
  async findById(siteId) {
    try {
      const site = await this.model.findByPk(siteId);
      return { success: true, data: site };
    } catch (error) {
      console.error('Error in PublisherSitesRepository.findById:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find all publisher sites with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Found publisher sites
   */
  async findAll(options = {}) {
    try {
      const sites = await this.model.findAndCountAll(options);
      return { success: true, data: sites };
    } catch (error) {
      console.error('Error in PublisherSitesRepository.findAll:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get total count of publisher sites
   * @returns {Promise<Object>} Total count
   */
  async getTotalCount() {
    try {
      const count = await this.model.count();
      return { success: true, count };
    } catch (error) {
      console.error('Error in PublisherSitesRepository.getTotalCount:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = PublisherSitesRepository;
