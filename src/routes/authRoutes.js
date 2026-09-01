'use strict';

const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login and get JWT token
 * @access  Public
 */
router.post('/login', authController.login);

module.exports = router;
