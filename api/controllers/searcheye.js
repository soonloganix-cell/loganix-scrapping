const SearcheyeService = require('../services/searcheye');

class SearcheyeController {
  constructor() {
    this.searcheyeService = new SearcheyeService();
  }

  async getData(req, res) {
    try {
      console.log('Received request for SearcheyeDomains data processing.');
      const result = await this.searcheyeService.getDataWithDetailsAndStore();
      res.json({
        success: true,
        message: 'SearcheyeDomains data processing initiated successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ SearcheyeDomains controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new SearcheyeController();
