'use strict';

const animalService = require('../services/animalService');

class AnimalController {
  /**
   * GET /api/animals
   * Supports filtering by status via query parameter.
   */
  async getAll(req, res, next) {
    try {
      const filters = {};
      if (req.query.status) {
        filters.status = req.query.status;
      }
      const animals = await animalService.findAll(req.user.id, filters);
      res.status(200).json({
        error: false,
        data: animals,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/animals/:id
   */
  async getById(req, res, next) {
    try {
      const animal = await animalService.findById(req.user.id, req.params.id);
      res.status(200).json({
        error: false,
        data: animal,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/animals
   */
  async create(req, res, next) {
    try {
      const animal = await animalService.create(req.user.id, req.body);
      res.status(201).json({
        error: false,
        message: 'Animal registrado exitosamente',
        data: animal,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/animals/:id
   */
  async update(req, res, next) {
    try {
      const animal = await animalService.update(req.user.id, req.params.id, req.body);
      res.status(200).json({
        error: false,
        message: 'Animal actualizado exitosamente',
        data: animal,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/animals/:id
   */
  async delete(req, res, next) {
    try {
      const result = await animalService.delete(req.user.id, req.params.id);
      res.status(200).json({
        error: false,
        ...result,
      });
    } catch (err) {
      console.error(`[ERROR] Delete Animal ID ${req.params.id}:`, err);
      res.status(err.statusCode || 500).json({
        error: true,
        message: err.message || 'Error interno: No se pudo eliminar el animal o desvincular sus historiales.',
        details: err.toString()
      });
    }
  }

  /**
   * GET /api/animals/:id/traceability
   * Returns full traceability: weight history + sanitary records
   */
  async getTraceability(req, res, next) {
    try {
      const data = await animalService.getTraceability(req.user.id, req.params.id);
      res.status(200).json({
        error: false,
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnimalController();
