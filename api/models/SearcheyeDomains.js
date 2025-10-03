const { DataTypes } = require('sequelize');

class SearcheyeDomains {
  constructor(sequelize) {
    this.sequelize = sequelize;
    this.model = sequelize.define('searcheye_domains', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      relevance_score: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      domain_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      domain_rating: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      favicon: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      organic_traffic: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      minimum_turnaround_time: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      trending_state: {
        type: DataTypes.TINYINT(1),
        allowNull: true
      },
      is_verified: {
        type: DataTypes.TINYINT(1),
        allowNull: true
      },
      purchased: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      business_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      website_feedbacks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      impressions: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      socials: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'searcheye_domains',
      timestamps: false
    });
  }

  getModel() {
    return this.model;
  }

  async sync(options = {}) {
    return await this.model.sync(options);
  }
}

module.exports = SearcheyeDomains;
