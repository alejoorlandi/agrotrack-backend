'use strict';

const { Router } = require('express');
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');

const router = Router();

// Todas las rutas de este módulo requieren:
//   1. authMiddleware  → JWT válido + carga req.user con grupos y permisos
//   2. checkPermission → el usuario debe tener el permiso 'MANAGE_USERS'

/**
 * @route   GET /api/users
 * @desc    Lista todos los usuarios con sus grupos
 * @access  Protegido | MANAGE_USERS
 */
router.get(
  '/',
  authMiddleware,
  checkPermission('MANAGE_USERS'),
  usersController.getAll
);

/**
 * @route   GET /api/users/:id
 * @desc    Retorna un usuario con grupos y permisos detallados
 * @access  Protegido | MANAGE_USERS
 */
router.get(
  '/:id',
  authMiddleware,
  checkPermission('MANAGE_USERS'),
  usersController.getById
);

/**
 * @route   POST /api/users
 * @desc    Crea un nuevo usuario y lo asigna a grupos
 * @access  Protegido | MANAGE_USERS
 * @body    { email, password, role?, estado?, groupIds[] }
 */
router.post(
  '/',
  authMiddleware,
  checkPermission('MANAGE_USERS'),
  usersController.create
);

/**
 * @route   PUT /api/users/:id
 * @desc    Modifica email, estado y/o reasigna grupos
 * @access  Protegido | MANAGE_USERS
 * @body    { email?, estado?, groupIds? }
 */
router.put(
  '/:id',
  authMiddleware,
  checkPermission('MANAGE_USERS'),
  usersController.update
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Elimina físicamente el usuario
 * @access  Protegido | MANAGE_USERS
 */
router.delete(
  '/:id',
  authMiddleware,
  checkPermission('MANAGE_USERS'),
  usersController.delete
);

/**
 * @route   POST /api/users/:id/reset-password
 * @desc    El admin define una nueva contraseña para un usuario
 * @access  Protegido | MANAGE_USERS
 * @body    { newPassword }
 */
router.post(
  '/:id/reset-password',
  authMiddleware,
  checkPermission('MANAGE_USERS'),
  usersController.resetPassword
);

module.exports = router;
