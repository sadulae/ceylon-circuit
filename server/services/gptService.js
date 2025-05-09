import OpenAI from 'openai';
import dotenv from 'dotenv';
import Destination from '../models/Destination.js';
import Accommodation from '../models/accModels.js';
import TourGuide from '../models/tourGuide.js';
import Tour from '../models/tourModel.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Fetches and formats database resources
 */
const getDatabaseResources = async () => {
  try {
    const destinations = await Destination.find({}).limit(20);
    const accommodations = await Accommodation.find({}).limit(20);
    const tourGuides = await TourGuide.find({}).limit(10);
    const tourPackages = await Tour.find({}).limit(10);

    return {
      destinations: destinations.map(d => ({
        id: d._id,
        name: d.name,
        category: d.category,
        location: d.location,
        summary: d.summary,
        description: d.description,
        entryFee: d.entryFee,
        visitDuration: d.visitDuration || '2-3 hours'
      })),
      accommodations: accommodations.map(a => ({
        id: a._id,
        name: a.name,
        type: a.type,
        location: a.location,
        price: a.price,
        amenities: a.amenities
      })),
      tourGuides: tourGuides.map(g => ({
        id: g._id,
        name: g.name,
        specialties: g.specialties,
        languages: g.languages,
        rating: g.rating,
        experience: g.experience
      })),
      tourPackages: tourPackages.map(t => ({
        id: t._id,
        name: t.name,
        duration: t.duration,
        destinations: t.destinations,
        price: t.price
      }))
    };
  } catch (error) {
    console.error('Error fetching database resources:', error);
    throw new Error('Failed to fetch travel resources');
  }
};

/**
 * Find mentioned destination in message
 */
function findMentionedDestination(message, destinations) {
  if (!message || !destinations || !Array.isArray(destinations)) {
    console.warn('Invalid input to findMentionedDestination:', { message, destinations });
    return null;
  }

  const messageLower = message.toLowerCase();
  
  // First try to find exact matches
  for (const dest of destinations) {
    try {
      // Skip invalid destination objects
      if (!dest || !dest.name) {
        console.warn('Invalid destination object found:', dest);
        continue;
      }
      
      // Check for exact name match
      const exactMatch = messageLower.includes(dest.name.toLowerCase());
      if (exactMatch) {
        // Ensure the destination has the required location data
        if (!dest.location) {
          dest.location = {
            district: dest.district || 'Unknown',
            province: dest.province || 'Unknown'
          };
        }
        return dest;
      }
    } catch (error) {
      console.error('Error processing destination:', error, dest);
      continue;
    }
  }
  
  // If no exact match, try fuzzy matching
  for (const dest of destinations) {
    try {
      // Skip invalid destination objects
      if (!dest || !dest.name) continue;
      
      // Check for partial matches (e.g., "Sigiriya Rock" matches "Sigiriya")
      const nameParts = dest.name.toLowerCase().split(' ');
      const hasPartialMatch = nameParts.some(part => 
        part.length > 3 && messageLower.includes(part)
      );
      
      if (hasPartialMatch) {
        // Ensure the destination has the required location data
        if (!dest.location) {
          dest.location = {
            district: dest.district || 'Unknown',
            province: dest.province || 'Unknown'
          };
        }
        return dest;
      }
    } catch (error) {
      console.error('Error processing destination for fuzzy match:', error, dest);
      continue;
    }
  }
  
  return null;
}

/**
 * Get nearby accommodations
 */
async function getNearbyAccommodations(district) {
  try {
    if (!district) {
      console.error('District is required for finding nearby accommodations');
      return [];
    }

    // Try to find accommodations in the exact district
    let accommodations = await Accommodation.find({
      'location.district': district
    })
    .select('name type location price amenities image')
    .limit(5);

    // If no accommodations found in exact district, try fuzzy matching
    if (!accommodations.length) {
      accommodations = await Accommodation.find({
        $or: [
          { 'location.district': { $regex: district, $options: 'i' } },
          { 'location.province': { $regex: district, $options: 'i' } }
        ]
      })
      .select('name type location price amenities image')
      .limit(5);
    }

    // If still no results, return some default accommodations
    if (!accommodations.length) {
      accommodations = await Accommodation.find({})
        .select('name type location price amenities image')
        .limit(5);
    }

    return accommodations.map(acc => ({
      ...acc.toObject(),
      location: acc.location || { district: 'Unknown', province: 'Unknown' },
      price: acc.price || 'Contact for price',
      amenities: acc.amenities || [],
      image: acc.image || '/default-accommodation.jpg'
    }));
  } catch (error) {
    console.error('Error fetching nearby accommodations:', error);
    return [];
  }
}

/**
 * Get recommended destinations
 */
async function getRecommendedDestinations(duration, isReturningVisitor) {
  try {
    let query = {};
    
    // For returning visitors, prioritize less common destinations
    if (isReturningVisitor) {
      query.popularity = { $lt: 4 }; // Less popular destinations
    }
    
    const destinations = await Destination.find(query)
      .sort(isReturningVisitor ? { popularity: 1 } : { popularity: -1 })
      .limit(6);
      
    return destinations;
  } catch (error) {
    console.error('Error getting recommended destinations:', error);
    return [];
  }
}

function getStageSpecificInstructions(stage, memory) {
  switch (stage) {
    case 'collecting_duration':
      return `Help the user decide on an appropriate trip duration. Consider:
- First-time visitors might need more time to explore
- Travel time between destinations
- Typical duration for different types of experiences
- Suggest popular durations (3, 5, 7, or 10 days)`;

    case 'collecting_day_details':
      return `Create an optimal day plan considering:
- Current day: ${memory.currentDay} of ${memory.duration}
- Previous destinations: ${[...memory.dayPlans.values()].flatMap(p => p.destinations).join(', ')}
- Travel time between locations
- Popular destination combinations
- Local events or seasonal activities
- Logical progression between places`;

    case 'collecting_guide':
      return `Recommend whether a guide would enhance their experience based on:
- Their chosen destinations
- Type of activities
- Cultural significance of places
- Complexity of travel arrangements`;

    default:
      return '';
  }
}

async function parseResponse(response, memory, dbResources) {
  try {
    // Try to extract structured data from AI response
    const structuredData = await analyzeResponse(response, memory);
    
    switch (memory.stage) {
      case 'collecting_duration':
        if (structuredData.duration) {
          const destinations = await getRecommendedDestinations(structuredData.duration, memory.isReturningTraveler);
          return {
            type: 'destination_tiles',
            content: {
              message: `Perfect! I've crafted a ${structuredData.duration}-day journey that will give you an amazing Sri Lankan experience. 🗺️\n\n${structuredData.explanation || ''}\n\nFor Day 1, which destinations interest you? Select from these carefully chosen options:`,
              tiles: destinations.map(dest => ({
                id: dest._id,
                name: dest.name,
                category: dest.category,
                location: `${dest.location.district}, ${dest.location.province}`,
                summary: dest.summary,
                image: dest.mainImage || (dest.images && dest.images[0]),
                actions: [{ type: 'select_destination', label: 'Select' }]
              }))
            },
            stage: 'collecting_day_details',
            duration: structuredData.duration
          };
        }
        return {
          type: 'text',
          content: response,
          suggestions: ['3 days', '5 days', '7 days', '10 days']
        };

      case 'collecting_day_details':
        if (structuredData.destinations?.length > 0) {
          const accommodations = await getRecommendedAccommodations(
            structuredData.destinations[structuredData.destinations.length - 1],
            memory
          );
          return {
            type: 'accommodation_options',
            content: {
              message: `Great choices! 🌟 ${structuredData.explanation || ''}\n\nWhere would you like to stay? I've selected these accommodations based on your destinations:`,
              options: accommodations.map(acc => ({
                id: acc._id,
                name: acc.name,
                type: acc.type,
                location: acc.location,
                price: acc.price,
                amenities: acc.amenities,
                image: acc.image,
                description: acc.description
              }))
            },
            destinations: structuredData.destinations
          };
        }
        return {
          type: 'text',
          content: response
        };

      default:
        return {
          type: 'text',
          content: response
        };
    }
  } catch (error) {
    console.error('Error parsing response:', error);
    return { type: 'text', content: response };
  }
}

async function analyzeResponse(response, memory) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Extract structured information from the travel assistant's response. Focus on:
- Duration (if mentioned)
- Destinations (if mentioned)
- Accommodations (if mentioned)
- Explanations or reasoning
- Recommendations

Return as JSON with these possible fields:
{
  "duration": number,
  "destinations": string[],
  "accommodation": string,
  "explanation": string,
  "recommendations": string[]
}`
        },
        {
          role: 'user',
          content: response
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing response:', error);
    return {};
  }
}

async function getRecommendedAccommodations(destinationName, memory) {
  try {
    const destination = await Destination.findOne({ name: destinationName });
    if (!destination) return [];

    // Get accommodations in the area
    const accommodations = await Accommodation.find({
      'location.district': destination.location.district
    });

    // Create a prompt for accommodation recommendations
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a Sri Lankan accommodation expert. Select the best accommodations near ${destinationName} for a ${memory.duration}-day trip.
Consider:
- Location convenience
- Price range variety
- Quality and amenities
- Guest reviews
- Proximity to attractions

Available accommodations: ${accommodations.map(a => a.name).join(', ')}

Return a JSON array of accommodation names, ordered by recommendation priority.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const recommendedNames = JSON.parse(completion.choices[0].message.content);
    
    // Get full accommodation details for recommended places
    return await Accommodation.find({
      name: { $in: recommendedNames }
    }).limit(5);
  } catch (error) {
    console.error('Error getting recommended accommodations:', error);
    return [];
  }
}

/**
 * Generates a detailed trip plan using AI
 */
export const generateTripPlanWithAI = async (memory) => {
  try {
    // Get database resources
    const dbResources = await getDatabaseResources();
    
    // Create a detailed prompt for the trip plan
    const prompt = `Create a detailed ${memory.duration}-day Sri Lanka trip plan.

Trip Context:
- ${memory.isReturningTraveler ? 'Returning visitor' : 'First-time visitor'}
${memory.previouslyVisitedPlaces.length > 0 ? `- Previously visited: ${memory.previouslyVisitedPlaces.join(', ')}` : ''}
- Selected destinations: ${[...memory.dayPlans.entries()].map(([day, plan]) => 
  `\n  Day ${day}: ${plan.destinations.join(', ')} (Stay: ${plan.accommodation})`
).join('')}
- Guide requested: ${memory.travelGuide ? 'Yes' : 'No'}

Available Resources:
Destinations: ${dbResources.destinations.map(d => d.name).join(', ')}
Accommodations: ${dbResources.accommodations.map(a => a.name).join(', ')}
Tour Guides: ${dbResources.tourGuides.map(g => g.name).join(', ')}

Create a comprehensive plan including:
1. Detailed day-by-day itinerary with timings
2. Activity recommendations
3. Local experiences and cultural insights
4. Transportation suggestions
5. Meal recommendations
6. Estimated costs
7. Weather considerations
8. Packing suggestions
9. Important tips and notes
10. Emergency contacts

Format the response as a structured JSON object.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional Sri Lankan travel planner. Create detailed, practical, and engaging trip plans.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error generating trip plan:', error);
    throw error;
  }
};

/**
 * Generates a chat response using GPT
 */
export const generateChatResponse = async (messages, { memory }) => {
  try {
    // Get database resources for context
    const dbResources = await getDatabaseResources();

    // Handle initial greeting
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    if (lastMessage === 'hi' || lastMessage === 'hello' || lastMessage === 'hey') {
      return {
        type: 'text',
        content: "Welcome to Ceylon Circuit! 🌴 Before we start planning your perfect Sri Lankan adventure, I'd love to know - have you visited our beautiful island before? This will help me tailor the perfect experience for you.",
        suggestions: ['Yes, I have visited before', 'No, first time visiting'],
        stage: 'greeting'
      };
    }

    // Handle first-time vs returning visitor response
    if (memory.stage === 'greeting') {
      if (lastMessage.includes('no') || lastMessage.includes('first time')) {
        memory.setReturningTraveler(false);
        return {
          type: 'text',
          content: "Welcome to Sri Lanka! 🌺 How many days would you like to spend exploring our beautiful country? I can help you plan an amazing itinerary for 3, 5, 7, or 10 days.",
          suggestions: ['3 days', '5 days', '7 days', '10 days'],
          stage: 'collecting_duration'
        };
      } else if (lastMessage.includes('yes') || lastMessage.includes('visited before')) {
        memory.setReturningTraveler(true);
        return {
          type: 'text',
          content: "Great to have you back! 🙏 Could you tell me which places in Sri Lanka you've visited before? This will help me suggest new destinations for your current trip.",
          suggestions: ['Kandy', 'Colombo', 'Galle', 'Sigiriya', 'Nuwara Eliya'],
          stage: 'collecting_previous_visits'
        };
      }
    }

    // Handle duration selection
    if (memory.stage === 'collecting_duration') {
      const durationMatch = lastMessage.match(/(\d+)\s*(day|days)?/i);
      if (durationMatch) {
        const duration = parseInt(durationMatch[1]);
        memory.setDuration(duration);
        
        // Get available destinations
        const destinations = await getRecommendedDestinations(duration, memory.isReturningTraveler);
        
        return {
          type: 'destination_tiles',
          content: {
            message: `Perfect! Let's plan your ${duration}-day adventure in Sri Lanka. 🗺️ For Day 1, which destinations would you like to visit? You can select multiple destinations for each day.`,
            tiles: destinations.map(dest => ({
              id: dest._id,
              name: dest.name,
              category: dest.category,
              location: `${dest.location.district}, ${dest.location.province}`,
              summary: dest.summary,
              image: dest.mainImage || (dest.images && dest.images[0])
            }))
          },
          suggestions: [
            "Show me cultural sites",
            "I prefer beaches",
            "Looking for wildlife",
            "Mountain areas"
          ],
          stage: 'collecting_day_details'
        };
      }
    }

    // Handle destination selection
    if (memory.stage === 'collecting_day_details') {
      const mentionedDestination = findMentionedDestination(lastMessage, dbResources.destinations);
      if (mentionedDestination) {
        try {
          // Add the destination to the current day's plan
          memory.addDayDestination(memory.currentDay, mentionedDestination.name);
          
          // Get nearby accommodations
          const nearbyAccommodations = await getNearbyAccommodations(mentionedDestination.location.district);
          
          return {
            type: 'accommodation_tiles',
            content: {
              message: `Great choice! ${mentionedDestination.name} is a fantastic destination. 🏛️\n\nWould you like to stay nearby? Here are some recommended accommodations in the area:`,
              tiles: nearbyAccommodations.map(acc => ({
                id: acc._id,
                name: acc.name,
                type: acc.type,
                location: acc.location,
                price: acc.price,
                amenities: acc.amenities,
                image: acc.image
              }))
            },
            suggestions: [
              "Show me budget options",
              "I prefer luxury hotels",
              "Any boutique hotels?",
              "Show different area"
            ],
            stage: 'collecting_day_details'
          };
        } catch (error) {
          console.error('Error processing destination:', error);
          throw error;
        }
      }
    }

    // If no specific condition is met, use GPT to generate a contextual response
    const systemPrompt = `You are a friendly Sri Lankan travel assistant. Help the user plan their perfect trip.
Current stage: ${memory.stage}
User status: ${memory.isReturningTraveler ? 'Returning visitor' : 'First-time visitor'}
${memory.duration ? `Trip duration: ${memory.duration} days` : ''}
${memory.currentDay ? `Current day: Day ${memory.currentDay}` : ''}
${memory.dayPlans.size > 0 ? `Selected destinations: ${[...memory.dayPlans.values()].flatMap(p => p.destinations).join(', ')}` : ''}

Be friendly, professional, and use emojis occasionally. Keep responses concise and focused on the current stage.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseText = completion.choices[0].message.content;
    return {
      type: 'text',
      content: responseText,
      suggestions: getSuggestionsByStage(memory.stage),
      stage: memory.stage
    };

  } catch (error) {
    console.error('Error in generateChatResponse:', error);
    throw error;
  }
};

function getSuggestionsByStage(stage) {
  switch (stage) {
    case 'greeting':
      return ['Yes, I have visited before', 'No, first time visiting'];
    case 'collecting_duration':
      return ['3 days', '5 days', '7 days', '10 days'];
    case 'collecting_day_details':
      return [
        "Show me cultural sites",
        "I prefer beaches",
        "Looking for wildlife",
        "Mountain areas"
      ];
    default:
      return [
        "Tell me more",
        "Show me destinations",
        "Help me plan"
      ];
  }
}

export default {
  generateChatResponse,
  generateTripPlanWithAI
}; 