'use strict';

const authService = require('../services/authService');

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        error: false,
        message: 'Usuario registrado exitosamente',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        error: false,
        message: 'Inicio de sesión exitoso',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
