const { DataTypes } = require('sequelize');

/**
 * LinkHouseDomains Model
 * Represents the linkhouse_domains table structure
 */
class LinkHouseDomains {
  constructor(sequelize) {
    this.model = sequelize.define('LinkHouseDomains', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      domain: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      pageAdress: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'page_adress'
      },
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'client_id'
      },
      lang: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      country: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      pageCategory: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'page_category'
      },
      pageReach: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'page_reach'
      },
      pageType: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'page_type'
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_verified'
      },
      pageTags: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'page_tags'
      },
      pageDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'page_description'
      },
      forbiddenTopics: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'forbidden_topics'
      },
      tf: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'TF'
      },
      cf: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'CF'
      },
      backlinks: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      referringDomains: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'referring_domains'
      },
      da: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'DA'
      },
      mozSpamScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'moz_spam_score'
      },
      mozRefDomains: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'moz_ref_domains'
      },
      mozBacklinks: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'moz_backlinks'
      },
      mozLinkedRootDomains: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'moz_linked_root_domains'
      },
      dr: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'DR'
      },
      backlinksAhrefs: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'backlinks_ahrefs'
      },
      referringDomainsAhrefs: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'referring_domains_ahrefs'
      },
      trafficAhrefs: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'traffic_ahrefs'
      },
      linkedRootDomains: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'linked_root_domains'
      },
      trafficGsc: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'traffic_gsc'
      },
      trafficSemstorm: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'traffic_semstorm'
      },
      organicTrafficSemrush: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'organic_traffic_semrush'
      },
      ascore: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      domainsNum: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'domains_num'
      },
      visibilitySenuto: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'visibility_senuto'
      },
      elasticScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'elastic_score'
      },
      resortScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'resort_score'
      },
      elasticDebug: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'elastic_debug'
      },
      avg5daysPublishTimeBadge: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'avg_5days_publish_time_badge'
      },
      lowestPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'lowest_price'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'updated_at'
      }
    }, {
      tableName: 'linkhouse_domains',
      timestamps: true,
      underscored: false // Use camelCase for field names
    });
  }

  /**
   * Get the Sequelize model instance
   * @returns {Object} Sequelize model
   */
  getModel() {
    return this.model;
  }

  /**
   * Sync the model with the database
   * @param {Object} options - Sync options
   */
  async sync(options = {}) {
    return await this.model.sync(options);
  }
}

module.exports = LinkHouseDomains;
