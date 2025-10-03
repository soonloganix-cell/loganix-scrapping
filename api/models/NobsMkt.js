const { DataTypes } = require('sequelize');

class NobsMkt {
  constructor(sequelize) {
    this.sequelize = sequelize;
    this.model = null;
  }

  defineModel() {
    this.model = this.sequelize.define('nobsmkt_domains', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      partner_code: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      domain: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      company_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      first_name: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      languages: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      payment_type: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },
      payment_description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      payment_type_confirm: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },
      partner_type: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      google_drive_link: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      hosting_location: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      niche_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      secondly_niche_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      content_length: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      stock_images: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      turn_around_time: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      tags: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: true
      }
    }, {
      tableName: 'nobsmkt_domains',
      timestamps: false
    });

    return this.model;
  }

  getModel() {
    if (!this.model) {
      this.defineModel();
    }
    return this.model;
  }

  async sync(options = {}) {
    const model = this.getModel();
    return await model.sync(options);
  }
}

module.exports = NobsMkt;

