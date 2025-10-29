const Sites = require('../models/Sites');

/**
 * Sites Repository
 * Handles database operations for the Sites model
 */
class SitesRepository {
  constructor(sequelizePostgres) {
    this.sitesModel = new Sites(sequelizePostgres);
    this.model = this.sitesModel.getModel();
  }

  /**
   * Bulk create sites in the database
   * @param {Array} sitesData - Array of site objects to insert
   * @returns {Promise<Array>} Created sites
   */
  async bulkCreate(sitesData) {
    try {
      // Remove meta_embeddings field from each site before logging
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
      // console.error('Error in SitesRepository.bulkCreate:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a single site
   * @param {Object} siteData - Site data to insert
   * @returns {Promise<Object>} Created site
   */
  async create(siteData) {
    try {
      const createdSite = await this.model.create(siteData);
      return { success: true, data: createdSite };
    } catch (error) {
      console.error('Error in SitesRepository.create:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find site by ID
   * @param {number} siteId - Site ID to find
   * @returns {Promise<Object>} Found site
   */
  async findById(siteId) {
    try {
      const site = await this.model.findByPk(siteId);
      return { success: true, data: site };
    } catch (error) {
      console.error('Error in SitesRepository.findById:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find all sites with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Found sites
   */
  async findAll(options = {}) {
    try {
      const sites = await this.model.findAndCountAll(options);
      return { success: true, data: sites };
    } catch (error) {
      console.error('Error in SitesRepository.findAll:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update site by ID
   * @param {number} siteId - Site ID to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated site
   */
  async updateById(siteId, updateData) {
    try {
      const [updatedRowsCount] = await this.model.update(updateData, {
        where: { site_id: siteId }
      });
      
      if (updatedRowsCount === 0) {
        return { success: false, error: 'Site not found' };
      }

      const updatedSite = await this.findById(siteId);
      return { success: true, data: updatedSite.data };
    } catch (error) {
      console.error('Error in SitesRepository.updateById:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete site by ID
   * @param {number} siteId - Site ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteById(siteId) {
    try {
      const deletedRowsCount = await this.model.destroy({
        where: { site_id: siteId }
      });

      if (deletedRowsCount === 0) {
        return { success: false, error: 'Site not found' };
      }

      return { success: true, message: 'Site deleted successfully' };
    } catch (error) {
      console.error('Error in SitesRepository.deleteById:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get total count of sites
   * @returns {Promise<Object>} Total count
   */
  async getTotalCount() {
    try {
      const count = await this.model.count();
      return { success: true, count };
    } catch (error) {
      console.error('Error in SitesRepository.getTotalCount:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync the model with database
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} Sync result
   */
  async syncModel(options = {}) {
    try {
      await this.sitesModel.sync(options);
      return { success: true, message: 'Model synced successfully' };
    } catch (error) {
      console.error('Error in SitesRepository.syncModel:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SitesRepository;
