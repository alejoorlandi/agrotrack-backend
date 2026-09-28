'use strict';

const { Router } = require('express');
const groupsController = require('../controllers/groupsController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');

const router = Router();

/**
 * @route   GET /api/permissions
 * @desc    Lista todos los permisos disponibles del sistema
 *          Usado por el frontend al crear/editar grupos (select de permisos).
 * @access  Protegido | MANAGE_GROUPS
 */
router.get(
  '/',
  authMiddleware,
  checkPermission('MANAGE_GROUPS'),
  groupsController.getAllPermissions
);

module.exports = router;
