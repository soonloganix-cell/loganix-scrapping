const { DataTypes } = require('sequelize');

/**
 * MeUpDomains Model
 * Represents the meup_domains table structure
 */
class MeUpDomains {
  constructor(sequelize) {
    this.model = sequelize.define('MeUpDomains', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(1000),
        allowNull: false
      },
      price: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      originalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'originalPrice'
      },
      backlinkType: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'backlinkType'
      },
      sample: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },
      minimumWordCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'minimumWordCount'
      },
      contentAdvertiser: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        field: 'contentAdvertiser'
      },
      contentPublisher: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        field: 'contentPublisher'
      },
      contentPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        field: 'contentPrice'
      },
      purchasesCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'purchasesCount'
      },
      hotSelling: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        field: 'hotSelling'
      },
      visibility: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isTrustedPublisher: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'isTrustedPublisher'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'createdAt'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'updatedAt'
      }
    }, {
      tableName: 'meup_domains',
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

module.exports = MeUpDomains;
