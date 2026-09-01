'use strict';

const { Router } = require('express');
const sanitaryRecordController = require('../controllers/sanitaryRecordController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

// All sanitary record routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/sanitary-records
 * @desc    Create a new sanitary record (core endpoint)
 * @access  Authenticated
 */
router.post('/', sanitaryRecordController.create);

/**
 * @route   GET /api/sanitary-records
 * @desc    Get all sanitary records (supports ?animal_id= filter)
 * @access  Authenticated
 */
router.get('/', sanitaryRecordController.getAll);

/**
 * @route   GET /api/sanitary-records/:id
 * @desc    Get sanitary record by ID
 * @access  Authenticated
 */
router.get('/:id', sanitaryRecordController.getById);

/**
 * @route   DELETE /api/sanitary-records/:id
 * @desc    Delete sanitary record by ID
 * @access  Authenticated
 */
router.delete('/:id', sanitaryRecordController.delete);

module.exports = router;
