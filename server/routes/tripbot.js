import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  generateTripPlan,
  saveTripPlan,
  getTripPlan,
  updateTripPlan,
  getRecommendations,
  generatePlanPDF,
  getDestinationDetails,
  getNearbyAttractions
} from '../controllers/tripbot.js';
import { handleChat } from '../controllers/chatController.js';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @route   POST api/tripbot/chat
// @desc    Process chat messages and generate AI responses
// @access  Public
router.post('/chat', handleChat);

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

router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable Sri Lankan travel expert. You will help create detailed travel itineraries based on the user's preferences. Use only factual information about Sri Lankan destinations, attractions, and activities. Format your response as a valid JSON object."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    // Parse the response to ensure it's valid JSON
    const responseText = completion.choices[0].message.content;
    const itinerary = JSON.parse(responseText);

    res.json(itinerary);
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});

export default router;