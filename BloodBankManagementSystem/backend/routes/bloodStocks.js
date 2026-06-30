const express = require('express');
const router = express.Router();
const { getAllStocks, getStockById, addStock, updateStock, deleteStock, getStockSummary, markAsExpired, markAsUtilized, autoExpireStocks } = require('../controllers/bloodStockController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all stocks with filters
router.get('/', getAllStocks);

// Get stock summary
router.get('/summary', getStockSummary);

// Get stock by ID
router.get('/:id', getStockById);

// Add new stock
router.post('/', addStock);

// Update stock
router.put('/:id', updateStock);

// Delete stock
router.delete('/:id', deleteStock);

// Mark as expired
router.patch('/:id/expire', markAsExpired);

// Mark as utilized
router.patch('/:id/utilize', markAsUtilized);

// Auto-expire stocks
router.patch('/auto-expire', autoExpireStocks);

module.exports = router;
