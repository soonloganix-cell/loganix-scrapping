const { DataTypes } = require('sequelize');

/**
 * FatgridDomains Model
 * Represents the fatgrid_domains table structure
 */
class FatgridDomains {
  constructor(sequelize) {
    this.model = sequelize.define('FatgridDomains', {
      id: {
        type: DataTypes.STRING(24),
        primaryKey: true,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      bestPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'bestPrice'
      },
      class: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      resources: {
        type: DataTypes.JSON,
        allowNull: true
      },
      dr: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      linkFollow: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'linkFollow'
      },
      authorityScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'authorityScore'
      },
      organicTraffic: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'organicTraffic'
      },
      backlinks: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      refDomains: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'refDomains'
      },
      db: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      categories: {
        type: DataTypes.JSON,
        allowNull: true
      },
      totalTraffic: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'totalTraffic'
      },
      traffic: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      totalOrganicTraffic: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'totalOrganicTraffic'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'createdAt'
      },
      bestNichePrices: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'bestNichePrices'
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isFavorite: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'isFavorite'
      }
    }, {
      tableName: 'fatgrid_domains',
      timestamps: false, // We're using createdAt from the API
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

module.exports = FatgridDomains;
