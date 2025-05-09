import TripPlan from '../models/TripPlan.js';
import Destination from '../models/Destination.js';
import Accommodation from '../models/accModels.js';
import TourGuide from '../models/tourGuide.js';
import Tour from '../models/tourModel.js';
import GptService from '../services/gptService.js';
import { TripMemory, createMemory, getMemory, updateMemory } from '../services/tripMemoryService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to generate a unique session ID
const generateSessionId = () => Math.random().toString(36).substring(2, 15);

// @desc    Process chat messages using AI
// @route   POST /api/tripbot/chat
// @access  Public
export const chatHandler = async (req, res) => {
  try {
    const { message, context = [], sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false,
        message: 'No message provided'
      });
    }

    console.log('Processing chat message:', message);

    try {
      // Generate AI response using GPT
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a friendly Sri Lankan travel assistant for Ceylon Circuit. Guide the conversation to collect:
1. If they're a first-time visitor
2. Trip duration (3, 5, 7, or 10 days)
3. Interests (culture, nature, beaches, etc.)
4. Budget level
5. Preferred pace (relaxed vs active)

Once you have all necessary information, suggest creating a trip plan.

Please format your response with:
1. A friendly message to the user
2. 2-3 suggestions for the next response as bullet points starting with "- "

For first-time messages or greetings, respond with a welcome message like:
"Welcome to Ceylon Circuit! 🌴 Before we start planning your perfect Sri Lankan adventure, I'd love to know - have you visited our beautiful island before? This will help me tailor the perfect experience for you."

And include these suggestions:
- No, first time
- Yes, I have visited before`
          },
          ...context.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
          })),
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const aiResponseText = completion.choices[0].message.content;
      
      // Extract suggestions (lines that start with "- ")
      const suggestions = aiResponseText
        .split('\n')
        .filter(line => line.trim().startsWith('- '))
        .map(line => line.trim().replace('- ', ''));
      
      // Remove suggestion lines from content
      const content = aiResponseText
        .split('\n')
        .filter(line => !line.trim().startsWith('- '))
        .join('\n')
        .trim();
      
      const aiResponse = {
        content,
        suggestions: suggestions.length > 0 ? suggestions : []
      };
      
      console.log('AI response generated successfully');

      return res.json({
        success: true,
        response: aiResponse
      });

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Handle specific OpenAI API errors
      if (error.response?.status === 429) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded. Please try again in a moment.'
        });
      }
      
      if (error.response?.status === 401) {
        return res.status(500).json({
          success: false,
          message: 'Authentication error with AI service'
        });
      }

      // Generic error response
      return res.status(500).json({
        success: false,
        message: "I apologize, but I'm having trouble processing your request right now. Could you please try again in a moment? 🙏"
      });
    }

  } catch (error) {
    console.error('Chat handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to get system prompt based on memory state
function getSystemPrompt(memory) {
  return `You are TripBot, an AI travel assistant for Ceylon Circuit, specializing in Sri Lankan travel planning.
Current stage: ${memory.stage}
User status: ${memory.isReturningTraveler ? 'Returning visitor' : 'First-time visitor'}
${memory.duration ? `Trip duration: ${memory.duration} days` : ''}
${memory.currentDay ? `Current day: ${memory.currentDay}` : ''}
${memory.dayPlans.size > 0 ? `Selected destinations: ${[...memory.dayPlans.values()].flatMap(p => p.destinations).join(', ')}` : ''}

Please help the user plan their perfect Sri Lankan vacation. Be friendly, professional, and use emojis occasionally.`;
}

// Helper function to get available destinations
async function getAvailableDestinations(excludePlaces = []) {
  try {
    const query = excludePlaces.length ? 
      { name: { $nin: excludePlaces } } : 
      {};
      
    return await Destination.find(query)
      .select('name category location.province location.district summary images mainImage')
      .limit(6);
      } catch (error) {
        console.error('Error fetching destinations:', error);
    return [];
      }
    }
    
// Helper function to get nearby accommodations
async function getNearbyAccommodations(destinationName) {
      try {
    const destination = await Destination.findOne({ name: destinationName });
    if (!destination) return [];
    
    return await Accommodation.find({
      'location.district': destination.location.district
    })
    .select('name type location price amenities image')
    .limit(5);
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    return [];
  }
}

// Helper function to extract places from message
async function extractPlacesFromMessage(message) {
  try {
    const destinations = await Destination.find({});
    const places = [];
    
    destinations.forEach(dest => {
      if (message.toLowerCase().includes(dest.name.toLowerCase())) {
        places.push(dest.name);
      }
    });
    
    return places;
      } catch (error) {
    console.error('Error extracting places:', error);
    return [];
      }
    }

// Helper function to extract destinations from message
async function extractDestinationsFromMessage(message) {
      try {
    const destinations = await Destination.find({});
    const selected = [];
    
    destinations.forEach(dest => {
      if (message.toLowerCase().includes(dest.name.toLowerCase())) {
        selected.push(dest.name);
      }
    });
    
    return selected;
      } catch (error) {
    console.error('Error extracting destinations:', error);
    return [];
  }
}

// Helper function to extract accommodation from message
async function extractAccommodationFromMessage(message) {
    try {
    const accommodations = await Accommodation.find({});
    let selected = null;
    
    accommodations.forEach(acc => {
      if (message.toLowerCase().includes(acc.name.toLowerCase())) {
        selected = acc.name;
      }
    });
    
    return selected;
    } catch (error) {
    console.error('Error extracting accommodation:', error);
    return null;
  }
}

// Helper function to generate trip plan response
async function generateTripPlanResponse(memory) {
  try {
    const plan = await GptService.generateTripPlanWithAI(memory);
    
    // Create a new trip plan in the database
    const newTripPlan = new TripPlan({
      title: `${memory.duration}-Day Sri Lanka Trip`,
      destinations: [...new Set([...memory.dayPlans.values()].flatMap(day => day.destinations))],
      duration: memory.duration,
      itinerary: plan.itinerary,
      estimatedCost: plan.estimatedCost,
      importantNotes: plan.importantNotes,
      emergencyContacts: plan.emergencyContacts,
      packingList: plan.packingList
    });

    await newTripPlan.save();

    return {
      type: 'trip_plan',
      content: {
        ...plan,
        id: newTripPlan._id,
        message: "Here's your complete trip plan! Would you like me to generate a detailed PDF report?",
        actions: [
          { type: 'generate_pdf', label: 'Generate PDF' },
          { type: 'modify_plan', label: 'Modify Plan' }
        ]
      }
    };
  } catch (error) {
    console.error('Error generating trip plan:', error);
    throw error;
  }
}

// @desc    Save a trip plan
// @route   POST /api/tripbot/save-plan
// @access  Private
export const saveTripPlan = async (req, res) => {
  try {
    const { plan, sessionId } = req.body;
    
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'No plan provided'
      });
    }
    
    // Get context if session ID provided
    let context = null;
    if (sessionId && conversationMemory.has(sessionId)) {
      context = conversationMemory.get(sessionId);
    }
    
    // Create a new trip plan
    const newTripPlan = new TripPlan({
      user: req.user?._id,
      title: plan.title || `Sri Lanka Trip (${plan.itinerary?.length || 'Multi'} Days)`,
      destinations: context?.memory.dayPlans.get(1)?.destinations || [],
      startDate: plan.startDate || null,
      endDate: plan.endDate || null,
      travelers: plan.travelers || (context?.memory.travelers || 1),
      itinerary: plan.itinerary || context?.memory.dayPlans.get(1)?.destinations || [],
      notes: plan.notes || '',
      status: 'draft'
    });
    
    await newTripPlan.save();
    
    res.status(201).json({
      success: true,
      message: 'Trip plan saved successfully',
      data: {
        planId: newTripPlan._id
      }
    });
    
  } catch (err) {
    console.error('Error saving trip plan:', err);
    res.status(500).json({
      success: false,
      message: 'Error saving trip plan',
      error: err.message
    });
  }
};

// @desc    Get recommended destinations based on user preferences
// @route   POST /api/tripbot/recommendations
// @access  Public
export const getRecommendations = async (req, res) => {
  try {
    const { interests, location, budget } = req.body;
    
    let query = {};
    
    // Apply filters based on provided criteria
    if (interests && interests.length > 0) {
      const interestRegex = interests.map(interest => new RegExp(interest, 'i'));
      query.$or = [
        { category: { $in: interestRegex } },
        { tags: { $in: interestRegex } }
      ];
    }
    
    if (location) {
      query.$or = query.$or || [];
      query.$or.push(
        { 'location.province': new RegExp(location, 'i') },
        { 'location.district': new RegExp(location, 'i') },
        { name: new RegExp(location, 'i') }
      );
    }
    
    // Get recommended destinations
    const destinations = await Destination.find(query)
      .limit(10)
      .select('name category summary description location images tags');
    
    res.status(200).json({
      success: true,
      count: destinations.length,
      data: destinations
    });
    
  } catch (err) {
    console.error('Error getting recommendations:', err);
    res.status(500).json({
      success: false,
      message: 'Error getting recommendations',
      error: err.message
    });
  }
};

// @desc    Generate a trip plan based on preferences
// @route   POST /api/tripbot/generate-plan
// @access  Public
export const generateTripPlan = async (req, res) => {
  try {
    const { sessionId, preferences } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    // Get memory for this session
    const memory = getMemory(sessionId);
    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Session not found. Please start a new conversation.'
      });
    }
    
    // Get data from the memory or preferences
    const duration = preferences?.duration || memory.duration || 7;
    const interests = preferences?.interests || memory.interests || [];
    const budget = preferences?.budget || memory.budget || 'moderate';
    const pace = preferences?.pace || memory.pace || 'moderate';
    
    // Fetch destinations from the database
    const destinations = await Destination.find({})
      .select('name category location summary description mainImage images visitDuration bestTimeToVisit');
    
    // Fetch accommodations from the database
    const accommodations = await Accommodation.find({})
      .select('name type location price amenities image');
    
    // Create system prompt for GPT
    const systemPrompt = `You are a Sri Lankan travel expert. Create a detailed ${duration}-day travel plan
based on the following preferences:
- Interests: ${interests.join(', ') || 'General tourism'}
- Budget: ${budget}
- Pace: ${pace}

Use ONLY destinations and accommodations from our database:
Destinations: ${destinations.map(d => d.name).join(', ')}
Accommodations: ${accommodations.map(a => a.name).join(', ')}

Create a detailed day-by-day itinerary with:
1. Day number and title summarizing the day's activities
2. Locations to visit with brief descriptions
3. Recommended accommodation for each night
4. Travel times between locations
5. Suggested activities, meal recommendations, and local tips
6. Logical geographical progression between places to minimize travel time

Return your response in this structure:
TITLE: [Trip title]
DURATION: [Number of days]
SUMMARY: [Brief overview of the trip]

ITINERARY:
DAY 1: [Day title]
- Destinations: [Destination 1], [Destination 2]
- Accommodation: [Accommodation name]
- Activities: [Activity 1], [Activity 2]
- Meals: Breakfast at [location], Lunch at [location], Dinner at [location]
- Travel Times: [Travel detail 1], [Travel detail 2]
- Description: [Detailed description of the day]

[Repeat for each day...]

ESSENTIALS:
- Packing: [Item 1], [Item 2]...
- Tips: [Tip 1], [Tip 2]...
- Cultural Notes: [Note 1], [Note 2]...
- Estimated Cost: [Cost range for the entire trip]`;

    // Generate a trip plan using GPT
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Please create a ${duration}-day Sri Lanka trip plan based on these preferences: interests in ${interests.join(', ') || 'general tourism'}, ${budget} budget, and ${pace} pace.`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    // Parse the response text into structured data
    const responseText = completion.choices[0].message.content;
    
    // Extract the title, duration, and summary
    const titleMatch = responseText.match(/TITLE:\s*(.+)/);
    const durationMatch = responseText.match(/DURATION:\s*(\d+)/);
    const summaryMatch = responseText.match(/SUMMARY:\s*(.+?)(?=\n\n|\n[A-Z])/s);
    
    const title = titleMatch?.[1]?.trim() || `${duration}-Day Sri Lanka Adventure`;
    const extractedDuration = durationMatch ? parseInt(durationMatch[1]) : duration;
    const summary = summaryMatch?.[1]?.trim() || `A ${duration}-day exploration of Sri Lanka.`;
    
    // Extract the itinerary
    const itinerarySection = responseText.match(/ITINERARY:(.+?)(?=ESSENTIALS:)/s)?.[1] || '';
    const dayRegex = /DAY\s+(\d+):\s*([^\n]+)(?:\n|$)([\s\S]+?)(?=DAY\s+\d+:|$)/g;
    
    const itinerary = [];
    let dayMatch;
    while ((dayMatch = dayRegex.exec(itinerarySection)) !== null) {
      const dayNum = parseInt(dayMatch[1]);
      const dayTitle = dayMatch[2].trim();
      const dayContent = dayMatch[3].trim();
      
      // Parse destinations
      const destinationsMatch = dayContent.match(/Destinations:\s*(.+?)(?=\n|$)/);
      const destinations = destinationsMatch 
        ? destinationsMatch[1].split(',').map(d => d.trim()) 
        : [];
      
      // Parse accommodation
      const accommodationMatch = dayContent.match(/Accommodation:\s*(.+?)(?=\n|$)/);
      const accommodation = accommodationMatch ? accommodationMatch[1].trim() : '';
      
      // Parse activities
      const activitiesMatch = dayContent.match(/Activities:\s*(.+?)(?=\n|$)/);
      const activities = activitiesMatch 
        ? activitiesMatch[1].split(',').map(a => a.trim()) 
        : [];
      
      // Parse meals
      const mealsMatch = dayContent.match(/Meals:\s*(.+?)(?=\n|$)/);
      let meals = {};
      if (mealsMatch) {
        const mealsText = mealsMatch[1];
        const breakfastMatch = mealsText.match(/Breakfast[^,]+/);
        const lunchMatch = mealsText.match(/Lunch[^,]+/);
        const dinnerMatch = mealsText.match(/Dinner[^,]+/);
        
        if (breakfastMatch) meals.breakfast = breakfastMatch[0].replace('Breakfast at', '').replace('Breakfast:', '').trim();
        if (lunchMatch) meals.lunch = lunchMatch[0].replace('Lunch at', '').replace('Lunch:', '').trim();
        if (dinnerMatch) meals.dinner = dinnerMatch[0].replace('Dinner at', '').replace('Dinner:', '').trim();
      }
      
      // Parse travel times
      const travelTimesMatch = dayContent.match(/Travel Times:\s*(.+?)(?=\n|$)/);
      const travelTimes = travelTimesMatch 
        ? travelTimesMatch[1].split(',').map(t => t.trim()) 
        : [];
      
      // Parse description
      const descriptionMatch = dayContent.match(/Description:\s*(.+?)(?=\n|$)/s);
      const description = descriptionMatch ? descriptionMatch[1].trim() : '';
      
      itinerary.push({
        day: dayNum,
        title: dayTitle,
        destinations,
        accommodation,
        activities,
        meals,
        travelTimes,
        description
      });
    }
    
    // Extract essentials
    const essentialsSection = responseText.match(/ESSENTIALS:(.+)$/s)?.[1] || '';
    
    // Parse packing list
    const packingMatch = essentialsSection.match(/Packing:\s*(.+?)(?=\n|$)/);
    const packingList = packingMatch 
      ? packingMatch[1].split(',').map(item => item.trim()) 
      : [];
    
    // Parse travel tips
    const tipsMatch = essentialsSection.match(/Tips:\s*(.+?)(?=\n|$)/);
    const travelTips = tipsMatch 
      ? tipsMatch[1].split(',').map(tip => tip.trim()) 
      : [];
    
    // Parse cultural notes
    const culturalMatch = essentialsSection.match(/Cultural Notes:\s*(.+?)(?=\n|$)/);
    const culturalNotes = culturalMatch 
      ? culturalMatch[1].split(',').map(note => note.trim()) 
      : [];
    
    // Parse estimated cost
    const costMatch = essentialsSection.match(/Estimated Cost:\s*(.+?)(?=\n|$)/);
    const estimatedCost = costMatch ? costMatch[1].trim() : '';
    
    // Construct the structured trip plan
    const tripPlan = {
      title,
      duration: extractedDuration,
      summary,
      itinerary,
      essentials: {
        packingList,
        travelTips,
        culturalNotes,
        estimatedCost
      }
    };

    // Save the trip plan to the user's memory
    memory.tripPlan = tripPlan;
    updateMemory(sessionId, memory);

    return res.json({
      success: true,
      message: 'Trip plan generated successfully',
      tripPlan
    });

  } catch (error) {
    console.error('Error generating trip plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not generate trip plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get a specific trip plan
// @route   GET /api/tripbot/plan/:id
// @access  Private
export const getTripPlan = async (req, res) => {
  try {
    const tripPlan = await TripPlan.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!tripPlan) {
      return res.status(404).json({ message: 'Trip plan not found' });
    }

    res.status(200).json(tripPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving trip plan' });
  }
};

// @desc    Update a trip plan
// @route   PUT /api/tripbot/plan/:id
// @access  Private
export const updateTripPlan = async (req, res) => {
  try {
    const tripPlan = await TripPlan.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!tripPlan) {
      return res.status(404).json({ message: 'Trip plan not found' });
    }

    res.status(200).json(tripPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating trip plan' });
  }
};

/**
 * Get all destination names from the database for matching
 */
async function getDestinationNames() {
  try {
    const destinations = await Destination.find({}).select('name');
    return destinations.map(dest => dest.name);
  } catch (error) {
    console.error('Error fetching destination names:', error);
    return [];
  }
}

/**
 * Find if a message mentions a specific destination
 */
function findMentionedDestination(message, destinationNames) {
  const messageLower = message.toLowerCase();
  
  // Check for explicit questions about a destination
  const questionPatterns = [
    'tell me about', 'what is', 'where is', 'information on', 
    'details about', 'learn about', 'know about'
  ];
  
  for (const pattern of questionPatterns) {
    if (messageLower.includes(pattern)) {
      for (const name of destinationNames) {
        if (messageLower.includes(name.toLowerCase())) {
          return name;
        }
      }
    }
  }
  
  // If no question pattern found, check if any destination is mentioned prominently
  for (const name of destinationNames) {
    // Look for destinations with longer names first (more specific)
    if (name.length > 4 && messageLower.includes(name.toLowerCase())) {
      return name;
    }
  }
  
  return null;
}

// @desc    Generate PDF for a trip plan
// @route   GET /api/tripbot/plan/:id/pdf
// @access  Private
export const generatePlanPDF = async (req, res) => {
  try {
    const { plan } = req.body;
    
    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Pipe the PDF into a buffer
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(pdfData),
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename=trip-plan.pdf',
      });
      res.end(pdfData);
    });

    // Add content to the PDF
    doc.fontSize(24).text('Ceylon Circuit Travel Plan', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(plan.title, { align: 'center' });
    doc.moveDown();

    // Add each day's itinerary
    plan.days.forEach((day, index) => {
      doc.fontSize(16).text(`Day ${index + 1}: ${day.title}`);
      doc.moveDown(0.5);
      doc.fontSize(12).text(day.description);
      
      if (day.activities?.length) {
        doc.moveDown(0.5);
        doc.fontSize(14).text('Activities:');
        day.activities.forEach(activity => {
          doc.fontSize(12).text(`• ${activity}`);
        });
      }

      if (day.meals?.length) {
        doc.moveDown(0.5);
        doc.fontSize(14).text('Meals:');
        day.meals.forEach(meal => {
          doc.fontSize(12).text(`• ${meal}`);
        });
      }

      if (day.accommodation) {
        doc.moveDown(0.5);
        doc.fontSize(14).text('Accommodation:');
        doc.fontSize(12).text(day.accommodation);
      }

      doc.moveDown();
    });

    // Add footer
    doc.fontSize(10)
      .text('Generated by Ceylon Circuit Travel Planner', {
        align: 'center',
        bottom: 30
      });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF'
    });
  }
};

// @desc    Get detailed destination information
// @route   GET /api/tripbot/destination/:id
// @access  Public
export const getDestinationDetails = async (req, res) => {
  try {
    const destinationId = req.params.id;
    
    // Fetch destination details
    const destination = await Destination.findById(destinationId);
    
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }
    
    // Return detailed information
    res.status(200).json({
      success: true,
      data: destination
    });
    
  } catch (err) {
    console.error('Error fetching destination details:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching destination details',
      error: err.message
    });
  }
};

// @desc    Get nearby attractions
// @route   GET /api/tripbot/destination/:id/nearby
// @access  Public
export const getNearbyAttractions = async (req, res) => {
  try {
    const destinationId = req.params.id;
    
    // Fetch the destination to get its location
    const destination = await Destination.findById(destinationId);
    
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }
    
    // Get destinations in the same district
    const nearbyDestinations = await Destination.find({
      _id: { $ne: destinationId },
      'location.district': destination.location.district
    }).limit(5);
    
    // Return nearby attractions
    res.status(200).json({
      success: true,
      data: nearbyDestinations
    });
    
  } catch (err) {
    console.error('Error fetching nearby attractions:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby attractions',
      error: err.message
    });
  }
}; 