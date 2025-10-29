const { DataTypes } = require('sequelize');

/**
 * Sites Model
 * Represents the sites table structure in PostgreSQL
 */
class Sites {
  constructor(sequelize) {
    this.model = sequelize.define('Sites', {
      site_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'site_id'
      },
      domain: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      is_direct: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_direct'
      },
      pr: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      ai_snippet: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'ai_snippet'
      },
      ai_visibility: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: 'ai_visibility'
      },
      ai_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'ai_notes'
      },
      sensitive_topics_display: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'sensitive_topics_display'
      },
      spoken_language: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'spoken_language'
      },
      marked_as_sponsored: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'marked_as_sponsored'
      },
      cf: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      da: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      dr: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      rd: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      tf: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      backlinks_total: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'backlinks_total'
      },
      traffic_total: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'traffic_total'
      },
      traffic_trend: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: 'traffic_trend'
      },
      ux_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'ux_score'
      },
      link_fraud: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        field: 'link_fraud'
      },
      link_durability: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: 'link_durability'
      },
      loganix_certified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'loganix_certified'
      },
      link_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'link_type'
      },
      starting_at: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'starting_at'
      },
      pricing_source: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'pricing_source'
      },
      tat: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      tld: {
        type: DataTypes.STRING(24),
        allowNull: true
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      tags_display: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'tags_display'
      },
      embedding_details: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'embedding_details'
      },
      meta_embeddings: {
        type: DataTypes.ARRAY(DataTypes.REAL),
        allowNull: true,
        field: 'meta_embeddings'
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
      tableName: 'sites',
      timestamps: true,
      underscored: true, // Use snake_case for field names to match database
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

module.exports = Sites;
