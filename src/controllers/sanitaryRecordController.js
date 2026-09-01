'use strict';

const sanitaryRecordService = require('../services/sanitaryRecordService');

class SanitaryRecordController {
  /**
   * POST /api/sanitary-records
   * Core endpoint: creates record, calculates release_date, updates animal status.
   */
  async create(req, res, next) {
    try {
      const record = await sanitaryRecordService.create(req.user.id, req.body);
      res.status(201).json({
        error: false,
        message: 'Registro sanitario creado exitosamente',
        data: record,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/sanitary-records
   * Supports filtering by animal_id via query parameter.
   */
  async getAll(req, res, next) {
    try {
      const filters = {};
      if (req.query.animal_id) {
        filters.animal_id = req.query.animal_id;
      }
      const records = await sanitaryRecordService.findAll(req.user.id, filters);
      res.status(200).json({
        error: false,
        data: records,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/sanitary-records/:id
   */
  async getById(req, res, next) {
    try {
      const record = await sanitaryRecordService.findById(req.user.id, req.params.id);
      res.status(200).json({
        error: false,
        data: record,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/sanitary-records/:id
   */
  async delete(req, res, next) {
    try {
      const result = await sanitaryRecordService.delete(req.user.id, req.params.id);
      res.status(200).json({
        error: false,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SanitaryRecordController();
