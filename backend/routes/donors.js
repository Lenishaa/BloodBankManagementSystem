const express = require('express');
const router = express.Router();
const { getAllDonors, getDonorById, addDonor, updateDonor, deleteDonor, getDonorStats, getDonorsByBloodType } = require('../controllers/donorController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all donors with filters
router.get('/', getAllDonors);

// Get donor statistics
router.get('/stats', getDonorStats);

// Get donors by blood type
router.get('/blood-type/:bloodType', getDonorsByBloodType);

// Get donor by ID
router.get('/:id', getDonorById);

// Add new donor
router.post('/', addDonor);

// Update donor
router.put('/:id', updateDonor);

// Delete donor
router.delete('/:id', deleteDonor);

module.exports = router;