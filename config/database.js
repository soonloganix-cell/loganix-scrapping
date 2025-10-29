const { Sequelize } = require('sequelize');

// MySQL Database configuration (existing)
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'fatgrid_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// PostgreSQL Database configuration (new)
const postgresConfig = {
  host: process.env.DB_HOST_POSTGRES || 'localhost',
  port: process.env.DB_PORT_POSTGRES || 5432,
  database: process.env.DB_NAME_POSTGRES || 'loganix_db',
  username: process.env.DB_USER_POSTGRES || 'postgres',
  password: process.env.DB_PASSWORD_POSTGRES || '',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Create MySQL Sequelize instance (existing)
const sequelize = new Sequelize(
  mysqlConfig.database,
  mysqlConfig.username,
  mysqlConfig.password,
  {
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    dialect: mysqlConfig.dialect,
    logging: mysqlConfig.logging,
    pool: mysqlConfig.pool
  }
);

// Create PostgreSQL Sequelize instance (new)
const sequelizePostgres = new Sequelize(
  postgresConfig.database,
  postgresConfig.username,
  postgresConfig.password,
  {
    host: postgresConfig.host,
    port: postgresConfig.port,
    dialect: postgresConfig.dialect,
    logging: postgresConfig.logging,
    pool: postgresConfig.pool
  }
);

// Test MySQL database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the MySQL database:', error);
  }
};

// Test PostgreSQL database connection
const testPostgresConnection = async () => {
  try {
    await sequelizePostgres.authenticate();
    console.log('✅ PostgreSQL Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the PostgreSQL database:', error);
  }
};

module.exports = {
  sequelize,
  sequelizePostgres,
  testConnection,
  testPostgresConnection,
  mysqlConfig,
  postgresConfig
};
