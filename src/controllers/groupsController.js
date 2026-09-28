'use strict';

const groupService = require('../services/groupService');
const { Permission } = require('../models');

/**
 * GroupsController — Gestión de grupos y permisos del sistema AgroTrack.
 * Rutas de grupos protegidas con authMiddleware + checkPermission('MANAGE_GROUPS').
 */
class GroupsController {
  /**
   * GET /api/groups
   * Lista todos los grupos con sus permisos asociados.
   */
  async getAll(req, res, next) {
    try {
      const groups = await groupService.findAll();
      res.status(200).json({
        error: false,
        data: groups,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/groups/:id
   * Retorna un grupo específico con permisos y usuarios.
   */
  async getById(req, res, next) {
    try {
      const group = await groupService.findById(req.params.id);
      res.status(200).json({
        error: false,
        data: group,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/groups
   * Crea un nuevo grupo y asigna permisos.
   *
   * Body esperado:
   * {
   *   "nombre": "Veterinario",
   *   "descripcion": "Gestión sanitaria de animales",
   *   "permissionIds": ["uuid-perm-1", "uuid-perm-2"]
   * }
   */
  async create(req, res, next) {
    try {
      const { nombre, descripcion, permissionIds } = req.body;

      if (!nombre) {
        return res.status(400).json({
          error: true,
          message: 'El campo nombre es obligatorio',
        });
      }

      const group = await groupService.create({ nombre, descripcion, permissionIds });
      res.status(201).json({
        error: false,
        message: 'Grupo creado exitosamente',
        data: group,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/groups/:id
   * Modifica nombre, descripción y la lista de permisos asignados.
   *
   * Body esperado (todos opcionales):
   * {
   *   "nombre": "Veterinario Senior",
   *   "descripcion": "Nueva descripción",
   *   "permissionIds": ["uuid-perm-1"]
   * }
   */
  async update(req, res, next) {
    try {
      const { nombre, descripcion, permissionIds } = req.body;
      const group = await groupService.update(req.params.id, { nombre, descripcion, permissionIds });
      res.status(200).json({
        error: false,
        message: 'Grupo actualizado exitosamente',
        data: group,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/groups/:id
   * Elimina el grupo si no tiene usuarios activos asociados.
   */
  async delete(req, res, next) {
    try {
      const result = await groupService.delete(req.params.id);
      res.status(200).json({
        error: false,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/permissions
   * Lista todos los permisos disponibles en el sistema.
   * Útil para el frontend al crear/editar grupos (dropdown de permisos).
   * Protegido con MANAGE_GROUPS ya que solo admins deben ver permisos.
   */
  async getAllPermissions(req, res, next) {
    try {
      const permissions = await Permission.findAll({
        attributes: ['id', 'codigo', 'descripcion'],
        order: [['codigo', 'ASC']],
      });
      res.status(200).json({
        error: false,
        data: permissions,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GroupsController();
