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

  /**
   * POST /api/auth/change-password
   * El usuario autenticado cambia su propia contraseña.
   * Requiere el JWT en el header (authMiddleware debe correr antes).
   *
   * Body esperado:
   * {
   *   "currentPassword": "OldPass123",
   *   "newPassword": "NewPass456"
   * }
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: true,
          message: 'Los campos currentPassword y newPassword son obligatorios',
        });
      }

      const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
      res.status(200).json({
        error: false,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Solicita blanqueo de contraseña (ruta pública).
   * En producción enviaría un email; en desarrollo devuelve la clave temporal.
   *
   * Body esperado:
   * {
   *   "email": "usuario@campo.com"
   * }
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: true,
          message: 'El campo email es obligatorio',
        });
      }

      const result = await authService.forgotPassword(email);
      res.status(200).json({
        error: false,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();

