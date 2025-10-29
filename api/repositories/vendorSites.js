const VendorSites = require('../models/VendorSites');

/**
 * VendorSites Repository
 * Handles database operations for the VendorSites model
 */
class VendorSitesRepository {
  constructor(sequelizePostgres) {
    this.vendorSitesModel = new VendorSites(sequelizePostgres);
    this.model = this.vendorSitesModel.getModel();
  }

  /**
   * Bulk create vendor sites in the database
   * @param {Array} sitesData - Array of vendor site objects to insert
   * @returns {Promise<Array>} Created vendor sites
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
      console.error('Error in VendorSitesRepository.bulkCreate:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a single vendor site
   * @param {Object} siteData - Vendor site data to insert
   * @returns {Promise<Object>} Created vendor site
   */
  async create(siteData) {
    try {
      const createdSite = await this.model.create(siteData);
      return { success: true, data: createdSite };
    } catch (error) {
      console.error('Error in VendorSitesRepository.create:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find vendor site by ID
   * @param {number} siteId - Vendor site ID to find
   * @returns {Promise<Object>} Found vendor site
   */
  async findById(siteId) {
    try {
      const site = await this.model.findByPk(siteId);
      return { success: true, data: site };
    } catch (error) {
      console.error('Error in VendorSitesRepository.findById:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find all vendor sites with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Found vendor sites
   */
  async findAll(options = {}) {
    try {
      const sites = await this.model.findAndCountAll(options);
      return { success: true, data: sites };
    } catch (error) {
      console.error('Error in VendorSitesRepository.findAll:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get total count of vendor sites
   * @returns {Promise<Object>} Total count
   */
  async getTotalCount() {
    try {
      const count = await this.model.count();
      return { success: true, count };
    } catch (error) {
      console.error('Error in VendorSitesRepository.getTotalCount:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = VendorSitesRepository;
