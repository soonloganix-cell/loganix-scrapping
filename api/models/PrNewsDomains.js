const { DataTypes } = require('sequelize');

class PrNewsDomains {
  constructor(sequelize) {
    this.model = sequelize.define('PrNewsDomains', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      price: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      audience: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      class: {
        type: DataTypes.STRING(100),
        allowNull: true
      }
    }, {
      tableName: 'prnews_domains',
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

module.exports = PrNewsDomains;


