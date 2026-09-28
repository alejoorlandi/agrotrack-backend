'use strict';

const userService = require('../services/userService');

/**
 * UsersController — Gestión de usuarios del sistema AgroTrack.
 * Todas las rutas están protegidas con authMiddleware + checkPermission('MANAGE_USERS').
 */
class UsersController {
  /**
   * GET /api/users
   * Lista todos los usuarios con sus grupos asignados.
   */
  async getAll(req, res, next) {
    try {
      const users = await userService.findAll();
      res.status(200).json({
        error: false,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/users/:id
   * Retorna un usuario específico con sus grupos y permisos.
   */
  async getById(req, res, next) {
    try {
      const user = await userService.findById(req.params.id);
      res.status(200).json({
        error: false,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/users
   * Crea un nuevo usuario y lo asigna a uno o más grupos.
   *
   * Body esperado:
   * {
   *   "email": "vet@campo.com",
   *   "password": "Secret123",
   *   "role": "operator",          // opcional, default: "operator"
   *   "estado": "ACTIVO",          // opcional, default: "ACTIVO"
   *   "groupIds": ["uuid1", "uuid2"] // opcional
   * }
   */
  async create(req, res, next) {
    try {
      const { email, password, role, estado, groupIds } = req.body;

      // Validación básica de entrada
      if (!email || !password) {
        return res.status(400).json({
          error: true,
          message: 'Los campos email y password son obligatorios',
        });
      }

      const user = await userService.create({ email, password, role, estado, groupIds });
      res.status(201).json({
        error: false,
        message: 'Usuario creado exitosamente',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/users/:id
   * Modifica email, estado y/o reasigna grupos.
   *
   * Body esperado (todos opcionales):
   * {
   *   "email": "nuevo@email.com",
   *   "estado": "INACTIVO",
   *   "groupIds": ["uuid1"]
   * }
   */
  async update(req, res, next) {
    try {
      const { email, estado, groupIds } = req.body;
      const user = await userService.update(req.params.id, { email, estado, groupIds });
      res.status(200).json({
        error: false,
        message: 'Usuario actualizado exitosamente',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/users/:id
   * Elimina físicamente el usuario.
   * Para desactivar sin eliminar, usa PUT con estado='INACTIVO'.
   *
   * ⚠️  Precaución: esta acción es irreversible.
   */
  async delete(req, res, next) {
    try {
      // Prevenir que un admin se elimine a sí mismo
      if (req.params.id === req.user.id) {
        return res.status(400).json({
          error: true,
          message: 'No puedes eliminar tu propio usuario',
        });
      }

      const result = await userService.delete(req.params.id);
      res.status(200).json({
        error: false,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/users/:id/reset-password
   * El administrador define una nueva contraseña temporal para un usuario.
   *
   * Body esperado:
   * {
   *   "newPassword": "TempPass123"
   * }
   */
  async resetPassword(req, res, next) {
    try {
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          error: true,
          message: 'El campo newPassword es obligatorio',
        });
      }

      const result = await userService.resetPassword(req.params.id, newPassword);
      res.status(200).json({
        error: false,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UsersController();
