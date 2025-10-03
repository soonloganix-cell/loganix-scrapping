const NobsMktService = require('../services/nobsmkt');

class NobsMktController {
  async getData(req, res) {
    try {
      console.log('📥 NobsMkt getData request received');
      
      const nobsMktService = new NobsMktService();
      const result = await nobsMktService.getDataWithDetailsAndStore();
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'NobsMkt data processed successfully',
          data: {
            totalRecords: result.totalRecords,
            totalProcessed: result.totalProcessed,
            totalErrors: result.totalErrors,
            initialCount: result.initialCount,
            finalCount: result.finalCount,
            actualInserted: result.actualInserted
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to process NobsMkt data',
          error: result.error
        });
      }
    } catch (error) {
      console.error('❌ Error in NobsMkt getData:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new NobsMktController();

