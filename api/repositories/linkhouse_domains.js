const LinkHouseDomains = require('../models/LinkHouseDomains');

class LinkHouseDomainsRepository {
  constructor(sequelize) {
    this.linkHouseDomainsModel = new LinkHouseDomains(sequelize);
    this.model = this.linkHouseDomainsModel.getModel();
  }

  /**
   * Insert a single LinkHouse domain record
   * @param {Object} domainData - Domain data object
   * @returns {Promise<Object>} Created domain record
   */
  async postLinkHouseDomain(domainData) {
    try {
      const domain = await this.model.create({
        id: domainData.id,
        domain: domainData.domain,
        pageAdress: domainData.page_adress,
        clientId: domainData.client_id,
        lang: domainData.lang,
        country: domainData.country,
        pageCategory: domainData.page_category,
        pageReach: domainData.page_reach,
        pageType: domainData.page_type,
        isVerified: domainData.is_verified,
        pageTags: domainData.page_tags,
        pageDescription: domainData.page_description,
        forbiddenTopics: domainData.forbidden_topics,
        tf: domainData.TF,
        cf: domainData.CF,
        backlinks: domainData.backlinks,
        referringDomains: domainData.referring_domains,
        da: domainData.DA,
        mozSpamScore: domainData.moz_spam_score,
        mozRefDomains: domainData.moz_ref_domains,
        mozBacklinks: domainData.moz_backlinks,
        mozLinkedRootDomains: domainData.moz_linked_root_domains,
        dr: domainData.DR,
        backlinksAhrefs: domainData.backlinks_ahrefs,
        referringDomainsAhrefs: domainData.referring_domains_ahrefs,
        trafficAhrefs: domainData.traffic_ahrefs,
        linkedRootDomains: domainData.linked_root_domains,
        trafficGsc: domainData.traffic_gsc,
        trafficSemstorm: domainData.traffic_semstorm,
        organicTrafficSemrush: domainData.organic_traffic_semrush,
        ascore: domainData.ascore,
        domainsNum: domainData.domains_num,
        visibilitySenuto: domainData.visibility_senuto,
        elasticScore: domainData.elastic_score,
        resortScore: domainData.resort_score,
        elasticDebug: domainData.elastic_debug,
        avg5daysPublishTimeBadge: domainData.avg_5days_publish_time_badge,
        lowestPrice: domainData.lowest_price
      });

      return {
        success: true,
        data: domain,
        message: 'Domain created successfully'
      };
    } catch (error) {
      console.error('Error creating LinkHouse domain:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create domain'
      };
    }
  }

  /**
   * Bulk create multiple LinkHouse domain records
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
        domain: domainData.domain,
        pageAdress: domainData.page_adress,
        clientId: domainData.client_id,
        lang: domainData.lang,
        country: domainData.country,
        pageCategory: domainData.page_category,
        pageReach: domainData.page_reach,
        pageType: domainData.page_type,
        isVerified: domainData.is_verified,
        pageTags: domainData.page_tags,
        pageDescription: domainData.page_description,
        forbiddenTopics: domainData.forbidden_topics,
        tf: domainData.TF,
        cf: domainData.CF,
        backlinks: domainData.backlinks,
        referringDomains: domainData.referring_domains,
        da: domainData.DA,
        mozSpamScore: domainData.moz_spam_score,
        mozRefDomains: domainData.moz_ref_domains,
        mozBacklinks: domainData.moz_backlinks,
        mozLinkedRootDomains: domainData.moz_linked_root_domains,
        dr: domainData.DR,
        backlinksAhrefs: domainData.backlinks_ahrefs,
        referringDomainsAhrefs: domainData.referring_domains_ahrefs,
        trafficAhrefs: domainData.traffic_ahrefs,
        linkedRootDomains: domainData.linked_root_domains,
        trafficGsc: domainData.traffic_gsc,
        trafficSemstorm: domainData.traffic_semstorm,
        organicTrafficSemrush: domainData.organic_traffic_semrush,
        ascore: domainData.ascore,
        domainsNum: domainData.domains_num,
        visibilitySenuto: domainData.visibility_senuto,
        elasticScore: domainData.elastic_score,
        resortScore: domainData.resort_score,
        elasticDebug: domainData.elastic_debug,
        avg5daysPublishTimeBadge: domainData.avg_5days_publish_time_badge,
        lowestPrice: domainData.lowest_price
      }));

      const result = await this.model.bulkCreate(preparedData, {
        updateOnDuplicate: ['domain', 'pageAdress', 'clientId', 'lang', 'country', 'pageCategory', 
                           'pageReach', 'pageType', 'isVerified', 'pageTags', 'pageDescription', 
                           'forbiddenTopics', 'tf', 'cf', 'backlinks', 'referringDomains', 'da', 
                           'mozSpamScore', 'mozRefDomains', 'mozBacklinks', 'mozLinkedRootDomains', 
                           'dr', 'backlinksAhrefs', 'referringDomainsAhrefs', 'trafficAhrefs', 
                           'linkedRootDomains', 'trafficGsc', 'trafficSemstorm', 'organicTrafficSemrush', 
                           'ascore', 'domainsNum', 'visibilitySenuto', 'elasticScore', 'resortScore', 
                           'elasticDebug', 'avg5daysPublishTimeBadge', 'lowestPrice']
      });

      return {
        success: true,
        data: result,
        count: result.length,
        message: `Successfully created/updated ${result.length} domains`
      };
    } catch (error) {
      console.error('Error bulk creating LinkHouse domains:', error);
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
      await this.linkHouseDomainsModel.sync(options);
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

module.exports = LinkHouseDomainsRepository;
