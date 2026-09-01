'use strict';

const medicineService = require('../services/medicineService');

class MedicineController {
  /**
   * GET /api/medicines
   */
  async getAll(req, res, next) {
    try {
      const medicines = await medicineService.findAll(req.user.id);
      res.status(200).json({
        error: false,
        data: medicines,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/medicines/:id
   */
  async getById(req, res, next) {
    try {
      const medicine = await medicineService.findById(req.user.id, req.params.id);
      res.status(200).json({
        error: false,
        data: medicine,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/medicines
   */
  async create(req, res, next) {
    try {
      const medicine = await medicineService.create(req.user.id, req.body);
      res.status(201).json({
        error: false,
        message: 'Medicamento creado exitosamente',
        data: medicine,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/medicines/:id
   */
  async update(req, res, next) {
    try {
      const medicine = await medicineService.update(req.user.id, req.params.id, req.body);
      res.status(200).json({
        error: false,
        message: 'Medicamento actualizado exitosamente',
        data: medicine,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/medicines/:id
   */
  async delete(req, res, next) {
    try {
      const result = await medicineService.delete(req.user.id, req.params.id);
      res.status(200).json({
        error: false,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MedicineController();
