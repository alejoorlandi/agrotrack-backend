'use strict';

const { Router } = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registra un nuevo usuario
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Inicia sesión y retorna un JWT
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/change-password
 * @desc    El usuario autenticado cambia su contraseña actual
 * @access  Protegido (requiere JWT válido)
 * @body    { currentPassword, newPassword }
 */
router.post('/change-password', authMiddleware, authController.changePassword);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicita blanqueo de contraseña (devuelve clave temporal en DEV)
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;

