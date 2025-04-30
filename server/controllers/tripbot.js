import TripPlan from '../models/TripPlan.js';
import Destination from '../models/Destination.js';
import Accommodation from '../models/accModels.js';
import TourGuide from '../models/tourGuide.js';
import Tour from '../models/tourModel.js';
import GeminiService from '../services/geminiService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

// Memory store for conversation context
const conversationMemory = new Map();

// Helper function to generate a unique session ID
const generateSessionId = () => Math.random().toString(36).substring(2, 15);

// @desc    Process chat messages using AI
// @route   POST /api/tripbot/chat
// @access  Public
export const chatHandler = async (req, res) => {
  try {
    const { message, sessionId: existingSessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false,
        message: 'No message provided'
      });
    }
    
    // Create or retrieve session context
    const sessionId = existingSessionId || generateSessionId();
    if (!conversationMemory.has(sessionId)) {
      conversationMemory.set(sessionId, {
        history: [],
        preferences: {
          interests: [],
          budget: null,
          duration: null,
          travelers: null,
          destinations: [],
          travelDates: null
        },
        stage: 'greeting',
        lastUpdated: Date.now()
      });
    }
    
    const context = conversationMemory.get(sessionId);
    context.history.push({ role: 'user', content: message });
    context.lastUpdated = Date.now();
    
    // Determine if enough information has been collected to generate a plan
    const hasEnoughInfo = () => {
      const { destinations, interests, duration } = context.preferences;
      return (destinations.length > 0 || interests.length > 0) && duration;
    };
    
    // Use Gemini to analyze the message for travel planning information
    const extractedInfo = await GeminiService.analyzeUserMessage(message);
    
    if (extractedInfo) {
      // Update context with extracted information
      if (extractedInfo.destinations && extractedInfo.destinations.length > 0) {
        context.preferences.destinations = [
          ...new Set([...context.preferences.destinations, ...extractedInfo.destinations])
        ];
      }
      
      if (extractedInfo.duration) {
        context.preferences.duration = extractedInfo.duration;
      }
      
      if (extractedInfo.interests && extractedInfo.interests.length > 0) {
        context.preferences.interests = [
          ...new Set([...context.preferences.interests, ...extractedInfo.interests])
        ];
      }
      
      if (extractedInfo.budget) {
        context.preferences.budget = extractedInfo.budget;
      }
      
      if (extractedInfo.travelers) {
        context.preferences.travelers = extractedInfo.travelers;
      }
    }
    
    // Check if user is asking about destinations
    const isAskingAboutDestinations = 
      message.toLowerCase().includes('destination') ||
      message.toLowerCase().includes('place') ||
      message.toLowerCase().includes('location') ||
      message.toLowerCase().includes('where') ||
      message.toLowerCase().includes('visit') ||
      message.toLowerCase().includes('offer') ||
      message.toLowerCase().includes('available') ||
      message.toLowerCase().includes('other');

    // Check if this is a follow-up question about destinations
    const isFollowUpDestinationQuestion = 
      context.history.length >= 3 && // Has at least one previous exchange
      context.history[context.history.length - 3].role === 'assistant' && // Last bot message
      context.history[context.history.length - 3].content.includes('destinations in Sri Lanka from our database'); // Was about destinations
      
    if (isAskingAboutDestinations) {
      try {
        // First count total destinations to know what we're working with
        const totalDestinationCount = await Destination.countDocuments();
        
        // Handle case with no destinations
        if (totalDestinationCount === 0) {
          const noDestinationsText = "I apologize, but we don't have any destinations in our database yet. We're working on adding more destinations soon. In the meantime, I can still help you plan a trip to popular places in Sri Lanka based on your interests.";
          
          context.history.push({ role: 'assistant', content: noDestinationsText });
          
          return res.status(200).json({
            sessionId,
            type: 'text',
            content: noDestinationsText
          });
        }
        
        // Handle follow-up question when there's only one destination
        if (isFollowUpDestinationQuestion && totalDestinationCount === 1) {
          const onlyOneDestinationText = "Currently, Sigiriya is the only destination in our database. We're working on expanding our offerings to include more destinations across Sri Lanka. Would you like more detailed information about Sigiriya, or shall I help you plan a trip there?";
          
          context.history.push({ role: 'assistant', content: onlyOneDestinationText });
          
          return res.status(200).json({
            sessionId,
            type: 'text',
            content: onlyOneDestinationText
          });
        }
        
        // Handle follow-up question when there are very few destinations (less than 5)
        if (isFollowUpDestinationQuestion && totalDestinationCount < 5) {
          const fewDestinationsText = `Currently, we only have ${totalDestinationCount} destinations in our database. We're working on expanding our offerings to include more destinations across Sri Lanka. Would you like me to help you plan a trip to one of these places?`;
          
          context.history.push({ role: 'assistant', content: fewDestinationsText });
          
          return res.status(200).json({
            sessionId,
            type: 'text',
            content: fewDestinationsText
          });
        }
        
        // Determine if we should offset results for variety in follow-up questions
        let offset = 0;
        let limit = 15;
        
        if (isFollowUpDestinationQuestion) {
          // If we have more than 15 destinations, we can offset
          if (totalDestinationCount > 15) {
            offset = 15; // Skip the first 15 results for variety
            limit = 10;  // Show fewer results in follow-up
          } else {
            // If we have 15 or fewer, just show them all again with a different message
            offset = 0;
            limit = totalDestinationCount;
          }
        } else {
          // For first question, limit to either 15 or all available if less
          limit = Math.min(15, totalDestinationCount);
        }

        // Fetch real destinations from database with pagination
        const destinations = await Destination.find({})
          .select('name category location.province location.district summary')
          .skip(offset)
          .limit(limit);
          
        if (destinations && destinations.length > 0) {
          // Group destinations by category
          const destinationsByCategory = {};
          
          destinations.forEach(dest => {
            if (!destinationsByCategory[dest.category]) {
              destinationsByCategory[dest.category] = [];
            }
            destinationsByCategory[dest.category].push({
              name: dest.name,
              location: `${dest.location.district}, ${dest.location.province}`,
              summary: dest.summary || ''
            });
          });
          
          // Create a formatted list of destinations
          let destinationText = "";
          
          if (isFollowUpDestinationQuestion) {
            if (offset === 0) {
              // If we're showing the same destinations again
              destinationText = `These are all the destinations we currently have in our database (${totalDestinationCount} in total):\n\n`;
            } else {
              // If we're showing additional destinations
              destinationText = "Here are some additional destinations from our database:\n\n";
            }
          } else {
            destinationText = "Here are some popular destinations in Sri Lanka from our database:\n\n";
          }
          
          for (const category in destinationsByCategory) {
            destinationText += `**${category}**:\n`;
            destinationsByCategory[category].forEach(dest => {
              destinationText += `* **${dest.name}** (${dest.location}): ${dest.summary.substring(0, 100)}${dest.summary.length > 100 ? '...' : ''}\n`;
            });
            destinationText += '\n';
          }
          
          // Add different follow-up prompts based on context
          if (isFollowUpDestinationQuestion) {
            // If we have shown all destinations
            if (totalDestinationCount <= 15 || (offset + destinations.length >= totalDestinationCount)) {
              destinationText += "That's all the destinations we have available right now. We're constantly adding more! Would you like me to help you plan a trip to any of these places?";
            } else {
              destinationText += "Is there a specific type of destination you're interested in, like beaches, wildlife, or cultural sites? I can provide more focused recommendations.";
            }
          } else {
            destinationText += "Would you like more information about any of these destinations? Or would you like me to help you plan a trip to visit some of them?";
          }
          
          // Store the response in conversation history
          context.history.push({ role: 'assistant', content: destinationText });
          
          // Return the data-driven response
          return res.status(200).json({
            sessionId,
            type: 'text',
            content: destinationText
          });
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
        // Continue with regular AI response if destination fetching fails
      }
    }
    
    // Check if user is asking for a trip plan or itinerary
    const isAskingForPlan = 
      message.toLowerCase().includes('plan') ||
      message.toLowerCase().includes('itinerary') ||
      message.toLowerCase().includes('schedule') ||
      message.toLowerCase().includes('day by day');
      
    if (isAskingForPlan && hasEnoughInfo()) {
      try {
        context.stage = 'trip_planning';
        const planResponse = await generateAITripPlan(context);
        
        // Add a specialized message with button for generating PDF
        const responseWithPdfOption = {
          ...planResponse,
          type: 'trip_plan_with_actions',
          actions: [
            { 
              type: 'generate_pdf', 
              label: 'Download as PDF', 
              planId: planResponse.content?.id || null 
            },
            { 
              type: 'save_plan', 
              label: 'Save This Plan', 
              planId: planResponse.content?.id || null 
            }
          ]
        };
        
        // Save response to conversation history
        context.history.push({ role: 'assistant', content: responseWithPdfOption });
        
        // Return response with session ID
        return res.status(200).json({
          sessionId,
          ...responseWithPdfOption
        });
      } catch (error) {
        console.error('Error generating AI trip plan:', error);
        // Fall back to regular chat response if trip plan generation fails
      }
    }

    // Check if user is asking about specific destination details
    const destinationNames = await getDestinationNames();
    const mentionedDestination = findMentionedDestination(message, destinationNames);
    
    if (mentionedDestination) {
      try {
        // Fetch specific destination details
        const destination = await Destination.findOne({ 
          name: { $regex: new RegExp(`^${mentionedDestination}$`, 'i') } 
        });
        
        if (destination) {
          // Create a rich response with destination card
          const destinationCard = {
            type: 'destination_card',
            content: {
              id: destination._id,
              name: destination.name,
              category: destination.category,
              location: destination.location,
              summary: destination.summary,
              description: destination.description,
              images: destination.images || [],
              facilities: destination.facilities || []
            },
            message: `Here's information about ${destination.name}. Would you like to include this in your trip plan?`
          };
          
          // Add suggestion buttons
          destinationCard.actions = [
            { 
              type: 'add_to_plan', 
              label: 'Add to My Plan', 
              destinationId: destination._id 
            },
            { 
              type: 'show_nearby', 
              label: 'Show Nearby Attractions', 
              location: destination.location 
            }
          ];
          
          // Store response in conversation history
          context.history.push({ role: 'assistant', content: destinationCard });
          
          // Return the rich destination response
          return res.status(200).json({
            sessionId,
            ...destinationCard
          });
        }
      } catch (error) {
        console.error('Error fetching specific destination:', error);
        // Fall back to regular response if destination fetch fails
      }
    }
    
    // Generate a regular chat response
    try {
      const aiResponse = await GeminiService.generateChatResponse(context.history, { preferences: context.preferences });
      
      // Create response object
      let response = {
        type: 'text',
        content: aiResponse
      };
      
      // Update context
      context.history.push({ role: 'assistant', content: response.content });
      
      // Return response with session ID
      res.status(200).json({
        sessionId,
        ...response
      });
    } catch (error) {
      console.error('Error generating chat response:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error processing your message',
        error: error.message
      });
    }
    
  } catch (err) {
    console.error('Error processing chat message:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error processing your message',
      error: err.message
    });
  }
};

// Helper function to generate trip plan using Gemini AI
const generateAITripPlan = async (context) => {
  try {
    // Fetch data from database
    const destinations = await Destination.find({}).limit(20);
    const accommodations = await Accommodation.find({}).limit(20);
    const tourGuides = await TourGuide.find({}).limit(10);
    const tourPackages = await Tour.find({}).limit(10);
    
    // Generate trip plan with AI
    const aiPlan = await GeminiService.generateTripPlanWithAI(
      context, 
      destinations, 
      accommodations, 
      tourGuides, 
      tourPackages
    );
    
    // Store the plan in context
    context.lastPlan = aiPlan;
    context.stage = 'refinement';
    
    // Format the response
    return {
      type: 'trip_plan',
      content: aiPlan
    };
  } catch (error) {
    console.error('Error generating AI trip plan:', error);
    throw new Error('Could not generate trip plan');
  }
};

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
      destinations: context?.preferences.destinations || [],
      startDate: plan.startDate || null,
      endDate: plan.endDate || null,
      travelers: plan.travelers || (context?.preferences.travelers || 1),
      itinerary: plan.itinerary || context?.lastPlan?.itinerary || [],
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
// @access  Private
export const generateTripPlan = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      interests,
      budget,
      transportation,
      specialRequirements
    } = req.body;

    // Calculate trip duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // Mock data for demonstration - replace with actual destination matching logic
    const destinations = {
      cultural: ['Kandy', 'Anuradhapura', 'Polonnaruwa', 'Dambulla'],
      beaches: ['Mirissa', 'Unawatuna', 'Trincomalee', 'Pasikuda'],
      wildlife: ['Yala', 'Udawalawe', 'Minneriya', 'Wilpattu'],
      nature: ['Ella', 'Nuwara Eliya', 'Horton Plains', 'Sinharaja'],
      adventure: ['Kitulgala', 'Knuckles Mountain', 'Pidurangala', 'Riverston']
    };

    // Generate itinerary based on interests
    const itinerary = [];
    let currentDate = new Date(startDate);

    for (let day = 0; day < duration; day++) {
      const dayPlan = {
        date: new Date(currentDate),
        location: '',
        activities: []
      };

      // Select destination based on interests
      const selectedInterest = interests[day % interests.length];
      const destinationType = Object.keys(destinations).find(type => 
        selectedInterest.toLowerCase().includes(type.toLowerCase())
      );
      
      if (destinationType) {
        const destinationList = destinations[destinationType];
        dayPlan.location = destinationList[day % destinationList.length];

        // Add activities for the day
        dayPlan.activities = [
          {
            time: '09:00',
            title: `Explore ${dayPlan.location}`,
            description: `Discover the beauty of ${dayPlan.location}`,
            duration: '3 hours'
          },
          {
            time: '13:00',
            title: 'Local Cuisine Experience',
            description: 'Enjoy authentic Sri Lankan cuisine',
            duration: '1.5 hours'
          },
          {
            time: '15:00',
            title: 'Cultural Activity',
            description: 'Immerse in local culture and traditions',
            duration: '2 hours'
          }
        ];
      }

      itinerary.push(dayPlan);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate estimated budget based on preferences
    const budgetRates = {
      budget: 50,
      moderate: 100,
      luxury: 200
    };
    const dailyRate = budgetRates[budget.toLowerCase()] || budgetRates.moderate;
    const estimatedBudget = dailyRate * duration;

    const tripPlan = {
      userId: req.user.id,
      startDate,
      endDate,
      duration,
      interests,
      budget,
      transportation,
      specialRequirements,
      itinerary,
      estimatedBudget,
      totalDistance: Math.floor(Math.random() * 500) + 100 // Mock distance calculation
    };

    res.status(200).json(tripPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating trip plan' });
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
    const planId = req.params.id;
    
    // Fetch the trip plan with populated destinations
    const tripPlan = await TripPlan.findById(planId)
      .populate({
        path: 'itinerary.destinations',
        model: 'Destination'
      });
    
    if (!tripPlan) {
      return res.status(404).json({
        success: false,
        message: 'Trip plan not found'
      });
    }
    
    // Create a temporary file path
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const tempFilePath = path.join(__dirname, '..', 'uploads', `trip-plan-${planId}.pdf`);
    
    // Create a PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    // Pipe to a writable stream
    const stream = fs.createWriteStream(tempFilePath);
    doc.pipe(stream);
    
    // Add trip plan details to PDF
    // Title and header
    doc.fontSize(25).text(`Sri Lanka Trip Plan`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(15).text(`${tripPlan.title || 'Custom Trip Plan'}`, { align: 'center' });
    doc.moveDown();
    
    // Trip details
    doc.fontSize(12).text(`Duration: ${tripPlan.duration} days`);
    doc.text(`Dates: ${new Date(tripPlan.startDate).toLocaleDateString()} to ${new Date(tripPlan.endDate).toLocaleDateString()}`);
    doc.text(`Budget Level: ${tripPlan.budget}`);
    doc.text(`Transportation: ${tripPlan.transportation}`);
    doc.text(`Travelers: ${tripPlan.travelers}`);
    doc.moveDown();
    
    // Interests
    if (tripPlan.interests && tripPlan.interests.length > 0) {
      doc.text(`Interests: ${tripPlan.interests.join(', ')}`);
      doc.moveDown();
    }
    
    // Itinerary - day by day
    doc.fontSize(18).text('Daily Itinerary', { underline: true });
    doc.moveDown();
    
    if (tripPlan.itinerary && tripPlan.itinerary.length > 0) {
      tripPlan.itinerary.forEach((day, index) => {
        // Day header
        const dayDate = new Date(day.date);
        doc.fontSize(14).text(`Day ${index + 1}: ${dayDate.toDateString()}`, { underline: true });
        doc.moveDown(0.5);
        
        // Location
        doc.fontSize(12).text(`Location: ${day.location}`);
        doc.moveDown(0.5);
        
        // Activities
        if (day.activities && day.activities.length > 0) {
          doc.text('Activities:');
          day.activities.forEach(activity => {
            doc.fontSize(10).text(`• ${activity.time} - ${activity.title}: ${activity.description} (${activity.duration})`);
          });
        }
        
        // Accommodation
        if (day.accommodation) {
          doc.moveDown(0.5);
          doc.fontSize(12).text(`Accommodation: ${day.accommodation.name || 'Not specified'}`);
        }
        
        doc.moveDown();
      });
    } else {
      doc.text('No daily itinerary available.');
    }
    
    // Notes
    if (tripPlan.notes) {
      doc.moveDown();
      doc.fontSize(14).text('Notes:', { underline: true });
      doc.fontSize(10).text(tripPlan.notes);
    }
    
    // Add a footer with page numbers
    const totalPages = doc.bufferedPageRange().count;
    let currentPage = 0;
    
    doc.on('pageAdded', () => {
      currentPage++;
      const bottom = doc.page.height - doc.page.margins.bottom;
      doc.fontSize(8)
         .text(
           `Page ${currentPage} of ${totalPages}`,
           doc.page.margins.left,
           bottom,
           { align: 'center' }
         );
    });
    
    // Contact information
    doc.moveDown(2);
    doc.fontSize(10).text('This trip plan was created by Ceylon Circuit TripBot.', { align: 'center' });
    doc.fontSize(8).text('For more information, contact us at info@ceyloncircuit.com', { align: 'center' });
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the PDF to be created, then send it
    stream.on('finish', () => {
      res.download(tempFilePath, `Sri-Lanka-Trip-Plan-${tripPlan.title || planId}.pdf`, (err) => {
        if (err) {
          console.error('Error sending PDF:', err);
        }
        
        // Clean up temp file
        fs.unlink(tempFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting temp file:', unlinkErr);
          }
        });
      });
    });
    
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: err.message
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