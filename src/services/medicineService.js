'use strict';

const { Medicine } = require('../models');

class MedicineService {
  /**
   * Creates a new medicine.
   * @param {Object} data - { name, withdrawal_days, description }
   * @returns {Object} Created medicine
   */
  async create(userId, data) {
    const { name, withdrawal_days, description } = data;

    if (!name || withdrawal_days === undefined) {
      const error = new Error('name y withdrawal_days son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    const medicine = await Medicine.create({ name, withdrawal_days, description, user_id: userId });
    return medicine;
  }

  /**
   * Retrieves all medicines.
   * @returns {Array} List of medicines
   */
  async findAll(userId) {
    const medicines = await Medicine.findAll({ 
      where: { user_id: userId },
      order: [['name', 'ASC']] 
    });
    return medicines;
  }

  /**
   * Retrieves a single medicine by ID.
   * @param {string} id - Medicine UUID
   * @returns {Object} Medicine
   */
  async findById(userId, id) {
    const medicine = await Medicine.findOne({ where: { id, user_id: userId } });
    if (!medicine) {
      const error = new Error('Medicamento no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return medicine;
  }

  /**
   * Updates a medicine.
   * @param {string} id - Medicine UUID
   * @param {Object} data - Fields to update
   * @returns {Object} Updated medicine
   */
  async update(userId, id, data) {
    const medicine = await this.findById(userId, id);
    await medicine.update(data);
    return medicine;
  }

  /**
   * Deletes a medicine.
   * @param {string} id - Medicine UUID
   */
  async delete(userId, id) {
    const { SanitaryRecord } = require('../models');
    const medicine = await this.findById(userId, id);
    
    // Check if in use
    const usages = await SanitaryRecord.count({ where: { medicine_id: id } });
    if (usages > 0) {
      const error = new Error('No se puede eliminar el medicamento porque está siendo usado en historiales sanitarios.');
      error.statusCode = 400;
      throw error;
    }

    await medicine.destroy();
    return { message: 'Medicamento eliminado exitosamente' };
  }
}

module.exports = new MedicineService();
