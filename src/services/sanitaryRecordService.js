'use strict';

const { SanitaryRecord, Animal, Medicine } = require('../models');

class SanitaryRecordService {
  /**
   * Creates a new sanitary record.
   * Core business logic:
   * 1. Looks up the medicine's withdrawal_days.
   * 2. Calculates release_date = application_date + withdrawal_days.
   * 3. If release_date > now(), updates the animal's status to 'quarantine'.
   *
   * @param {Object} data - { animal_id, medicine_id, application_date, dose }
   * @returns {Object} Created sanitary record with animal and medicine data
   */
  async create(userId, data) {
    const { animal_id, medicine_id, application_date, dose } = data;

    // Validate required fields
    if (!animal_id || !medicine_id || !application_date || !dose) {
      const error = new Error('animal_id, medicine_id, application_date y dose son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    // Verify animal exists
    const animal = await Animal.findOne({ where: { id: animal_id, user_id: userId } });
    if (!animal) {
      const error = new Error('Animal no encontrado o no autorizado');
      error.statusCode = 404;
      throw error;
    }

    // Verify medicine exists and get withdrawal_days
    const medicine = await Medicine.findOne({ where: { id: medicine_id, user_id: userId } });
    if (!medicine) {
      const error = new Error('Medicamento no encontrado o no autorizado');
      error.statusCode = 404;
      throw error;
    }

    // Calculate release_date = application_date + withdrawal_days
    const appDate = new Date(application_date);
    if (isNaN(appDate.getTime())) {
      const error = new Error('Formato de fecha inválido. Use YYYY-MM-DD');
      error.statusCode = 400;
      throw error;
    }

    const releaseDate = new Date(appDate);
    releaseDate.setDate(releaseDate.getDate() + medicine.withdrawal_days);
    const release_date = releaseDate.toISOString().split('T')[0];

    // Create the sanitary record
    const record = await SanitaryRecord.create({
      animal_id,
      medicine_id,
      application_date,
      release_date,
      dose,
      user_id: userId
    });

    // Auto-update animal status: if release_date > now() → in_treatment (since it's day 0)
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (releaseDate > now) {
      await animal.update({ status: 'in_treatment' });
    }

    // Return record with associated data
    const fullRecord = await SanitaryRecord.findByPk(record.id, {
      include: [
        { model: Animal, as: 'animal' },
        { model: Medicine, as: 'medicine' },
      ],
    });

    return fullRecord;
  }

  /**
   * Retrieves all sanitary records with associated animal and medicine.
   * @param {Object} filters - Optional filters { animal_id }
   * @returns {Array} List of sanitary records
   */
  async findAll(userId, filters = {}) {
    const where = { user_id: userId };

    if (filters.animal_id) {
      where.animal_id = filters.animal_id;
    }

    const records = await SanitaryRecord.findAll({
      where,
      include: [
        { model: Animal, as: 'animal' },
        { model: Medicine, as: 'medicine' },
      ],
      order: [['application_date', 'DESC']],
    });

    return records;
  }

  /**
   * Retrieves a single sanitary record by ID.
   * @param {string} id - SanitaryRecord UUID
   * @returns {Object} Sanitary record
   */
  async findById(userId, id) {
    const record = await SanitaryRecord.findOne({
      where: { id, user_id: userId },
      include: [
        { model: Animal, as: 'animal' },
        { model: Medicine, as: 'medicine' },
      ],
    });

    if (!record) {
      const error = new Error('Registro sanitario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return record;
  }

  /**
   * Deletes a sanitary record.
   * @param {string} id - SanitaryRecord UUID
   */
  async delete(userId, id) {
    const record = await this.findById(userId, id);
    await record.destroy();
    return { message: 'Registro eliminado exitosamente' };
  }
}

module.exports = new SanitaryRecordService();
