import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import {
  generateTripPlan,
  saveTripPlan,
  getTripPlan,
  updateTripPlan,
  chatHandler,
  getRecommendations,
  generatePlanPDF,
  getDestinationDetails,
  getNearbyAttractions
} from '../controllers/tripbot.js';

// @route   POST api/tripbot/chat
// @desc    Process chat messages and generate AI responses
// @access  Public
router.post('/chat', chatHandler);

// @route   POST api/tripbot/recommendations
// @desc    Get recommended destinations based on user preferences
// @access  Public
router.post('/recommendations', getRecommendations);

// @route   POST api/tripbot/generate-plan
// @desc    Generate a trip plan based on preferences
// @access  Private
router.post('/generate-plan', protect, generateTripPlan);

// @route   POST api/tripbot/save-plan
// @desc    Save a generated trip plan
// @access  Private
router.post('/save-plan', protect, saveTripPlan);

// @route   GET api/tripbot/plan/:id
// @desc    Get a specific trip plan
// @access  Private
router.get('/plan/:id', protect, getTripPlan);

// @route   PUT api/tripbot/plan/:id
// @desc    Update a trip plan
// @access  Private
router.put('/plan/:id', protect, updateTripPlan);

// @route   GET api/tripbot/plan/:id/pdf
// @desc    Generate a PDF for a trip plan
// @access  Private
router.get('/plan/:id/pdf', protect, generatePlanPDF);

// @route   GET api/tripbot/destination/:id
// @desc    Get detailed information about a destination
// @access  Public
router.get('/destination/:id', getDestinationDetails);

// @route   GET api/tripbot/destination/:id/nearby
// @desc    Get nearby attractions for a destination
// @access  Public
router.get('/destination/:id/nearby', getNearbyAttractions);

export default router;