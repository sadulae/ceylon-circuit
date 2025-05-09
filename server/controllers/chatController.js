import OpenAI from 'openai';
import dotenv from 'dotenv';
import { TripMemory, createMemory, getMemory, updateMemory } from '../services/tripMemoryService.js';
import Destination from '../models/Destination.js';
import Accommodation from '../models/accModels.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to format the response
const formatResponse = (aiResponse) => {
  return {
    content: aiResponse.content,
    suggestions: aiResponse.suggestions || [],
    generatePlan: aiResponse.generatePlan || false,
    showDestinations: aiResponse.showDestinations || false,
    askForDuration: aiResponse.askForDuration || false,
    tripData: aiResponse.tripData || null
  };
};

// Helper function to get available destinations from DB
const getAvailableDestinations = async () => {
  try {
    return await Destination.find({})
      .select('name category location summary images mainImage')
      .limit(20);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return [];
  }
};

// Helper function to get available accommodations from DB
const getAvailableAccommodations = async () => {
  try {
    return await Accommodation.find({})
      .select('name type location price amenities')
      .limit(20);
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    return [];
  }
};

// @desc    Process chat messages using AI
// @route   POST /api/chat
// @access  Public
export const handleChat = async (req, res) => {
  try {
    const { message, context = [], sessionId, tripData = null } = req.body;
    
    // Input validation
    if (!message) {
      return res.status(400).json({ 
        success: false,
        message: 'No message provided'
      });
    }

    // Get or create memory for this session
    let memory = sessionId ? getMemory(sessionId) : null;
    if (!memory) {
      memory = createMemory(sessionId || `session-${Date.now()}`);
    }
    
    // Ensure memory has interests array
    if (!memory.interests) {
      memory.interests = [];
    }

    // Log incoming request
    console.log('Processing chat message:', message);

    try {
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key not configured');
        return res.status(500).json({
          success: false,
          message: 'Chat service not properly configured'
        });
      }

      // Get available destinations and accommodations to provide to the model
      const destinations = await getAvailableDestinations();
      const accommodations = await getAvailableAccommodations();

      // Prepare database context for the AI
      const dbContext = {
        destinations: destinations.map(d => ({
          name: d.name,
          category: d.category,
          location: d.location,
          summary: d.summary || ''
        })),
        accommodations: accommodations.map(a => ({
          name: a.name,
          type: a.type,
          location: a.location,
          price: a.price
        }))
      };

      // Add info about the trip data if provided
      let systemPrompt = `You are a friendly Sri Lankan travel assistant for Ceylon Circuit. 
You help users plan their Sri Lankan trips through natural conversation.

IMPORTANT INSTRUCTIONS:
1. Keep your responses conversational, friendly and helpful.
2. ONLY suggest or mention destinations that are explicitly listed in our database.
3. NEVER make up or suggest destinations or activities that are not in our database.
4. NEVER create or suggest full itineraries or day-by-day plans - the user must select destinations themselves.
5. Instead of suggesting itineraries, ask the user about their interests and then include "SHOW_DESTINATIONS: true" so they can select from our database.
6. When you need to know trip duration, include "ASK_FOR_DURATION: true" in your response.
7. Once you have enough information (duration and interests), immediately include "SHOW_DESTINATIONS: true" so the user can select their preferences.
8. Always include 2-3 relevant suggestions for the user's next response.

Our database ONLY includes these destinations in Sri Lanka (DO NOT SUGGEST ANY OTHERS):
${JSON.stringify(dbContext.destinations.map(d => d.name), null, 2)}

CRITICAL: The user MUST select destinations themselves from our visual interface. Do NOT create itineraries for them. Your job is to ask about interests and duration, then show destination options.

If a user asks about a destination not in this list, politely explain that we don't have information about that destination in our database, and suggest one of the destinations we do have.

Answer questions about Sri Lanka accurately and be helpful, but your main goal is to help the user plan a trip using only the destinations in our database.`;

      // Add context about current trip planning state
      if (tripData) {
        systemPrompt += `\n\nThe user has already provided some trip preferences:`;
        
        if (tripData.duration) {
          systemPrompt += `\n- Trip duration: ${tripData.duration} days`;
          memory.setDuration(tripData.duration);
        }
        
        if (tripData.interests && tripData.interests.length > 0) {
          systemPrompt += `\n- Interests: ${tripData.interests.join(', ')}`;
          memory.interests = tripData.interests;
        }
        
        if (tripData.budget) {
          systemPrompt += `\n- Budget: ${tripData.budget}`;
          memory.budget = tripData.budget;
        }
        
        if (tripData.pace) {
          systemPrompt += `\n- Pace: ${tripData.pace}`;
          memory.pace = tripData.pace;
        }

        // Information about any already selected destinations
        if (tripData.selectedDestinations) {
          const selectedDests = [];
          for (const day in tripData.selectedDestinations) {
            if (tripData.selectedDestinations[day]?.length > 0) {
              selectedDests.push(...tripData.selectedDestinations[day].map(d => d.name));
            }
          }
          
          if (selectedDests.length > 0) {
            systemPrompt += `\n- Already interested in these destinations: ${selectedDests.join(', ')}`;
          }
        }
      }

      // Generate AI response using GPT
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...context,
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      // Update memory with this interaction
      memory.addMessage('user', message);
      const aiResponseText = completion.choices[0].message.content;
      memory.addMessage('assistant', aiResponseText);
      
      // Parse the response
      const generatePlan = aiResponseText.includes('READY_TO_GENERATE_PLAN: true');
      const showDestinations = aiResponseText.includes('SHOW_DESTINATIONS: true');
      const askForDuration = aiResponseText.includes('ASK_FOR_DURATION: true');
      
      // Extract suggestions (lines that start with "- ")
      const suggestions = aiResponseText
        .split('\n')
        .filter(line => line.trim().startsWith('- '))
        .map(line => line.trim().replace('- ', ''));
      
      // Clean the content by removing the special markers
      let content = aiResponseText
        .replace('READY_TO_GENERATE_PLAN: true', '')
        .replace('SHOW_DESTINATIONS: true', '')
        .replace('ASK_FOR_DURATION: true', '')
        .split('\n')
        .filter(line => !line.trim().startsWith('- '))
        .join('\n')
        .trim();
      
      // Extract trip data if plan should be generated
      let extractedTripData = null;
      if (generatePlan) {
        // Try to find duration in the text (numbers followed by "day" or "days")
        const durationMatch = content.match(/(\d+)[-\s]day/i);
        const duration = durationMatch ? parseInt(durationMatch[1]) : memory.duration || 7;
        
        // Try to find interests mentioned
        const interestKeywords = ['beach', 'culture', 'history', 'wildlife', 'nature', 'adventure', 'food', 'hiking', 'trekking'];
        const interests = interestKeywords.filter(interest => 
          content.toLowerCase().includes(interest.toLowerCase()) || 
          memory.interests.includes(interest)
        );
        
        // Try to find budget level
        let budget = memory.budget || 'moderate';
        if (!memory.budget) {
          if (content.toLowerCase().includes('budget') || content.toLowerCase().includes('affordable')) {
            budget = 'budget';
          } else if (content.toLowerCase().includes('luxury') || content.toLowerCase().includes('premium')) {
            budget = 'luxury';
          }
        }
        
        // Try to find pace preference
        let pace = memory.pace || 'moderate';
        if (!memory.pace) {
          if (content.toLowerCase().includes('relaxed') || content.toLowerCase().includes('slow')) {
            pace = 'relaxed';
          } else if (content.toLowerCase().includes('active') || content.toLowerCase().includes('fast')) {
            pace = 'active';
          }
        }
        
        extractedTripData = { duration, interests, budget, pace };
      }
      
      const aiResponse = {
        content,
        suggestions: suggestions.length > 0 ? suggestions : [],
        generatePlan,
        showDestinations,
        askForDuration,
        tripData: extractedTripData
      };
      
      console.log('AI response generated successfully');

      // Update memory if plan should be generated
      if (aiResponse.generatePlan && aiResponse.tripData) {
        memory.setDuration(aiResponse.tripData.duration || 7);
        memory.stage = 'ready_for_plan';
        
        if (aiResponse.tripData.interests) {
          memory.interests = aiResponse.tripData.interests;
        }
        
        if (aiResponse.tripData.budget) {
          memory.budget = aiResponse.tripData.budget;
        }
        
        if (aiResponse.tripData.pace) {
          memory.pace = aiResponse.tripData.pace;
        }
      }
      
      // Save updated memory
      updateMemory(sessionId, memory);

      return res.json({
        success: true,
        response: formatResponse(aiResponse)
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