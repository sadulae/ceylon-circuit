const express = require('express');
const router = express.Router();
const {
  getAllDestinations,
  getDestination,
  createDestination,
  updateDestination,
  toggleDestinationStatus,
  getNearbyDestinations
} = require('../controllers/destinations');

// Public routes (no authentication)
router.get('/', getAllDestinations); // GET /api/destinations
router.get('/:id', getDestination); // GET /api/destinations/:id

// Admin routes (add your own auth logic in controller if needed)
router.post('/', createDestination); // POST /api/destinations
router.put('/:id', updateDestination); // PUT /api/destinations/:id
router.patch('/:id/status', toggleDestinationStatus); // PATCH /api/destinations/:id/status

module.exports = router;