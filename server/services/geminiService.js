import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Initialize the Gemini API
const apiKey = process.env.GEMINI_API_KEY;
console.log('Gemini API Key:', apiKey ? 'Key exists (Not showing for security)' : 'Key is missing');
console.log('Environment variables:', Object.keys(process.env));

let genAI;
try {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('Gemini API initialized successfully');
} catch (error) {
  console.error('Error initializing Gemini API:', error);
}

// Helper function to get the model
const getGeminiProModel = () => {
  if (!genAI) {
    console.error('Gemini API not initialized');
    throw new Error('Gemini API not initialized properly');
  }
  // Use the latest model version - gemini-1.5-pro
  return genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
};

/**
 * Generates a trip plan based on user preferences and database data
 * @param {Object} context - User preferences and conversation context
 * @param {Array} destinations - Available destinations from database
 * @param {Array} accommodations - Available accommodations from database
 * @param {Array} tourGuides - Available tour guides from database
 * @param {Array} tourPackages - Available tour packages from database
 */
export const generateTripPlanWithAI = async (context, destinations, accommodations, tourGuides, tourPackages) => {
  try {
    const model = getGeminiProModel();
    
    // Create destination summaries for prompt
    const destinationSummaries = destinations.map(dest => {
      return `- ${dest.name}: ${dest.category} in ${dest.location.district}, ${dest.location.province}. ${dest.summary || dest.description.substring(0, 100)}...`;
    }).join('\n');
    
    // Create accommodation summaries
    const accommodationSummaries = accommodations.map(acc => {
      return `- ${acc.accName}: Located in ${acc.location}, Address: ${acc.address}. Rooms: Single(${acc.availableSingleRooms}), Double(${acc.availableDoubleRooms})`;
    }).join('\n');
    
    // Create tour guide summaries
    const tourGuideSummaries = tourGuides.map(guide => {
      return `- ${guide.name}: ${guide.experience} years experience, Languages: ${guide.languages.join(', ')}, Specializes in: ${guide.specializations.join(', ')}`;
    }).join('\n');

    // Extract user preferences
    const { 
      destinations: preferredDestinations = [],
      interests = [], 
      duration = 5,
      budget = "moderate",
      travelers = 1
    } = context.preferences;
    
    // Create the prompt for Gemini
    const prompt = `
You are an AI travel planner specializing in Sri Lanka tourism. Create a detailed day-by-day travel itinerary based on the following information.

USER PREFERENCES:
- Preferred Destinations: ${preferredDestinations.join(', ') || 'No specific preferences'}
- Interests: ${interests.join(', ') || 'General tourism'}
- Trip Duration: ${duration} days
- Budget Level: ${budget}
- Number of Travelers: ${travelers}

AVAILABLE DESTINATIONS:
${destinationSummaries}

AVAILABLE ACCOMMODATIONS:
${accommodationSummaries}

AVAILABLE TOUR GUIDES:
${tourGuideSummaries}

Based on this information, create a day-by-day itinerary with the following format:
1. Include 1-2 destinations per day based on proximity and logical travel sequence
2. Each day should include suitable accommodation nearby
3. Include recommended activities at each destination
4. Suggest a tour guide that matches the itinerary style and preferences
5. Include meal recommendations (breakfast, lunch, dinner)
6. If available, suggest relevant tour packages that align with the created itinerary

Provide the response in a structured JSON format with the following structure:
{
  "summary": "Brief summary of the trip plan",
  "itinerary": [
    {
      "day": 1,
      "destinations": [
        {
          "name": "Destination name",
          "category": "Category",
          "description": "Short description",
          "location": "District, Province",
          "activities": ["Activity 1", "Activity 2"]
        }
      ],
      "accommodation": {
        "name": "Accommodation name",
        "location": "Location",
        "address": "Address"
      },
      "meals": ["Breakfast", "Lunch", "Dinner"]
    }
  ],
  "tourGuide": {
    "name": "Guide name",
    "languages": ["Language 1", "Language 2"],
    "experience": 5,
    "specializations": ["Specialization 1", "Specialization 2"]
  },
  "tourPackages": [
    {
      "name": "Package name",
      "duration": 5,
      "price": 1000,
      "difficulty": "Moderate",
      "description": "Package description"
    }
  ]
}

Ensure logical geographical progression between destinations.`;

    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from the response 
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsedResponse = JSON.parse(jsonStr);
        return parsedResponse;
      } catch (err) {
        console.error('Error parsing JSON from Gemini response:', err);
        throw new Error('Failed to parse AI response');
      }
    } else {
      console.error('No valid JSON found in response:', text);
      throw new Error('Invalid response format from AI');
    }
  } catch (error) {
    console.error('Error generating trip plan with Gemini:', error);
    throw error;
  }
};

/**
 * Analyzes user message to extract key information
 * @param {string} message - User's message
 */
export const analyzeUserMessage = async (message) => {
  let retries = 0;
  const maxRetries = 3;
  const baseDelay = 5000; // 5 seconds

  const attemptAnalysis = async () => {
    try {
      const model = getGeminiProModel();
      
      const prompt = `
Analyze the following user message and extract key travel planning information. 
Extract the following information in JSON format:
- Destinations mentioned
- Duration of stay (number of days)
- Activities or interests mentioned
- Budget level mentioned (budget, mid-range, luxury)
- Number of travelers mentioned
- Any specific accommodation preferences
- Any specific transportation preferences

Message: "${message}"

Respond with only a JSON object, for example:
{
  "destinations": ["Kandy", "Sigiriya"],
  "duration": 7,
  "interests": ["culture", "wildlife", "beaches"],
  "budget": "mid-range",
  "travelers": 2,
  "accommodation": "hotel",
  "transportation": "car"
}
If any information is not provided, use null for that field.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          return JSON.parse(jsonStr);
        } catch (err) {
          console.error('Error parsing JSON from Gemini response:', err);
          return null;
        }
      } else {
        console.error('No valid JSON found in response:', text);
        return null;
      }
    } catch (error) {
      // Check if it's a rate limit error (429)
      if (error.status === 429 && retries < maxRetries) {
        retries++;
        const delay = baseDelay * Math.pow(2, retries); // Exponential backoff
        console.log(`Rate limit hit in analyzeUserMessage. Retrying in ${delay/1000} seconds (attempt ${retries} of ${maxRetries})...`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              // If we're using gemini-1.5-pro, try falling back to gemini-1.0-pro
              if (retries === 1) {
                console.log('Trying with fallback model gemini-1.0-pro for message analysis...');
                // Temporarily override the model to use gemini-1.0-pro
                const originalGetModel = getGeminiProModel;
                getGeminiProModel = () => {
                  const genAI = new GoogleGenerativeAI(apiKey);
                  return genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
                };
                
                const result = await attemptAnalysis();
                // Restore original model function
                getGeminiProModel = originalGetModel;
                resolve(result);
              } else {
                resolve(await attemptAnalysis());
              }
            } catch (retryError) {
              console.error('Error during retry:', retryError);
              resolve(null); // Return null on failure
            }
          }, delay);
        });
      }
      
      console.error('Error analyzing user message with Gemini:', error);
      return null;
    }
  };
  
  return attemptAnalysis();
};

/**
 * Generates a chat response based on conversation history
 * @param {Array} history - Conversation history
 */
export const generateChatResponse = async (history, context = {}) => {
  let retries = 0;
  const maxRetries = 3;
  const baseDelay = 5000; // 5 seconds

  const attemptGeneration = async () => {
    try {
      const model = getGeminiProModel();
      
      // Format conversation history for the model
      const formattedHistory = history.map(msg => {
        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }]
        };
      });
      
      // Check if there's at least one user message
      if (formattedHistory.length === 0 || formattedHistory[0].role !== 'user') {
        // Need at least one user message to start
        console.log('No user messages in history or first message is not from user');
        
        // Generate content instead of using chat
        const systemPrompt = `You are TripBot, an AI travel assistant specializing in Sri Lanka tourism. Your goal is to help users plan their perfect trip to Sri Lanka based on their preferences and needs. Be conversational, helpful, and enthusiastic about Sri Lanka's attractions. 

User Context:
${JSON.stringify(context, null, 2)}

User says: "${history[history.length - 1]?.content || 'Hello'}". 
Give a friendly response introducing yourself and asking about their travel plans to Sri Lanka.`;
        
        const result = await model.generateContent(systemPrompt);
        return result.response.text();
      }
      
      // Use the regular chat approach if we have a valid history
      // Generate chat response using the simpler approach
      const lastMessage = formattedHistory[formattedHistory.length - 1];
      
      // If there's only one message (from the user), add context in our prompt
      if (formattedHistory.length === 1) {
        const contextPrompt = `You are TripBot, an AI travel assistant specializing in Sri Lanka tourism. The user says: "${lastMessage.parts[0].text}". Respond helpfully and ask about their travel preferences for Sri Lanka.`;
        
        const result = await model.generateContent(contextPrompt);
        return result.response.text();
      }
      
      // For longer conversations, use the regular chat approach with prior history
      const chatHistory = formattedHistory.slice(0, -1); // All except last message
      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        }
      });
      
      const result = await chat.sendMessage(lastMessage.parts[0].text);
      return result.response.text();
      
    } catch (error) {
      // Check if it's a rate limit error (429)
      if (error.status === 429 && retries < maxRetries) {
        retries++;
        const delay = baseDelay * Math.pow(2, retries); // Exponential backoff
        console.log(`Rate limit hit. Retrying in ${delay/1000} seconds (attempt ${retries} of ${maxRetries})...`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              // If we're using gemini-1.5-pro, try falling back to gemini-1.0-pro
              if (retries === 1) {
                console.log('Trying with fallback model gemini-1.0-pro...');
                // Temporarily override the model to use gemini-1.0-pro
                const originalGetModel = getGeminiProModel;
                getGeminiProModel = () => {
                  const genAI = new GoogleGenerativeAI(apiKey);
                  return genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
                };
                
                const result = await attemptGeneration();
                // Restore original model function
                getGeminiProModel = originalGetModel;
                resolve(result);
              } else {
                resolve(await attemptGeneration());
              }
            } catch (retryError) {
              resolve("I'm currently experiencing high demand. Please try again in a moment.");
            }
          }, delay);
        });
      }
      
      // If it's not a rate limit error or we've exhausted retries
      console.error('Error generating chat response with Gemini:', error);
      if (error.status === 429) {
        return "I'm currently experiencing high demand and have reached my usage limits. Please try again in a few minutes.";
      }
      return "I'm having trouble connecting to my AI services right now. Please try again in a moment.";
    }
  };
  
  return attemptGeneration();
};

// Export all functions as a default object
const GeminiService = {
  generateTripPlanWithAI,
  analyzeUserMessage,
  generateChatResponse
};

export default GeminiService; 