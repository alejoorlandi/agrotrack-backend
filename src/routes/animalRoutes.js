'use strict';

const { Router } = require('express');
const animalController = require('../controllers/animalController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleCheck = require('../middlewares/roleCheck');

const router = Router();

// All animal routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/animals
 * @desc    Get all animals (supports ?status= filter)
 * @access  Authenticated
 */
router.get('/', animalController.getAll);

/**
 * @route   GET /api/animals/:id/traceability
 * @desc    Get full traceability for an animal (weight history + sanitary records)
 * @access  Authenticated
 */
router.get('/:id/traceability', animalController.getTraceability);

/**
 * @route   GET /api/animals/:id
 * @desc    Get animal by ID
 * @access  Authenticated
 */
router.get('/:id', animalController.getById);

/**
 * @route   POST /api/animals
 * @desc    Create a new animal
 * @access  Authenticated
 */
router.post('/', animalController.create);

/**
 * @route   PUT /api/animals/:id
 * @desc    Update an animal
 * @access  Authenticated
 */
router.put('/:id', animalController.update);

/**
 * @route   DELETE /api/animals/:id
 * @desc    Delete an animal
 * @access  Authenticated
 */
router.delete('/:id', animalController.delete);

module.exports = router;
