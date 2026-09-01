'use strict';

const { Animal } = require('../models');

class AnimalService {
  /**
   * Creates a new animal.
   * Also inserts the initial weight into WeightHistory.
   * @param {Object} data - { tag_id, category, weight, status }
   * @returns {Object} Created animal
   */
  async create(userId, data) {
    const { WeightHistory } = require('../models');
    const { tag_id, category, weight, status } = data;

    if (!tag_id || !category || weight === undefined) {
      const error = new Error('tag_id, category y weight son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    const animal = await Animal.create({ tag_id, category, weight, status, user_id: userId });

    // Insert the initial weight as the first history record
    await WeightHistory.create({
      animal_id: animal.id,
      user_id: userId,
      weight: parseFloat(weight),
      recorded_at: new Date(),
    });

    return animal;
  }

  /**
   * Retrieves all animals with optional status filter.
   * @param {Object} filters - { status }
   * @returns {Array} List of animals
   */
  async findAll(userId, filters = {}) {
    const { SanitaryRecord } = require('../models');
    
    // Valid statuses
    const validStatuses = ['healthy', 'in_treatment', 'quarantine'];
    if (filters.status && !validStatuses.includes(filters.status)) {
      const error = new Error(`Estado inválido. Valores permitidos: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    // Fetch all animals with their latest sanitary records to dynamically compute true status
    let animals = await Animal.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      include: [
        { 
          model: SanitaryRecord, 
          as: 'sanitaryRecords'
        }
      ]
    });

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const processedAnimals = [];

    for (const animal of animals) {
      const plainAnimal = animal.get({ plain: true });
      let computedStatus = animal.status;
      let isInTreatment = false;
      let isInQuarantine = false;

      const records = plainAnimal.sanitaryRecords || [];

      if (records.length > 0) {
        for (const record of records) {
          const recordDate = new Date(record.created_at);
          const releaseDate = record.release_date ? new Date(record.release_date + 'T23:59:59') : now; 
          
          if (recordDate > twentyFourHoursAgo) {
            isInTreatment = true;
          }
          if (now < releaseDate) {
            isInQuarantine = true;
          }
        }

        if (isInQuarantine) {
          computedStatus = 'quarantine';
        } else if (isInTreatment) {
          computedStatus = 'in_treatment';
        } else {
          computedStatus = 'healthy';
        }

        // Lazy db update if status drifted
        if (computedStatus !== animal.status) {
          animal.update({ status: computedStatus }).catch(err => console.error("Lazy update failed:", err));
        }
      } else {
        computedStatus = animal.status;
      }

      plainAnimal.is_in_treatment = isInTreatment;
      plainAnimal.is_in_quarantine = isInQuarantine;
      plainAnimal.status = computedStatus;
      processedAnimals.push(plainAnimal);
    }

    // Now apply js-side filter
    if (filters.status) {
      return processedAnimals.filter(a => a.status === filters.status);
    }

    return processedAnimals;
  }

  /**
   * Retrieves a single animal by ID.
   * @param {string} id - Animal UUID
   * @returns {Object} Animal
   */
  async findById(userId, id) {
    const { SanitaryRecord } = require('../models');
    const animal = await Animal.findOne({
      where: { id, user_id: userId },
      include: [{ model: SanitaryRecord, as: 'sanitaryRecords' }]
    });

    if (!animal) {
      const error = new Error('Animal no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const plainAnimal = animal.get({ plain: true });
    let computedStatus = animal.status;
    let isInTreatment = false;
    let isInQuarantine = false;

    const records = plainAnimal.sanitaryRecords || [];

    if (records.length > 0) {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      for (const record of records) {
        const recordDate = new Date(record.created_at);
        const releaseDate = record.release_date ? new Date(record.release_date + 'T23:59:59') : now; 
        
        if (recordDate > twentyFourHoursAgo) {
          isInTreatment = true;
        }
        if (now < releaseDate) {
          isInQuarantine = true;
        }
      }

      if (isInQuarantine) {
        computedStatus = 'quarantine';
      } else if (isInTreatment) {
        computedStatus = 'in_treatment';
      } else {
        computedStatus = 'healthy';
      }

      if (computedStatus !== animal.status) {
        animal.update({ status: computedStatus }).catch(() => {});
      }
    } else {
      computedStatus = animal.status;
    }

    plainAnimal.is_in_treatment = isInTreatment;
    plainAnimal.is_in_quarantine = isInQuarantine;
    plainAnimal.status = computedStatus;
    return plainAnimal;
  }

  /**
   * Updates an animal.
   * If weight changed, inserts a new WeightHistory record.
   * @param {string} id - Animal UUID
   * @param {Object} data - Fields to update
   * @returns {Object} Updated animal
   */
  async update(userId, id, data) {
    const { WeightHistory } = require('../models');
    const animal = await Animal.findOne({ where: { id, user_id: userId } });
    if (!animal) {
      const error = new Error('Animal no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // If weight is being updated and it's different, record it in history
    if (data.weight !== undefined && parseFloat(data.weight) !== animal.weight) {
      await WeightHistory.create({
        animal_id: animal.id,
        user_id: userId,
        weight: parseFloat(data.weight),
        recorded_at: new Date(),
      });
    }

    await animal.update(data);
    return this.findById(userId, id);
  }

  /**
   * Deletes an animal and all associated records.
   * @param {string} id - Animal UUID
   */
  async delete(userId, id) {
    const { SanitaryRecord, WeightHistory } = require('../models');
    const animal = await Animal.findOne({ where: { id, user_id: userId } });
    if (!animal) {
      const error = new Error('Animal no encontrado');
      error.statusCode = 404;
      throw error;
    }
    
    // Eliminación en cascada: Eliminar todos los registros vinculados a este animal
    await SanitaryRecord.destroy({ where: { animal_id: id } });
    await WeightHistory.destroy({ where: { animal_id: id } });

    await animal.destroy();
    return { message: 'Animal eliminado exitosamente' };
  }

  /**
   * Returns full traceability data for an animal:
   * - Animal details
   * - Weight history (ordered by date ASC)
   * - Sanitary records with medicine details (ordered by date ASC)
   * @param {string} userId - User UUID
   * @param {string} animalId - Animal UUID
   * @returns {Object} { animal, weightHistory, sanitaryRecords }
   */
  async getTraceability(userId, animalId) {
    const { SanitaryRecord, Medicine, WeightHistory } = require('../models');

    const animal = await Animal.findOne({
      where: { id: animalId, user_id: userId },
    });

    if (!animal) {
      const error = new Error('Animal no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const weightHistory = await WeightHistory.findAll({
      where: { animal_id: animalId },
      order: [['recorded_at', 'ASC']],
    });

    const sanitaryRecords = await SanitaryRecord.findAll({
      where: { animal_id: animalId },
      include: [{ model: Medicine, as: 'medicine' }],
      order: [['application_date', 'ASC']],
    });

    return {
      animal: animal.get({ plain: true }),
      weightHistory: weightHistory.map(w => w.get({ plain: true })),
      sanitaryRecords: sanitaryRecords.map(r => r.get({ plain: true })),
    };
  }
}

module.exports = new AnimalService();
