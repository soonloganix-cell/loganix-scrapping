// API Scraping Server Configuration
module.exports = {
  // FatGrid API Configuration
  fatgrid: {
    baseUrl: 'https://api.fatgrid.com',
    sessionToken: 'your_fatgrid_session_token_here'
  },
  
  // Database Configuration
  database: {
    host: 'localhost',
    port: 3306,
    name: 'fatgrid_db',
    username: 'root',
    password: '',
    dialect: 'mysql'
  },
  
  // Server Configuration
  server: {
    port: 3000,
    environment: 'development'
  },
  
  // CORS Configuration
  cors: {
    origin: '*'
  }
};
