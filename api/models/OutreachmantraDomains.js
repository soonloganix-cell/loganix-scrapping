const { DataTypes } = require('sequelize');

/**
 * OutreachmantraDomains Model
 * Represents the outreachmantra_domains table structure
 */
class OutreachmantraDomains {
  constructor(sequelize) {
    this.model = sequelize.define('OutreachmantraDomains', {
      id: {
        type: DataTypes.STRING(24),
        primaryKey: true,
        allowNull: false
      },
      websiteUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'websiteUrl'
      },
      categories: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      tatInDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'tatInDays'
      },
      monthlyTraffic: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'monthlyTraffic'
      },
      samplePostUrl: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        field: 'samplePostUrl'
      },
      guidelines: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      domainVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'domainVerified'
      },
      gaValidated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'gaValidated'
      },
      successfulOrders: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'successfulOrders'
      },
      userKartPostTypeList: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'userKartPostTypeList'
      },
      wishlistPostTypeList: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'wishlistPostTypeList'
      },
      da: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      DR: {
        type: DataTypes.INTEGER,
        allowNull: true
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
      tableName: 'outreachmantra_domains',
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

module.exports = OutreachmantraDomains;
