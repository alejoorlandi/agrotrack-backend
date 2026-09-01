'use strict';

const { Op } = require('sequelize');
const { SanitaryRecord, Animal, Medicine } = require('../models');

class DashboardService {
  /**
   * Returns animals exiting quarantine (withdrawal period) in the next 48 hours.
   * Finds sanitary records where release_date is between now and now + 48h.
   *
   * @returns {Array} List of animals with their expiring sanitary records
   */
  async getAlerts() {
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Format dates as YYYY-MM-DD for DATEONLY comparison
    const todayStr = now.toISOString().split('T')[0];
    const futureStr = in48Hours.toISOString().split('T')[0];

    const expiringRecords = await SanitaryRecord.findAll({
      where: {
        release_date: {
          [Op.between]: [todayStr, futureStr],
        },
      },
      include: [
        { model: Animal, as: 'animal' },
        { model: Medicine, as: 'medicine' },
      ],
      order: [['release_date', 'ASC']],
    });

    return {
      total: expiringRecords.length,
      message: `${expiringRecords.length} animal(es) salen de carencia en las próximas 48 horas`,
      alerts: expiringRecords,
    };
  }
}

module.exports = new DashboardService();
