'use strict';

const { Router } = require('express');
const medicineController = require('../controllers/medicineController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleCheck = require('../middlewares/roleCheck');

const router = Router();

// All medicine routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/medicines
 * @desc    Get all medicines
 * @access  Authenticated
 */
router.get('/', medicineController.getAll);

/**
 * @route   GET /api/medicines/:id
 * @desc    Get medicine by ID
 * @access  Authenticated
 */
router.get('/:id', medicineController.getById);

/**
 * @route   POST /api/medicines
 * @desc    Create a new medicine
 * @access  Authenticated
 */
router.post('/', medicineController.create);

/**
 * @route   PUT /api/medicines/:id
 * @desc    Update a medicine
 * @access  Authenticated
 */
router.put('/:id', medicineController.update);

/**
 * @route   DELETE /api/medicines/:id
 * @desc    Delete a medicine
 * @access  Authenticated
 */
router.delete('/:id', medicineController.delete);

module.exports = router;
