'use strict';

const dashboardService = require('../services/dashboardService');

class DashboardController {
  /**
   * GET /api/dashboard/alerts
   * Returns animals exiting quarantine within the next 48 hours.
   */
  async getAlerts(req, res, next) {
    try {
      const alerts = await dashboardService.getAlerts();
      res.status(200).json({
        error: false,
        data: alerts,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
