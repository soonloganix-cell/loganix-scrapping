const LoganixService = require('../services/loganix');

class LoganixController {
  async getData(req, res) {
    try {
      console.log('📥 Loganix getData request received');
      
      const loganixService = new LoganixService();
      const result = await loganixService.getDataWithDetailsAndStore();
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Loganix data processed successfully',
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
          message: 'Failed to process Loganix data',
          error: result.error
        });
      }
    } catch (error) {
      console.error('❌ Error in Loganix getData:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new LoganixController();

