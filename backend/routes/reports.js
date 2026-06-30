const express = require('express');
const router = express.Router();
const { getExpiredStocks, getUtilizedStocks, getDashboardStats, getMonthlyReport } = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get expired stocks report
router.get('/expired', getExpiredStocks);

// Get utilized stocks report
router.get('/utilized', getUtilizedStocks);

// Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// Get monthly report
router.get('/monthly', getMonthlyReport);

module.exports = router;