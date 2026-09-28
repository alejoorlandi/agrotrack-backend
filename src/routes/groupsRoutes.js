'use strict';

const { Router } = require('express');
const groupsController = require('../controllers/groupsController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');

const router = Router();

// ── RUTAS DE GRUPOS ─────────────────────────────────────────────────────────

/**
 * Middleware: permite acceso si el usuario tiene AL MENOS UNO de los permisos.
 * Usado para rutas que son necesarias en múltiples contextos de administración.
 */
const checkAnyPermission = (...perms) => (req, res, next) => {
  if (!req.user || !Array.isArray(req.user.permissions)) {
    return res.status(401).json({ error: true, message: 'Autenticación requerida' });
  }
  const hasAny = perms.some((p) => req.user.permissions.includes(p));
  if (hasAny) return next();
  return res.status(403).json({ error: 'Acceso denegado: permiso insuficiente' });
};

/**
 * @route   GET /api/groups
 * @desc    Lista todos los grupos con sus permisos.
 *          También accesible por MANAGE_USERS (para asignar grupos a usuarios).
 * @access  Protegido | MANAGE_GROUPS | MANAGE_USERS
 */
router.get(
  '/',
  authMiddleware,
  checkAnyPermission('MANAGE_GROUPS', 'MANAGE_USERS'),
  groupsController.getAll
);

/**
 * @route   GET /api/groups/:id
 * @desc    Retorna un grupo específico con permisos y usuarios
 * @access  Protegido | MANAGE_GROUPS
 */
router.get(
  '/:id',
  authMiddleware,
  checkPermission('MANAGE_GROUPS'),
  groupsController.getById
);

/**
 * @route   POST /api/groups
 * @desc    Crea un nuevo grupo con permisos asignados
 * @access  Protegido | MANAGE_GROUPS
 * @body    { nombre, descripcion?, permissionIds[] }
 */
router.post(
  '/',
  authMiddleware,
  checkPermission('MANAGE_GROUPS'),
  groupsController.create
);

/**
 * @route   PUT /api/groups/:id
 * @desc    Modifica nombre, descripción y permisos del grupo
 * @access  Protegido | MANAGE_GROUPS
 * @body    { nombre?, descripcion?, permissionIds? }
 */
router.put(
  '/:id',
  authMiddleware,
  checkPermission('MANAGE_GROUPS'),
  groupsController.update
);

/**
 * @route   DELETE /api/groups/:id
 * @desc    Elimina el grupo (solo si no tiene usuarios activos)
 * @access  Protegido | MANAGE_GROUPS
 */
router.delete(
  '/:id',
  authMiddleware,
  checkPermission('MANAGE_GROUPS'),
  groupsController.delete
);

module.exports = router;
