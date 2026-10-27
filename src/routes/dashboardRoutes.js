'use strict';

const { Router } = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

// All dashboard routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get animals grouped by category (for Pie Chart)
 * @access  Authenticated
 */
router.get('/stats', dashboardController.getStats);

/**
 * @route   GET /api/dashboard/alerts
 * @desc    Get animals exiting quarantine within 48 hours
 * @access  Authenticated
 */
router.get('/alerts', dashboardController.getAlerts);

module.exports = router;
