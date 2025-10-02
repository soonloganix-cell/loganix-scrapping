const PrNewsDomains = require('../models/PrNewsDomains');

class PrNewsDomainsRepository {
  constructor(sequelize) {
    this.prNewsDomainsModel = new PrNewsDomains(sequelize);
    this.model = this.prNewsDomainsModel.getModel();
  }

  async postPrNewsDomain(domainData) {
    try {
      const domain = await this.model.create({
        url: domainData.url,
        price: domainData.price,
        audience: domainData.audience,
        class: domainData.class
      });
      return { success: true, data: domain };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async bulkCreate(domainsData) {
    try {
      const result = await this.model.bulkCreate(domainsData, { 
        updateOnDuplicate: ['url', 'price', 'audience', 'class'] 
      });
      return { success: true, data: result, count: result.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sync(options = {}) {
    return await this.prNewsDomainsModel.sync(options);
  }
}

module.exports = PrNewsDomainsRepository;


