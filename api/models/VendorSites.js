const { DataTypes } = require('sequelize');

/**
 * VendorSites Model
 * Represents the vendor_sites table structure in PostgreSQL
 */
class VendorSites {
  constructor(sequelize) {
    this.model = sequelize.define('VendorSites', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      vendor: {
        type: DataTypes.STRING(15),
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('list', 'single'),
        allowNull: false
      },
      source_table: {
        type: DataTypes.ENUM('sites', 'publisher_sites'),
        allowNull: false,
        field: 'source_table'
      },
      cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      tat: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 7
      },
      link_type: {
        type: DataTypes.ENUM('dofollow', 'nofollow', 'sponsored'),
        allowNull: false,
        defaultValue: 'dofollow',
        field: 'link_type'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_minimum_cost: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_minimum_cost'
      },
      site_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'site_id'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at'
      }
    }, {
      tableName: 'vendor_sites',
      timestamps: false, // Disable automatic timestamps since table doesn't have updated_at
      underscored: true
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

module.exports = VendorSites;
