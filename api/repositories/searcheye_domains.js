const SearcheyeDomains = require('../models/SearcheyeDomains');

class SearcheyeDomainsRepository {
  constructor(sequelize) {
    this.searcheyeDomainsModel = new SearcheyeDomains(sequelize);
    this.model = this.searcheyeDomainsModel.getModel();
  }

  async bulkCreate(data) {
    try {
      const result = await this.model.bulkCreate(data, {
        updateOnDuplicate: [
          'type', 'relevance_score', 'domain_name', 'domain_rating', 'favicon',
          'organic_traffic', 'minimum_turnaround_time', 'trending_state', 'is_verified',
          'purchased', 'keywords', 'business_type_id', 'website_feedbacks',
          'impressions', 'socials'
        ]
      });
      return { success: true, data: result, count: result.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sync(options = {}) {
    return await this.searcheyeDomainsModel.sync(options);
  }
}

module.exports = SearcheyeDomainsRepository;
