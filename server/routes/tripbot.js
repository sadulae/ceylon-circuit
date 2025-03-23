const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  generateTripPlan,
  saveTripPlan,
  getTripPlan,
  updateTripPlan
} = require('../controllers/tripbot');

// @route   POST api/tripbot/generate-plan
// @desc    Generate a trip plan based on preferences
// @access  Private
router.post('/generate-plan', auth, generateTripPlan);

// @route   POST api/tripbot/save-plan
// @desc    Save a generated trip plan
// @access  Private
router.post('/save-plan', auth, saveTripPlan);

// @route   GET api/tripbot/plan/:id
// @desc    Get a specific trip plan
// @access  Private
router.get('/plan/:id', auth, getTripPlan);

// @route   PUT api/tripbot/plan/:id
// @desc    Update a trip plan
// @access  Private
router.put('/plan/:id', auth, updateTripPlan);

module.exports = router;