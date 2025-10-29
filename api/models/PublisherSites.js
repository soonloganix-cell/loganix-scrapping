const { DataTypes } = require('sequelize');

/**
 * PublisherSites Model
 * Represents the publisher_sites table structure in PostgreSQL
 */
class PublisherSites {
  constructor(sequelize) {
    this.model = sequelize.define('PublisherSites', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      site_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'site_id'
      },
      website: {
        type: DataTypes.CITEXT,
        allowNull: false
      },
      tat: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      link_type: {
        type: DataTypes.ENUM('dofollow', 'nofollow', 'sponsored'),
        allowNull: false,
        field: 'link_type'
      },
      guidelines_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'guidelines_url'
      },
      publisher: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      price_general: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'price_general'
      },
      price_adult: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'price_adult'
      },
      price_gambling: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'price_gambling'
      },
      price_crypto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'price_crypto'
      },
      price_payday: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'price_payday'
      },
      price_general_edits: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'price_general_edits'
      },
      price_adult_edits: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'price_adult_edits'
      },
      price_gambling_edits: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'price_gambling_edits'
      },
      price_crypto_edits: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'price_crypto_edits'
      },
      price_payday_edits: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'price_payday_edits'
      },
      youtube_embed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'youtube_embed'
      },
      indexed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },
      do_we_post: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'do_we_post'
      },
      low_metrics_client_ok: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'low_metrics_client_ok'
      },
      preapprove_topic: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'preapprove_topic'
      },
      author_bio: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'author_bio'
      },
      add_links_to_content: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'add_links_to_content'
      },
      anchor_limit: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'anchor_limit'
      },
      permanent_link: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
        field: 'permanent_link'
      },
      renewable: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      word_count_minimum: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'word_count_minimum'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at'
      }
    }, {
      tableName: 'publisher_sites',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
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

module.exports = PublisherSites;
