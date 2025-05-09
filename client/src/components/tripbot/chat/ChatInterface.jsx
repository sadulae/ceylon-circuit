import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Avatar,
  Chip,
  Button,
  Divider,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  TravelExplore as TravelExploreIcon,
  Article as ArticleIcon,
  NavigateNext as NavigateNextIcon,
  Check as CheckIcon,
  LocationOn as LocationOn,
} from '@mui/icons-material';
import axios from 'axios';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

// Helper function to format image URLs (copied from imageUtils.js)
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'http://localhost:5000/uploads/no-image.jpg';
  
  // If the URL is already absolute (starts with http or https), use as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a local path starting with /uploads, prepend server URL
  if (imageUrl.startsWith('/uploads/')) {
    return `http://localhost:5000${imageUrl}`;
  }
  
  // Otherwise, assume it's a filename and prepend the server URL and uploads path
  return `http://localhost:5000/uploads/${imageUrl}`;
};

const ChatInterface = ({ onTripPlanGenerated }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(() => `tripbot-${Date.now()}`);
  const [showTripPlanButton, setShowTripPlanButton] = useState(false);
  const [tripPlanData, setTripPlanData] = useState(null);
  const [planningMode, setPlanningMode] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState({});
  const [selectedAccommodation, setSelectedAccommodation] = useState({});
  const [tripDuration, setTripDuration] = useState(0);
  const messagesEndRef = useRef(null);

  // Add a more dynamic conversation memory
  const [conversationContext, setConversationContext] = useState({
    lastDiscussedDestination: null,
    mentionedActivities: [],
    recentInterests: [],
    buttonSelectionCount: 0
  });

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    scrollToBottom();
    // Add a small delay to make sure content is rendered before scrolling
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);
  
  // Also scroll to bottom on initial load
  useEffect(() => {
    scrollToBottom();
  }, []);

  // Initialize chat with welcome message from API
  useEffect(() => {
    const fetchInitialGreeting = async () => {
      try {
        setIsLoading(true);
        // Make API call to get greeting from OpenAI
        const response = await axios.post('/api/tripbot/greeting', {
          sessionId: sessionId
        });
        
        console.log('Greeting API response:', response.data);
        
        // Use the API response for greeting if available
        let greetingMessage = '';
        
        if (response.data && response.data.success && response.data.greeting) {
          console.log('Using API greeting:', response.data.greeting);
          greetingMessage = response.data.greeting;
        } else {
          console.log('API greeting not available, using fallback');
          greetingMessage = "Welcome to Ceylon Circuit! 🌴 I'm your AI travel assistant. How many days are you planning to stay in Sri Lanka?";
        }
        
        const initialMessage = {
          type: 'bot',
          content: greetingMessage,
          suggestions: ['2 days', '3 days', '5 days', '7 days'],
          expectingDuration: true,
          id: `greeting-${Date.now()}`
        };
        
        setMessages([initialMessage]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching greeting:', error);
        // Fallback to default greeting if API fails
        const initialMessage = {
          type: 'bot',
          content: "Welcome to Ceylon Circuit! 🌴 I'm your AI travel assistant. How many days are you planning to stay in Sri Lanka?",
          suggestions: ['2 days', '3 days', '5 days', '7 days'],
          expectingDuration: true,
          id: `greeting-fallback-${Date.now()}`
        };
        
        setMessages([initialMessage]);
        setIsLoading(false);
      }
    };
    
    // Reset any previous session data
    setTripDuration(0);
    setSelectedDestinations({});
    setSelectedAccommodation({});
    setTripPlanData(null);
    
    // Fetch greeting and destinations
    fetchInitialGreeting();
    
    // Fetch destinations from the API when component mounts
    const fetchData = async () => {
      try {
        // Add a timeout to the API call to avoid long loading times
        const fetchPromise = fetchDestinations();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API call timed out')), 5000)
        );
        
        await Promise.race([fetchPromise, timeoutPromise]);
      } catch (error) {
        console.error('Error initializing destinations:', error);
        // Ensure we have at least the fallback destinations
        setAvailableDestinations(DATABASE_DESTINATIONS);
      }
    };
    
    fetchData();
  }, [sessionId]);

  // Fetch available destinations from the backend
  const fetchDestinations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/destinations');
      
      // Debug: Log the raw API response
      console.log('API Response:', response.data);
      
      // Check if we received an array directly or if it's nested in a data property
      let destinationsData = [];
      
      if (Array.isArray(response.data)) {
        destinationsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        destinationsData = response.data.data;
      } else if (response.data && response.data.success) {
        // If API returns success but data is empty or not an array, use fallback
        console.log('API returned success but no valid destinations array, using fallback');
        destinationsData = DATABASE_DESTINATIONS;
      } else {
        // If we can't determine the data structure, use fallback
        console.log('Unrecognized API response format, using fallback');
        destinationsData = DATABASE_DESTINATIONS;
      }
      
      // Ensure we have at least some destinations by falling back if the array is empty
      if (!destinationsData || destinationsData.length === 0) {
        console.log('API returned empty destinations array, using fallback');
        destinationsData = DATABASE_DESTINATIONS;
      }
      
      // Debug: Log a sample destination to inspect structure
      if (destinationsData.length > 0) {
        console.log('Sample destination:', destinationsData[0]);
        console.log('Sample destination image fields:', {
          mainImage: destinationsData[0].mainImage,
          images: destinationsData[0].images,
          image: destinationsData[0].image
        });
      }
      
      // Format image URLs for the destinations
      const formattedDestinations = destinationsData.map(dest => ({
        ...dest,
        // Ensure image property uses the correct URL format
        image: dest.mainImage || (dest.images && dest.images.length > 0 ? dest.images[0] : null)
      }));
      
      // Debug: Log a sample formatted destination
      if (formattedDestinations.length > 0) {
        console.log('Sample formatted destination:', formattedDestinations[0]);
        console.log('Image URL after formatting:', getImageUrl(formattedDestinations[0].image));
      }
      
      // Update availableDestinations with the data
      setAvailableDestinations(formattedDestinations);
      console.log('Set destinations:', formattedDestinations);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setError('Failed to load destinations. Using demo destinations instead.');
      // Fall back to demo destinations if API fails
      setAvailableDestinations(DATABASE_DESTINATIONS);
      console.log('Using fallback destinations:', DATABASE_DESTINATIONS);
      setIsLoading(false);
    }
  };

  // Our official list of database destinations - used as fallback if API fails
  // IMPORTANT: Keep this in sync with ChatMessage.js DATABASE_DESTINATIONS
  const DATABASE_DESTINATIONS = [
    { id: 1, name: 'Sigiriya Rock Fortress', category: 'Historical', location: { district: 'Matale', province: 'Central' }, image: 'https://source.unsplash.com/featured/?sigiriya' },
    { id: 2, name: 'Mirissa Beach', category: 'Beach', location: { district: 'Matara', province: 'Southern' }, image: 'https://source.unsplash.com/featured/?beach,srilanka' },
    { id: 3, name: 'Ella Rock', category: 'Nature', location: { district: 'Badulla', province: 'Uva' }, image: 'https://source.unsplash.com/featured/?ella,srilanka' },
    { id: 4, name: 'Temple of the Tooth', category: 'Religious', location: { district: 'Kandy', province: 'Central' }, image: 'https://source.unsplash.com/featured/?temple,srilanka' },
    { id: 5, name: 'Yala National Park', category: 'Wildlife', location: { district: 'Hambantota', province: 'Southern' }, image: 'https://source.unsplash.com/featured/?wildlife,srilanka' },
    { id: 6, name: 'Galle Fort', category: 'Historical', location: { district: 'Galle', province: 'Southern' }, image: 'https://source.unsplash.com/featured/?galle,srilanka' },
  ];

  // Helper function to generate conversational responses
  const getConversationalResponse = (type, data = {}) => {
    // Input validation - ensure all required data is present
    if (!data || typeof data !== 'object') {
      console.error('Invalid data passed to getConversationalResponse:', data);
      // Return fallback responses if data is invalid
      const fallbacks = {
        destinationSelected: "Great choice! This destination will be a wonderful part of your trip.",
        accommodationSelected: "Excellent accommodation choice!",
        dayTransition: "Now let's continue planning your trip!",
        suggestion: "You might also want to consider other destinations in our database."
      };
      return fallbacks[type] || "Let's continue planning your trip!";
    }
    
    // Increment button selection count
    const newCount = conversationContext.buttonSelectionCount + 1;
    setConversationContext(prev => ({
      ...prev,
      buttonSelectionCount: newCount
    }));
    
    // Ensure the data has all required properties with fallbacks
    const safeData = {
      name: data.name || 'this destination',
      category: data.category || 'destination',
      province: data.province || 'Sri Lanka',
      day: data.day || currentDay,
      location: data.location || 'the area',
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : []
    };
    
    // Variety of responses for different interaction types
    const responses = {
      destinationSelected: [
        `Excellent choice! ${safeData.name} is one of Sri Lanka's treasures in the ${safeData.province} province.`,
        `${safeData.name} is a wonderful pick! Visitors often rave about this ${safeData.category.toLowerCase()} destination.`,
        `I love ${safeData.name}! It's a perfect choice for experiencing Sri Lankan ${safeData.category.toLowerCase()}.`,
        `${safeData.name} is a fantastic selection! This ${safeData.category.toLowerCase()} gem will be a highlight of day ${safeData.day}.`
      ],
      accommodationSelected: [
        `Perfect! ${safeData.name} will be a comfortable base for exploring nearby attractions.`,
        `Great choice! ${safeData.name} offers a wonderful place to relax after your day of exploration.`,
        `${safeData.name} is an excellent pick! You'll enjoy your stay there.`,
        `I think you'll love staying at ${safeData.name}! It's a favorite among travelers.`
      ],
      dayTransition: [
        `Now let's figure out what you'd like to do on day ${safeData.day}!`,
        `Moving on to day ${safeData.day}! What kind of experiences are you looking for?`,
        `Let's plan your adventures for day ${safeData.day}!`,
        `For day ${safeData.day}, let's discover some amazing places!`
      ],
      suggestion: [
        safeData.suggestions.length ? `You might also enjoy visiting ${safeData.suggestions.join(' or ')} since they're in our database of vetted destinations.` : 'We have other great destinations in our database you might enjoy as well.',
        safeData.suggestions.length ? `I can also recommend ${safeData.suggestions.join(' or ')} from our collection of destinations.` : 'Consider exploring our other database destinations as well.',
        safeData.suggestions.length ? `${safeData.suggestions.join(' and ')} would complement your itinerary nicely - they're also available in our system.` : 'There are several other complementary destinations available in our system.',
        safeData.suggestions.length ? `Based on your interests, you might want to consider ${safeData.suggestions.join(' or ')} as well.` : 'Based on your interests, you might want to explore our other destinations as well.'
      ]
    };
    
    // Select a response based on button selection count to add variety
    const index = newCount % responses[type].length;
    return responses[type][index];
  };

  // Helper function to get valid database suggestions
  const getValidDatabaseSuggestions = (currentDestination, currentDay) => {
    if (!currentDestination || !currentDestination.name) {
      return [];
    }
    
    // Only suggest destinations from our database
    const remainingSuggestions = availableDestinations
      .filter(dest => {
        // Don't suggest the current destination
        if (dest.name === currentDestination.name) return false;
        
        // Don't suggest destinations already selected for this day
        const alreadySelectedForDay = selectedDestinations[currentDay]?.some(d => d.name === dest.name);
        if (alreadySelectedForDay) return false;
        
        return true;
      })
      .slice(0, 2);
    
    return remainingSuggestions.map(d => d.name);
  };

  const handleSendMessage = async (messageText) => {
    try {
      setError(null);
      const userMessage = messageText;
      if (!userMessage || !userMessage.trim()) return;

      // Add user message to chat
      const newUserMessage = { type: 'user', content: userMessage, id: `user-${Date.now()}` };
      setMessages(prev => [...prev, newUserMessage]);

      // Check if message is off-topic (not travel related)
      const offTopicKeywords = [
        'largest country', 'capital of', 'population of', 'president of', 
        'who is', 'what is', 'when was', 'how many', 'tell me about',
        'math', 'calculate', 'solve', 'weather in', 'temperature'
      ];
      
      const isOffTopic = offTopicKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (isOffTopic && !userMessage.toLowerCase().includes('sri lanka')) {
        // Respond with a redirection to travel planning
        setMessages(prev => [...prev, {
          type: 'bot',
          content: "I'm focused on helping you plan your perfect Sri Lanka trip. Let's stay on topic and continue with your travel planning. What else would you like to know about destinations or accommodations in Sri Lanka?",
          suggestions: ['Show destinations', 'Tell me about accommodations', 'Sri Lanka travel tips'],
          id: `redirect-${Date.now()}`
        }]);
        return;
      }

      // Ensure availableDestinations is an array before using map
      const availableDestNames = Array.isArray(availableDestinations) 
        ? availableDestinations.map(d => d.name?.toLowerCase()).filter(Boolean)
        : [];
      
      // Create a list of non-database destinations by comparing available destinations
      const nonDbDestinations = [
        'Anuradhapura', 'Polonnaruwa', 'Dambulla', 'Nuwara Eliya', 'Colombo', 
        'Jaffna', 'Trincomalee', 'Arugam Bay', 'Negombo', 'Hikkaduwa', 
        'Batticaloa', 'Unawatuna', 'Bentota', 'Matara', 'Beruwala', 'Kandy'
      ].filter(dest => !availableDestNames.includes(dest.toLowerCase()));
      
      const mentionedNonDbDest = nonDbDestinations.find(dest => 
        userMessage.toLowerCase().includes(dest.toLowerCase())
      );
      
      if (mentionedNonDbDest) {
        // Add user message to chat
        const newUserMessage = { type: 'user', content: userMessage };
        setMessages(prev => [...prev, newUserMessage]);
        
        // Respond with a clarification about available destinations
        setMessages(prev => [...prev, {
          type: 'bot',
          content: `I notice you mentioned ${mentionedNonDbDest}, which isn't one of our database destinations. Let me show you the destinations we do have available that you can include in your itinerary:`,
          suggestions: ['Show available destinations', 'Tell me about Sri Lanka']
        }]);
        
        // Show destinations after a short delay
        setTimeout(() => {
          fetchAndShowDestinations();
        }, 1000);
        
        return;
      }

      // Additional check for when users ask about specific places by name
      const mentionsSpecificDestination = Array.isArray(availableDestinations) && availableDestinations.some(dest => 
        dest.name && userMessage.toLowerCase().includes(dest.name.toLowerCase())
      );
      
      if (mentionsSpecificDestination) {
        // Add user message to chat
        const newUserMessage = { type: 'user', content: userMessage };
        setMessages(prev => [...prev, newUserMessage]);
        
        // Add a conversational response about the destination
        const botResponse = {
          type: 'bot',
          content: 'That sounds like a great destination to include in your trip! Let me show you all the places in our database that you can select:',
        };
        
        setMessages(prev => [...prev, botResponse]);
        
        // Immediately show destinations
        setTimeout(() => {
          fetchAndShowDestinations();
        }, 300);
        setIsLoading(false);
        return;
      }

      // Additional keywords that should trigger destinations
      const destinationTriggerPhrases = [
        'where can i go', 'where to go', 'places to visit',
        'recommend destination', 'suggest place', 'popular destination',
        'destination option', 'available destination', 'where to visit',
        'which place', 'top place', 'best destination', 'tourist spot',
        'attraction', 'landmark', 'site to see', 'recommendation'
      ];
      
      const containsDestinationTrigger = destinationTriggerPhrases.some(phrase => 
        userMessage.toLowerCase().includes(phrase.toLowerCase())
      );
      
      if (containsDestinationTrigger) {
        // Add a quick bot response
        const botResponse = {
          type: 'bot',
          content: 'Here are all the destinations in our database. These are the only places we can include in your itinerary. Please select the ones you\'re interested in:',
        };
        
        setMessages(prev => [...prev, botResponse]);
        
        // Immediately show destinations
        setTimeout(() => {
          fetchAndShowDestinations();
        }, 300);
        setIsLoading(false);
        return;
      }

      // Check for interests or "any" to immediately show destinations
      const interestKeywords = ['beach', 'wildlife', 'culture', 'adventure', 'food', 'history', 'any', 'all', 'everything', 'mix'];
      const hasInterestKeyword = interestKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword.toLowerCase())
      );

      // Check if they've already specified a duration and now expressing interests
      if (tripDuration > 0 && hasInterestKeyword) {
        // Don't wait for AI response, immediately show destinations
        if (userMessage.toLowerCase().includes('any') || userMessage.toLowerCase().includes('all') || 
            userMessage.toLowerCase().includes('everything') || userMessage.toLowerCase().includes('mix')) {
          // If they say "any" or "all" interests, just store basic interest info
          setTripPlanData(prev => ({
            ...prev,
            interests: ['general tourism']
          }));
        } else {
          // Store specific interests mentioned
          const mentionedInterests = interestKeywords.filter(keyword => 
            userMessage.toLowerCase().includes(keyword.toLowerCase())
          );
          setTripPlanData(prev => ({
            ...prev,
            interests: mentionedInterests
          }));
        }
        
        // Add a quick bot response about showing destinations
        const botResponse = {
          type: 'bot',
          content: 'Great! Based on your interests, here are destinations from our database that you can choose for your trip:',
        };
        
        setMessages(prev => [...prev, botResponse]);
        
        // Immediately show destinations without waiting for AI
        setTimeout(() => {
          fetchAndShowDestinations();
        }, 300);
        
        setIsLoading(false);
        return;
      }

      // Continue with normal API call for other types of messages
      // Get all previous messages for context
      const messageHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      messageHistory.push({
        role: 'user',
        content: userMessage
      });

      // Special keyword handling
      if (userMessage.toLowerCase().includes('show destinations') || userMessage.includes('show places')) {
        await fetchAndShowDestinations();
        return;
      }

      // Process duration selection if a number of days is mentioned
      const durationMatch = userMessage.match(/(\d+)\s*days?/i);
      if (durationMatch && !tripDuration) {
        const days = parseInt(durationMatch[1]);
        handleDurationSelect(days);
        return;
      }

      // Send request to backend
      const response = await axios.post('/api/tripbot/chat', {
        message: userMessage,
        context: messageHistory,
        sessionId: sessionId,
        tripData: tripPlanData
      });

      if (response.data.success) {
        const botResponse = response.data.response;
        
        // Always add the AI's text response to the chat
        setMessages(prev => [...prev, {
          type: 'bot',
          content: botResponse.content,
          suggestions: botResponse.suggestions || []
        }]);
        
        // Process different response types
        if (botResponse.showDestinations || (tripDuration > 0 && !planningMode)) {
          // Show destinations after AI response
          setTimeout(() => {
            fetchAndShowDestinations();
          }, 1000);
        } else if (botResponse.askForDuration) {
          // AI wants to ask about trip duration
          const durationMessage = {
            type: 'bot',
            content: 'How many days would you like to spend in Sri Lanka?',
            suggestions: ['3 days', '5 days', '7 days', '10 days'],
            expectingDuration: true
          };
          setMessages(prev => [...prev, durationMessage]);
        } else if (botResponse.generatePlan && botResponse.tripData) {
          // AI has all info needed, but we'll still show destinations for user selection
          setTripPlanData({
            duration: botResponse.tripData.duration || 7,
            interests: botResponse.tripData.interests || [],
            budget: botResponse.tripData.budget || 'moderate',
            pace: botResponse.tripData.pace || 'moderate',
            selectedDestinations: selectedDestinations
          });
          
          // Always show destinations instead of generating plan automatically
          setTimeout(() => {
            fetchAndShowDestinations();
          }, 1000);
        }
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error:', error);
      setError("I apologize, but I'm having trouble connecting to the server. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndShowDestinations = async () => {
    try {
      setIsLoading(true);
      setPlanningMode(true);
      
      // Use the already fetched destinations from the API
      // If availableDestinations is empty, fetch them now
      if (!availableDestinations || availableDestinations.length === 0) {
        try {
          await fetchDestinations();
          
          // Double-check if destinations were loaded
          if (!availableDestinations || availableDestinations.length === 0) {
            console.log('Still no destinations after fetch, using fallback');
            setAvailableDestinations(DATABASE_DESTINATIONS);
          }
        } catch (error) {
          console.error('Error fetching destinations:', error);
          // Ensure we use fallback destinations
          setAvailableDestinations(DATABASE_DESTINATIONS);
        }
      }
      
      // At this point, we should have either API destinations or fallback destinations
      // Create a local reference to ensure we have destinations to display
      const destinationsToUse = 
        availableDestinations && availableDestinations.length > 0 
          ? availableDestinations 
          : DATABASE_DESTINATIONS;
      
      // Check if there are any existing selections for this day
      const existingSelections = selectedDestinations[currentDay] || [];
      const selectionText = existingSelections.length > 0 
        ? `Day ${currentDay}: You already have ${existingSelections.length} destination(s) selected for this day. You can add more or remove existing selections.` 
        : `Day ${currentDay}: Please select YOUR destination choices by clicking the cards below. These are the ONLY ${destinationsToUse.length} destinations available in our database. YOU have full control over your itinerary.`;
      
      const destinationMessage = {
        type: 'bot',
        content: selectionText,
        showDestinations: true,
        id: `destination-selection-${currentDay}-${Date.now()}`
      };
      
      setMessages(prev => [...prev, destinationMessage]);
      
      // Add instruction about accommodation selection after destinations
      const helpMessage = {
        type: 'bot',
        content: 'After selecting destinations, you\'ll choose accommodations for each day. Then click "Generate My Trip Plan" to create an itinerary based on YOUR selections.',
        suggestions: ['Tell me about these places', `How many destinations can I select for day ${currentDay}?`],
        id: `destination-help-${Date.now()}`
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, helpMessage]);
      }, 1000);
      
    } catch (error) {
      console.error('Error showing destinations:', error);
      setError('Failed to load destinations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDurationSelect = (days) => {
    // Set trip duration
    setTripDuration(days);
    
    // Add user message to chat for selected duration
    const userMessage = {
      type: 'user',
      content: `${days} days`,
      id: `duration-select-${Date.now()}`
    };
    
    // Add message to chat asking for interests
    const message = {
      type: 'bot',
      content: `Great! A ${days}-day trip gives us plenty to work with. What are your main interests for this trip? For example: beaches, wildlife, culture, adventure, food, or history?`,
      suggestions: ['Culture and history', 'Beaches and relaxation', 'Wildlife and nature', 'Mix of everything'],
      id: `interests-prompt-${Date.now()}`
    };
    
    setMessages(prev => [...prev, userMessage, message]);
    
    // Update trip data
    setTripPlanData(prev => ({
      ...prev,
      duration: days
    }));
    
    // Reset any existing selections when duration changes
    setSelectedDestinations({});
    setSelectedAccommodation({});
    setCurrentDay(1);
    
    // Ensure destinations are loaded for when the user selects interests
    if (!availableDestinations || availableDestinations.length === 0) {
      console.log('No destinations available, loading destinations');
      // If no destinations are available, try loading them now
      try {
        fetchDestinations();
      } catch (error) {
        console.error('Error loading destinations after duration selection:', error);
        // Use fallback destinations
        setAvailableDestinations(DATABASE_DESTINATIONS);
      }
    }
  };

  const handleInterestSelection = (interests) => {
    // Parse interests from the message
    let interestList = [];
    
    if (interests.toLowerCase().includes('mix of everything') || 
        interests.toLowerCase().includes('all') || 
        interests.toLowerCase().includes('any')) {
      interestList = ['culture', 'beach', 'wildlife', 'food', 'history'];
    } else {
      const interestKeywords = ['culture', 'beach', 'wildlife', 'nature', 'adventure', 'food', 'history'];
      interestList = interestKeywords.filter(keyword => 
        interests.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    
    // Update trip data with interests
    setTripPlanData(prev => ({
      ...prev,
      interests: interestList
    }));
    
    // Add user message to chat
    const userMessage = {
      type: 'user',
      content: interests,
      id: `interest-selection-${Date.now()}`
    };
    
    // Add bot response about showing destinations
    const botMessage = {
      type: 'bot',
      content: 'Perfect! Based on your interests, here are the destinations available in our database for you to select from:',
      id: `destination-prompt-${Date.now()}`
    };
    
    setMessages(prev => [...prev, userMessage, botMessage]);
    
    // Show destinations after asking for interests
    setTimeout(() => {
      fetchAndShowDestinations();
    }, 300);
  };

  const handleDestinationSelect = (destination) => {
    // Input validation
    if (!destination || !destination.id) {
      console.error('Invalid destination selected:', destination);
      return;
    }
    
    // Add the destination to the selected destinations list
    setSelectedDestinations(prev => {
      const day = currentDay || 1;
      // Check if this destination is already selected for this day
      const isCurrentlySelected = prev[day]?.some(d => d.id === destination.id);
      
      if (isCurrentlySelected) {
        // Remove the destination if it's already selected
        return {
          ...prev,
          [day]: prev[day].filter(d => d.id !== destination.id)
        };
      } else {
        // Add the destination if it's not already selected
        return {
          ...prev,
          [day]: [...(prev[day] || []), destination]
        };
      }
    });
    
    // Update conversation context
    setConversationContext(prev => ({
      ...prev,
      lastDiscussedDestination: destination.name
    }));
    
    // Add messages to chat
    const userMessage = {
      type: 'user',
      content: `I want to visit ${destination.name} on day ${currentDay}`,
      id: `destination-selection-${destination.id}-${Date.now()}`
    };
    
    // Get only valid database suggestions
    const validSuggestions = getValidDatabaseSuggestions(destination, currentDay);
    
    // Create suggestion text using only database destinations
    let suggestionText = '';
    if (validSuggestions.length > 0) {
      suggestionText = ' ' + getConversationalResponse('suggestion', {
        suggestions: validSuggestions
      });
    }
    
    // Check if this destination is already selected for this day before the current update
    const isCurrentlySelected = selectedDestinations[currentDay]?.some(d => d.id === destination.id);
    
    // Calculate how many destinations are selected for this day after the current update
    const updatedDaySelections = selectedDestinations[currentDay] || [];
    const selectionCount = isCurrentlySelected ? updatedDaySelections.length - 1 : updatedDaySelections.length + 1;
    
    let botMessage;
    
    if (selectionCount === 0) {
      // If user removed the only selection, just acknowledge and provide guidance
      botMessage = {
        type: 'bot',
        content: `You've removed ${destination.name} from your day ${currentDay} itinerary. Please select at least one destination for this day.`,
        suggestions: ['Show all destinations'],
        id: `destination-removed-${destination.id}-${Date.now()}`
      };
    } else {
      // Get conversational response for destination selection
      const destinationResponse = getConversationalResponse('destinationSelected', {
        name: destination.name,
        category: destination.category,
        province: destination.location.province,
        day: currentDay
      });
      
      // Normal response for selections
      botMessage = {
        type: 'bot',
        content: `${destinationResponse}${suggestionText}`,
        suggestions: ['Add more destinations for this day', 'Choose accommodations', `Continue to day ${currentDay < tripDuration ? currentDay + 1 : 1}`],
        id: `destination-added-${destination.id}-${Date.now()}`
      };
    }
    
    setMessages(prev => [...prev, userMessage, botMessage]);
    
    // Make generate trip plan button visible after first selection
    setShowTripPlanButton(true);
    
    // If this is a new selection (not a removal) and they have selected at least one destination,
    // prompt to select accommodations after a short delay
    setTimeout(() => {
      const currentSelections = selectedDestinations[currentDay] || [];
      if (currentSelections.length > 0 && !selectedAccommodation[currentDay]) {
        // Add a prompt to choose accommodations for this day
        const accommodationPrompt = {
          type: 'bot',
          content: `Would you like to choose accommodations for day ${currentDay} now, or would you prefer to add more destinations first?`,
          suggestions: [`Choose accommodations for day ${currentDay}`, 
                       'Add more destinations',
                       currentDay < tripDuration ? `Continue to day ${currentDay + 1}` : 'Generate my trip plan'],
          id: `accommodation-prompt-${currentDay}-${Date.now()}`
        };
        setMessages(prev => [...prev, accommodationPrompt]);
      }
    }, 2000);
  };

  const generateTripPlan = async (tripDataParam = null) => {
    try {
      setIsLoading(true);
      
      // Check if trip duration is set
      if (!tripDuration || tripDuration <= 0) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'Please specify how many days you\'ll be staying in Sri Lanka before generating a trip plan.',
          suggestions: ['2 days', '3 days', '5 days', '7 days']
        }]);
        setIsLoading(false);
        return;
      }
      
      // Create a bot message indicating that we're generating the plan
      const generatingMessage = { 
        type: 'bot', 
        content: `I'm generating your ${tripDuration}-day travel plan based on YOUR selected destinations and accommodations. This will include activities and travel tips...` 
      };
      setMessages(prev => [...prev, generatingMessage]);
      
      // Check if we have any selected destinations
      const hasSelections = Object.values(selectedDestinations).some(arr => arr.length > 0);
      
      if (!hasSelections) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'Please select at least one destination for your trip by clicking on the destination cards above.',
          suggestions: ['Show destinations again', 'Tell me about Sri Lanka']
        }]);
        setIsLoading(false);
        return;
      }
      
      // Check if there are any days without destinations selected
      const missingDays = [];
      for (let day = 1; day <= tripDuration; day++) {
        if (!selectedDestinations[day] || selectedDestinations[day].length === 0) {
          missingDays.push(day);
        }
      }
      
      if (missingDays.length > 0) {
        // Prompt to select destinations for the first missing day
        const dayToSelect = missingDays[0];
        const promptMessage = {
          type: 'bot',
          content: `Before I generate your trip plan, please select destinations for day ${dayToSelect}.`,
          suggestions: [`Plan day ${dayToSelect}`]
        };
        setMessages(prev => [...prev, promptMessage]);
        
        // Update current day
        setCurrentDay(dayToSelect);
        
        // Show destinations for this day
        setTimeout(() => {
          fetchAndShowDestinations();
        }, 1000);
        
        setIsLoading(false);
        return;
      }
      
      // Check if any days are missing accommodations and prompt for selection
      const missingAccommodations = [];
      for (let day = 1; day <= tripDuration; day++) {
        if (selectedDestinations[day]?.length > 0 && !selectedAccommodation[day]) {
          missingAccommodations.push(day);
        }
      }
      
      if (missingAccommodations.length > 0) {
        // Prompt to select accommodation for the first missing day
        const dayToSelect = missingAccommodations[0];
        const promptMessage = {
          type: 'bot',
          content: `Before I generate your trip plan, please select an accommodation for day ${dayToSelect}.`,
          suggestions: [`Choose accommodation for day ${dayToSelect}`]
        };
        setMessages(prev => [...prev, promptMessage]);
        setTimeout(() => {
          showAccommodationsForDay(dayToSelect);
        }, 1000);
        setIsLoading(false);
        return;
      }
      
      // Create a simple trip plan based on user selections
      const itinerary = [];
      
      // Use destinations and accommodations from user selections
      for (let day = 1; day <= tripDuration; day++) {
        const dayDestinations = selectedDestinations[day] || [];
        let destinations = [];
        
        if (dayDestinations.length > 0) {
          // User has selected specific destinations
          destinations = dayDestinations.map(dest => dest.name);
        } else if (Object.values(selectedDestinations).flat().length > 0) {
          // User made selections but not for this specific day - distribute them
          const allSelected = Object.values(selectedDestinations).flat();
          const index = (day - 1) % allSelected.length;
          destinations = [allSelected[index].name];
        } else {
          // Fallback - this should never happen now
          destinations = ['Colombo'];
        }
        
        const accommodation = selectedAccommodation[day] 
          ? selectedAccommodation[day].name
          : `Hotel near ${destinations[0] || 'Colombo'}`;
        
        const accommodationDetails = selectedAccommodation[day] 
          ? `${selectedAccommodation[day].name} (${selectedAccommodation[day].price}) with ${selectedAccommodation[day].amenities.join(', ')}`
          : `Standard accommodation near ${destinations[0] || 'Colombo'}`;
        
        // Get activities only for destinations that are in our database
        const validDestinationActivities = destinations.flatMap(dest => {
          // Only get activities for destinations that are in our database  
          const destActivities = getDestinationActivities(dest);
          return destActivities;
        });
        
        itinerary.push({
          day: day,
          title: `Day ${day}: ${destinations.join(' & ')}`,
          destinations: destinations,
          accommodation: accommodation,
          accommodationDetails: accommodationDetails,
          activities: validDestinationActivities,
          meals: {
            breakfast: 'At ' + accommodation,
            lunch: destinations.length > 0 ? `Local restaurant near ${destinations[0]}` : 'Local restaurant',
            dinner: 'Traditional Sri Lankan cuisine at ' + accommodation
          },
          description: `Explore the beautiful ${destinations.join(' and ')} on day ${day} of your Sri Lankan adventure.`,
          travelTimes: destinations.map(dest => {
            const destInfo = availableDestinations.find(d => d.name === dest);
            if (destInfo) {
              return getDestinationTravelInfo(destInfo);
            }
            return `Travel to ${dest}`;
          })
        });
      }
      
      const tripPlan = {
        title: `Your ${tripDuration}-Day Sri Lanka Adventure`,
        duration: tripDuration,
        summary: `A personalized ${tripDuration}-day journey based on YOUR destination and accommodation selections.`,
        itinerary: itinerary,
        essentials: {
          packingList: ['Light clothing', 'Sunscreen', 'Hat', 'Comfortable walking shoes', 'Camera'],
          travelTips: ['Carry some local currency', 'Respect local customs', 'Stay hydrated'],
          culturalNotes: ['Remove shoes before entering temples', 'Dress modestly at religious sites', 'Ask permission before taking photos of people'],
          estimatedCost: `$${tripDuration * 100} - $${tripDuration * 200} USD per person`
        }
      };
      
      // Add confirmation message to chat
      const confirmationMessage = { 
        type: 'bot', 
        content: `Great! I've created your ${tripDuration}-day Sri Lanka trip plan based on YOUR destination and accommodation selections. You can now view it in detail in the Trip Plan tab.`,
        suggestions: ['View my trip plan', 'Start over']
      };
      setMessages(prev => [...prev, confirmationMessage]);
      
      // Call the parent component's callback with the generated plan
      onTripPlanGenerated(tripPlan);
    } catch (error) {
      console.error('Error generating trip plan:', error);
      setError("I apologize, but I couldn't generate your trip plan. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const initialMessage = {
      type: 'bot',
      content: "Welcome to Ceylon Circuit! 🌴 I'm your AI travel assistant. How many days are you planning to stay in Sri Lanka?",
      suggestions: ['2 days', '3 days', '5 days', '7 days'],
      expectingDuration: true,
      id: `initial-greeting-${Date.now()}`
    };
    
    setMessages([initialMessage]);
    setSessionId(`tripbot-${Date.now()}`);
    setShowTripPlanButton(false);
    setTripPlanData(null);
    setError(null);
    setPlanningMode(false);
    setCurrentDay(1);
    setAvailableDestinations([]);
    setSelectedDestinations({});
    setSelectedAccommodation({});
    setTripDuration(0);
  };

  // Process message or suggestion based on content
  const processMessage = (message) => {
    // Special handling for accommodation-related messages
    if (message.toLowerCase().includes('choose accommodations') || 
        message.toLowerCase().includes('select accommodations')) {
        
      // Extract day number if present in the message
      const dayMatch = message.match(/day\s*(\d+)/i);
      const dayToUse = dayMatch ? parseInt(dayMatch[1]) : currentDay;
      
      // Add user message to create a more conversational feel
      setMessages(prev => [...prev, { 
        type: 'user', 
        content: message,
        id: `user-accommodation-${Date.now()}`
      }]);
      
      // Add user message
      setMessages(prev => [...prev, { 
        type: 'user', 
        content: message,
        id: `user-question-${Date.now()}`
      }]);
      
      // Respond with guidance about multiple destinations
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `You can select multiple destinations for each day of your trip. This gives you complete control over your itinerary. Just click on the destination cards you're interested in. Selected destinations will be highlighted, and you can click again to remove them if you change your mind.`,
        suggestions: ['Show destinations again', 'Tips for selecting destinations'],
        id: `destination-guidance-${Date.now()}`
      }]);
      
      // Make sure the day is valid
      if (dayToUse > 0 && dayToUse <= tripDuration) {
        showAccommodationsForDay(dayToUse);
      } else {
        showAccommodationsForDay(currentDay);
      }
      return;
    }
    
    // Special handling for questions about destinations
    if (message.toLowerCase().includes('how many') && 
        (message.toLowerCase().includes('destination') || message.toLowerCase().includes('place'))) {
      
      // Add user message
      setMessages(prev => [...prev, { 
        type: 'user', 
        content: message 
      }]);
      
      // Respond with guidance about multiple destinations
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `You can select multiple destinations for each day of your trip. This gives you complete control over your itinerary. Just click on the destination cards you're interested in. Selected destinations will be highlighted, and you can click again to remove them if you change your mind.`,
        suggestions: ['Show destinations again', 'Tips for selecting destinations'],
        id: `destination-guidance-${Date.now()}`
      }]);
      return;
    }
    
    // Special handling for tips about destination selection
    if (message.toLowerCase().includes('tips') && 
        message.toLowerCase().includes('destination')) {
      
      // Add user message
      setMessages(prev => [...prev, { 
        type: 'user', 
        content: message 
      }]);
      
      // Provide tips for destination selection
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `Here are some tips for selecting destinations:\n\n1. Consider travel time between locations - try to pick destinations that are relatively close to each other for a single day\n2. Think about the types of activities you enjoy - beaches, historical sites, nature, etc.\n3. For a ${tripDuration}-day trip, selecting 1-2 destinations per day is usually ideal\n4. After selecting destinations, you'll choose accommodations nearby`,
        suggestions: ['Show destinations', 'Continue planning']
      }]);
      return;
    }
    
    // Specific handling for "continue to day X" messages
    if (message.toLowerCase().includes('continue to day')) {
      const dayMatch = message.match(/day\s*(\d+)/i);
      if (dayMatch) {
        const nextDay = parseInt(dayMatch[1]);
        if (nextDay > 0 && nextDay <= tripDuration) {
          // First check if current day has accommodations selected
          const currentSelections = selectedDestinations[currentDay] || [];
          
          if (currentSelections.length > 0 && !selectedAccommodation[currentDay] && currentDay !== nextDay) {
            // If they have destinations but no accommodation, prompt for it
            setMessages(prev => [...prev, { 
              type: 'user', 
              content: message 
            }]);
            
            // Prompt to select accommodation before continuing
            setMessages(prev => [...prev, { 
              type: 'bot', 
              content: `Before we plan day ${nextDay}, let's select accommodations for day ${currentDay}.`,
              suggestions: [`Choose accommodations for day ${currentDay}`]
            }]);
            
            setTimeout(() => {
              showAccommodationsForDay(currentDay);
            }, 1000);
            return;
          }
          
          setCurrentDay(nextDay);
          const dayPlanningMessage = {
            type: 'bot',
            content: `Let's plan day ${nextDay} of your trip! Please select destinations you'd like to visit on this day.`,
            showDestinations: true
          };
          setMessages(prev => [...prev, { type: 'user', content: message }, dayPlanningMessage]);
          fetchAndShowDestinations();
          return;
        }
      }
    }

    // Handle duration selection - comprehensive check for various formats
    const durationMatches = [
      message.match(/(\d+)\s*days?/i),                    // 2 days, 2 day
      message.match(/(\w+)\s*days?/i),                    // two days, three day
      message.match(/stay(?:ing)?\s*for\s*(\d+)/i),       // staying for 2
      message.match(/^(\d+)$/),                           // just a number
      message.match(/^(\w+)$/)                            // just a word like "two"
    ].filter(Boolean);
    
    if (durationMatches.length > 0) {
      const durationMatch = durationMatches[0];
      let days = 0;
      
      // If number is in word form, convert to numeric
      if (isNaN(parseInt(durationMatch[1]))) {
        const wordToNumber = {
          'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
          'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
        };
        
        const word = durationMatch[1].toLowerCase();
        days = wordToNumber[word] || 0;
        
        console.log("Word duration detected:", word, "converted to", days);
      } else {
        days = parseInt(durationMatch[1]);
      }
      
      if (days > 0) {
        handleDurationSelect(days);
        return;
      }
    }

    // When user says "help me plan a trip" or similar, ask for duration first
    if (message.toLowerCase().includes('help me plan') || 
        message.toLowerCase().includes('plan a trip') || 
        message.toLowerCase().includes('create itinerary') ||
        message.toLowerCase().includes('yes')) {
      
      // Always ask for duration first before anything else
      const durationMessage = {
        type: 'bot',
        content: 'Great! To start planning your trip, how many days will you be staying in Sri Lanka?',
        suggestions: ['2 days', '3 days', '5 days', '7 days'],
        expectingDuration: true
      };
      
      setMessages(prev => [...prev, { type: 'user', content: message }, durationMessage]);
      return;
    }
    
    // Check for specific actions in the content
    if (message.toLowerCase().includes('show destinations') || 
        message.toLowerCase().includes('show places')) {
      fetchAndShowDestinations();
      return;
    }
    
    // Handle next day planning
    if (message.toLowerCase().includes('plan day') && tripDuration > 0) {
      const dayMatch = message.match(/day\s*(\d+)/i);
      if (dayMatch) {
        const nextDay = parseInt(dayMatch[1]);
        if (nextDay > 0 && nextDay <= tripDuration) {
          // Check if current day has accommodations before moving to next day
          const currentSelections = selectedDestinations[currentDay] || [];
          
          if (currentSelections.length > 0 && !selectedAccommodation[currentDay] && currentDay !== nextDay) {
            // If they have destinations but no accommodation, prompt for it
            setMessages(prev => [...prev, { 
              type: 'user', 
              content: message 
            }]);
            
            // Prompt to select accommodation before continuing
            setMessages(prev => [...prev, { 
              type: 'bot', 
              content: `Before we plan day ${nextDay}, let's select accommodations for day ${currentDay}.`,
              suggestions: [`Choose accommodations for day ${currentDay}`]
            }]);
            
            setTimeout(() => {
              showAccommodationsForDay(currentDay);
            }, 1000);
            return;
          }
          
          setCurrentDay(nextDay);
          const dayPlanningMessage = {
            type: 'bot',
            content: `Let's plan day ${nextDay} of your trip! Please select destinations you'd like to visit on this day.`,
            showDestinations: true
          };
          setMessages(prev => [...prev, { type: 'user', content: message }, dayPlanningMessage]);
          fetchAndShowDestinations();
          return;
        }
      }
    }
    
    if (message.toLowerCase().includes('view my trip plan') ||
        message.toLowerCase().includes('generate my trip plan')) {
      generateTripPlan();
      return;
    }
    
    if (message.toLowerCase().includes('start over')) {
      handleReset();
      return;
    }
    
    // Default to sending the message
    handleSendMessage(message);
  };

  const renderDestinationCards = () => {
    // If no destinations available, show a better placeholder with retry option
    if (!availableDestinations || availableDestinations.length === 0) {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4, 
          px: 3,
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <CircularProgress size={36} sx={{ color: '#4FD1C5', mb: 3 }} />
          <Typography variant="h6" color="text.secondary" paragraph fontWeight={500}>
            We're having trouble loading destinations from our database.
          </Typography>
          
          <Box sx={{ mt: 3, mb: 4 }}>
            <Button 
              variant="outlined" 
              onClick={() => fetchDestinations()}
              sx={{ 
                mr: 2, 
                borderColor: '#4FD1C5', 
                color: '#4FD1C5',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontSize: '0.95rem',
                fontWeight: 500
              }}
            >
              Try Again
            </Button>
            
            <Button 
              variant="contained" 
              onClick={() => {
                // Load demo destinations
                setAvailableDestinations(DATABASE_DESTINATIONS);
                setError(null);
              }}
              sx={{ 
                bgcolor: '#4FD1C5', 
                '&:hover': { bgcolor: '#38A89D' },
                borderRadius: 2,
                px: 3,
                py: 1,
                fontSize: '0.95rem',
                fontWeight: 500,
                boxShadow: '0 4px 8px rgba(79, 209, 197, 0.3)'
              }}
            >
              Use Demo Destinations
            </Button>
          </Box>
          
          <Box sx={{ 
            mt: 4, 
            p: 3, 
            bgcolor: 'rgba(255, 179, 0, 0.1)', 
            borderRadius: 2, 
            border: '1px dashed #FFB300',
            maxWidth: '700px',
            mx: 'auto'
          }}>
            <Typography variant="subtitle1" sx={{ color: '#975A16', fontWeight: 600, mb: 2 }}>
              Demo Destinations Available:
            </Typography>
            <Grid container spacing={2}>
              {DATABASE_DESTINATIONS.map((dest, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'white', 
                    borderRadius: 2, 
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Box 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: 2, 
                        overflow: 'hidden',
                        bgcolor: '#f0f0f0',
                        flexShrink: 0
                      }}
                    >
                      <img 
                        src={getImageUrl(dest.image)} 
                        alt={dest.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://via.placeholder.com/60x60?text=${encodeURIComponent(dest.name.substring(0, 1))}`;
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#2D3748', fontWeight: 600 }}>
                        {dest.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#718096', display: 'block' }}>
                        {dest.category} • {dest.location?.province || 'Sri Lanka'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      );
    }

    // Always use available destinations from API, never hardcoded data
    let filteredDestinations = [...availableDestinations];
    
    // If we have trip data with interests, filter destinations accordingly
    if (tripPlanData?.interests && tripPlanData.interests.length > 0) {
      const interestKeywords = tripPlanData.interests.map(i => i.toLowerCase());
      
      if (interestKeywords.includes('beach') || interestKeywords.includes('beaches')) {
        filteredDestinations = filteredDestinations.filter(d => 
          d.category === 'Beach' || (d.name && d.name.toLowerCase().includes('beach'))
        );
      } else if (interestKeywords.includes('culture') || interestKeywords.includes('history') || interestKeywords.includes('historical')) {
        filteredDestinations = filteredDestinations.filter(d => 
          d.category === 'Historical' || d.category === 'Religious' || 
          (d.name && (d.name.toLowerCase().includes('temple') || d.name.toLowerCase().includes('fort')))
        );
      } else if (interestKeywords.includes('nature') || interestKeywords.includes('wildlife')) {
        filteredDestinations = filteredDestinations.filter(d => 
          d.category === 'Nature' || d.category === 'Wildlife' || 
          (d.name && (d.name.toLowerCase().includes('park') || d.name.toLowerCase().includes('rock')))
        );
      }
      
      // If filtering left us with no destinations, revert to all
      if (filteredDestinations.length === 0) {
        filteredDestinations = [...availableDestinations];
      }
    }
    
    // Get currently selected destinations for this day
    const currentDaySelections = selectedDestinations[currentDay] || [];
    
    return (
      <Box sx={{ mt: 1, maxHeight: '100%', overflow: 'auto' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
            {`Day ${currentDay}: Select destinations`}
          </Typography>
          
          <Chip 
            label={currentDaySelections.length > 0 ? 
              `${currentDaySelections.length} selected` : 
              'None selected'}
            color={currentDaySelections.length > 0 ? "primary" : "default"}
            sx={{ 
              bgcolor: currentDaySelections.length > 0 ? '#4FD1C5' : 'rgba(226, 232, 240, 0.6)',
              color: currentDaySelections.length > 0 ? 'white' : '#718096',
              fontWeight: 600
            }}
          />
        </Box>
        
        {/* Selected destinations chips */}
        {currentDaySelections.length > 0 && (
          <Box sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: 'rgba(79, 209, 197, 0.08)', 
            borderRadius: 2,
            border: '1px solid rgba(79, 209, 197, 0.2)'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#2D3748' }}>
              Your selections:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {currentDaySelections.map(dest => (
                <Chip 
                  key={dest.id}
                  label={dest.name}
                  onDelete={() => {
                    setSelectedDestinations(prev => ({
                      ...prev,
                      [currentDay]: prev[currentDay].filter(d => d.id !== dest.id)
                    }));
                  }}
                  sx={{ 
                    bgcolor: '#4FD1C5', 
                    color: 'white',
                    py: 2,
                    borderRadius: 2,
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    '& .MuiChip-deleteIcon': {
                      color: 'white',
                      '&:hover': { color: '#E53E3E' }
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        
        {/* Database destinations note */}
        <Box sx={{ 
          mb: 2, 
          p: 2, 
          bgcolor: 'rgba(255, 179, 0, 0.08)', 
          borderRadius: 2, 
          border: '1px dashed #FFB300' 
        }}>
          <Typography variant="body2" sx={{ color: '#975A16', fontWeight: 500 }}>
            ⚠️ These {availableDestinations.length} destinations are available in our database. 
            Click to add or remove from your day {currentDay} itinerary.
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {filteredDestinations.map((dest) => {
            // Check if destination is already selected for this day
            const isSelected = currentDaySelections.some(d => d.id === dest.id);
            
            // Safely access nested properties with fallbacks
            const location = dest.location || {};
            const province = location.province || 'Sri Lanka';
            const district = location.district || '';
            
            // Enhanced destination information with fallbacks
            const description = getDestinationDescription(dest);
            const highlights = getDestinationHighlights(dest);
            const travelInfo = getDestinationTravelInfo(dest);
            
            // Ensure we have a valid image URL with fallbacks
            const imageUrl = dest.image 
              ? getImageUrl(dest.image)
              : `https://source.unsplash.com/featured/?${encodeURIComponent(dest.name.split(' ')[0].toLowerCase())},srilanka`;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={dest.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    opacity: isSelected ? 1 : 0.9,
                    border: isSelected ? '2px solid #4FD1C5' : '1px solid rgba(226, 232, 240, 0.6)',
                    transition: 'all 0.3s ease-in-out',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: isSelected 
                      ? '0 8px 24px rgba(79, 209, 197, 0.25)' 
                      : '0 4px 16px rgba(0,0,0,0.06)',
                    '&:hover': {
                      transform: isSelected ? 'scale(1.02)' : 'translateY(-8px)',
                      boxShadow: isSelected 
                        ? '0 12px 28px rgba(79, 209, 197, 0.3)' 
                        : '0 10px 24px rgba(0,0,0,0.12)',
                      opacity: 1
                    },
                    minHeight: 520 // Set a minimum height for cards
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleDestinationSelect(dest)}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="220"
                        image={imageUrl}
                        alt={dest.name}
                        onError={(e) => {
                          // If image fails to load, replace with a placeholder
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = `https://via.placeholder.com/300x220?text=${encodeURIComponent(dest.name)}`;
                        }}
                        sx={{
                          filter: isSelected ? 'none' : 'brightness(0.92)'
                        }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
                        height: '80px',
                        zIndex: 1
                      }} />
                      <Chip
                        label={dest.category}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          bgcolor: 'rgba(255,255,255,0.85)',
                          color: '#2D3748',
                          fontWeight: 600,
                          backdropFilter: 'blur(4px)',
                          zIndex: 2
                        }}
                      />
                    </Box>
                    {isSelected && (
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        bgcolor: '#4FD1C5',
                        borderRadius: '50%',
                        p: 0.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        zIndex: 2
                      }}>
                        <CheckIcon sx={{ color: 'white' }} />
                      </Box>
                    )}
                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 1, color: '#2D3748' }}>
                        {dest.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mb: 1.5,
                        gap: 0.5,
                        color: '#718096',
                        fontWeight: 500,
                        fontSize: '0.85rem'
                      }}>
                        <LocationOn sx={{ fontSize: 16 }} />
                        {district && province ? `${district}, ${province}` : province}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="body2" paragraph sx={{ fontSize: '1rem', mb: 2, color: '#4A5568', flexGrow: 1 }}>
                        {description}
                      </Typography>
                      <Box sx={{ mt: 'auto' }}>
                        <Typography variant="subtitle2" sx={{ display: 'block', fontWeight: 700, mt: 2, color: '#2D3748' }}>
                          Highlights:
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'block', mb: 1.5, color: '#4A5568', fontSize: '0.9rem' }}>
                          {highlights}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          display: 'block', 
                          color: '#718096', 
                          bgcolor: 'rgba(226, 232, 240, 0.5)', 
                          p: 1.5, 
                          borderRadius: 1,
                          fontSize: '0.8rem',
                          fontStyle: 'italic'
                        }}>
                          {travelInfo}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderAccommodationCards = (accommodations) => {
    if (!accommodations || accommodations.length === 0) {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          p: 4, 
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <Typography variant="h6" color="text.secondary" fontWeight={500}>
            No accommodations available for this location.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please try selecting a different destination or contact support.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2D3748' }}>
          Select accommodation for Day {currentDay}
        </Typography>
        
        <Grid container spacing={3}>
          {accommodations.map((acc) => (
            <Grid item xs={12} sm={6} md={4} key={acc.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(226, 232, 240, 0.6)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 10px 24px rgba(0,0,0,0.12)'
                  },
                  minHeight: 480 // Set a minimum height for accommodation cards
                }}
              >
                <CardActionArea 
                  onClick={() => handleAccommodationSelect(acc)}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="220"
                      image={acc.image ? getImageUrl(acc.image) : `https://source.unsplash.com/featured/?hotel,${acc.location.toLowerCase()}`}
                      alt={acc.name}
                      onError={(e) => {
                        // If image fails to load, replace with a placeholder
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = `https://via.placeholder.com/300x220?text=${encodeURIComponent(`${acc.name} - ${acc.location}`)}`;
                      }}
                    />
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
                      height: '80px',
                      zIndex: 1
                    }} />
                    <Chip
                      label={acc.price}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        color: acc.price === '$' ? '#38A169' : acc.price === '$$' ? '#2B6CB0' : '#9F7AEA',
                        fontWeight: 700,
                        backdropFilter: 'blur(4px)',
                        zIndex: 2,
                        fontSize: '0.85rem'
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 1, color: '#2D3748' }}>
                      {acc.name}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 2,
                      gap: 0.5,
                      color: '#718096',
                      fontWeight: 500
                    }}>
                      <LocationOn sx={{ fontSize: 16 }} />
                      {acc.location}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="body2" paragraph sx={{ 
                      fontSize: '1rem', 
                      color: '#4A5568', 
                      flexGrow: 1,
                      mb: 3
                    }}>
                      {acc.name} offers comfortable accommodations in {acc.location}, with {acc.amenities.join(', ').toLowerCase()} and convenient access to nearby attractions. This is an ideal place to relax after a day of exploration.
                    </Typography>
                    
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#2D3748' }}>
                        Amenities:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {acc.amenities.map((amenity, index) => (
                          <Chip 
                            key={index} 
                            label={amenity} 
                            size="small" 
                            sx={{ 
                              fontSize: '0.75rem', 
                              height: '24px',
                              bgcolor: 'rgba(79, 209, 197, 0.1)',
                              color: '#2C7A7B',
                              borderColor: 'rgba(79, 209, 197, 0.3)',
                              border: '1px solid',
                              fontWeight: 500
                            }} 
                          />
                        ))}
                      </Box>
                      <Button
                        fullWidth
                        variant="outlined"
                        sx={{
                          mt: 3,
                          borderColor: '#4FD1C5',
                          color: '#4FD1C5',
                          '&:hover': {
                            borderColor: '#38A89D',
                            bgcolor: 'rgba(79, 209, 197, 0.05)'
                          },
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.5
                        }}
                      >
                        Select this Accommodation
                      </Button>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Helper function to get destination-specific activities
  const getDestinationActivities = (destination) => {
    // IMPORTANT: Only include activities for destinations that are in our database
    const activities = {
      'Sigiriya Rock Fortress': [
        'Climb to the top of Sigiriya Rock',
        'Explore the ancient water gardens', 
        'See the famous frescoes',
        'Visit the Lion\'s Paw entrance'
      ],
      'Mirissa Beach': [
        'Relax on the golden sandy beach',
        'Go whale and dolphin watching',
        'Try water sports like surfing',
        'Enjoy fresh seafood at beachside restaurants'
      ],
      'Ella Rock': [
        'Hike to the summit for panoramic views',
        'Photograph the scenic Nine Arch Bridge',
        'Visit nearby tea plantations',
        'Experience the cool mountain climate'
      ],
      'Temple of the Tooth': [
        'Witness a traditional Buddhist ceremony',
        'Explore the sacred temple complex',
        'View the golden roofed shrine',
        'Visit the World Buddhist Museum'
      ],
      'Yala National Park': [
        'Go on a wildlife safari to spot leopards',
        'Observe elephants in their natural habitat',
        'Bird watching in diverse ecosystems',
        'Photograph crocodiles and other reptiles'
      ],
      'Galle Fort': [
        'Walk along the historic rampart walls',
        'Explore colonial architecture and narrow streets',
        'Visit the Maritime Museum',
        'Shop for local crafts and gems'
      ]
    };
    
    // Verify the destination is in our list before returning activities
    const isValidDestination = DATABASE_DESTINATIONS.some(
      dbDest => dbDest.name === destination
    );
    
    if (isValidDestination && activities[destination]) {
      return activities[destination];
    }
    
    // Default activities for any destination
    return ['Explore the local area', 'Experience Sri Lankan culture', 'Try authentic local cuisine'];
  };

  // Render a trip planning progress indicator
  const renderPlanningProgress = () => {
    // Check if planning mode is active
    if (!planningMode) return null;
    
    // Calculate progress
    const daysPlanned = Object.keys(selectedDestinations).length;
    const progressPercent = tripDuration ? Math.round((daysPlanned / tripDuration) * 100) : 0;
    
    return (
      <Box sx={{ 
        mb: 3, 
        mt: 1,
        p: 2.5,
        bgcolor: 'white',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 700, fontSize: '1.1rem' }}>
            Trip Planning Progress
          </Typography>
          <Chip 
            label={`${daysPlanned} of ${tripDuration} days planned`} 
            sx={{ 
              bgcolor: 'rgba(79, 209, 197, 0.1)', 
              color: '#2C7A7B',
              fontWeight: 600,
              borderRadius: 2
            }} 
          />
        </Box>
        
        {/* Linear progress representation */}
        <Box sx={{ position: 'relative', mb: 1.5 }}>
          <Box sx={{ 
            width: '100%', 
            height: 10, 
            bgcolor: 'rgba(226, 232, 240, 0.6)', 
            borderRadius: 5,
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${progressPercent}%`,
              height: '100%',
              bgcolor: '#4FD1C5',
              borderRadius: 5,
              transition: 'width 1s ease-in-out'
            }} />
          </Box>
          {progressPercent === 100 && (
            <Box 
              component="span" 
              sx={{ 
                position: 'absolute', 
                right: -5, 
                top: -10,
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.2)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            >
              ✅
            </Box>
          )}
        </Box>
        
        {/* Day indicators */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          flexWrap: 'wrap',
          gap: 1
        }}>
          {Array.from({ length: tripDuration }, (_, i) => i + 1).map(day => {
            const isCompleted = selectedDestinations[day] && selectedDestinations[day].length > 0;
            const isCurrentDay = currentDay === day;
            
            return (
              <Box 
                key={day}
                onClick={() => {
                  // Only allow clicking on completed days or current day
                  if (isCompleted || day === daysPlanned + 1 || isCurrentDay) {
                    setCurrentDay(day);
                    fetchAndShowDestinations();
                  }
                }}
                sx={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease',
                  cursor: isCompleted || day === daysPlanned + 1 || isCurrentDay ? 'pointer' : 'default',
                  opacity: isCompleted || day === daysPlanned + 1 || isCurrentDay ? 1 : 0.6,
                  bgcolor: isCurrentDay 
                    ? '#4FD1C5' 
                    : isCompleted 
                      ? 'rgba(79, 209, 197, 0.15)' 
                      : 'rgba(226, 232, 240, 0.6)',
                  color: isCurrentDay 
                    ? 'white' 
                    : isCompleted 
                      ? '#2C7A7B' 
                      : '#718096',
                  border: isCurrentDay 
                    ? '2px solid #38A89D' 
                    : isCompleted 
                      ? '2px solid rgba(79, 209, 197, 0.5)' 
                      : '1px solid transparent',
                  boxShadow: isCurrentDay 
                    ? '0 2px 6px rgba(79, 209, 197, 0.3)' 
                    : 'none',
                  '&:hover': {
                    transform: isCompleted || day === daysPlanned + 1 || isCurrentDay 
                      ? 'translateY(-2px)' 
                      : 'none',
                    boxShadow: isCompleted || day === daysPlanned + 1 || isCurrentDay 
                      ? '0 3px 8px rgba(0,0,0,0.1)' 
                      : 'none'
                  },
                  position: 'relative'
                }}
              >
                {day}
                {isCompleted && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      bottom: -2, 
                      right: -2, 
                      width: 14, 
                      height: 14, 
                      borderRadius: '50%', 
                      bgcolor: '#68D391',
                      border: '2px solid white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const showAccommodationsForDay = (day) => {
    setCurrentDay(day);
    
    // Get the selected destinations for this day
    const selectedDestsForDay = selectedDestinations[day] || [];
    
    console.log('Selected destinations for day:', day, selectedDestsForDay);
    
    // Mock accommodations data based on selected destinations
    let accommodations = [
      { id: 1, name: 'Sigiriya Village Hotel', location: 'Sigiriya', price: '$$', amenities: ['Pool', 'Restaurant', 'WiFi'], image: 'https://source.unsplash.com/featured/?hotel,sigiriya' },
      { id: 2, name: 'Kandy Lake Resort', location: 'Kandy', price: '$$$', amenities: ['Spa', 'Pool', 'Restaurant'], image: 'https://source.unsplash.com/featured/?hotel,kandy' },
      { id: 3, name: 'Ella Gap Hotel', location: 'Ella', price: '$$', amenities: ['Mountain View', 'Restaurant', 'WiFi'], image: 'https://source.unsplash.com/featured/?hotel,ella' },
      { id: 4, name: 'Colombo Hilton', location: 'Colombo', price: '$$$', amenities: ['Luxury', 'Pool', 'City View'], image: 'https://source.unsplash.com/featured/?hotel,colombo' },
      { id: 5, name: 'Beach Side Inn', location: 'Mirissa', price: '$', amenities: ['Beach Access', 'Breakfast', 'WiFi'], image: 'https://source.unsplash.com/featured/?hotel,beach' },
      { id: 6, name: 'Galle Heritage Villa', location: 'Galle', price: '$$', amenities: ['Colonial Style', 'Garden', 'AC'], image: 'https://source.unsplash.com/featured/?hotel,galle' },
      { id: 7, name: 'Yala Safari Lodge', location: 'Yala', price: '$$', amenities: ['Safari Tours', 'Nature View', 'Restaurant'], image: 'https://source.unsplash.com/featured/?hotel,safari' },
    ];
    
    // Debug: Log the accommodation data with image URLs
    console.log('Accommodation data:', accommodations.map(acc => ({
      ...acc,
      formattedImageUrl: getImageUrl(acc.image)
    })));
    
    // Filter accommodations based on selected destinations for this day
    if (selectedDestsForDay.length > 0) {
      const relevantAccommodations = [];
      
      // For each selected destination, find matching accommodations
      selectedDestsForDay.forEach(dest => {
        const destName = dest.name.split(' ')[0]; // Get first word of destination name
        const matchingAccommodations = accommodations.filter(acc => 
          acc.location.toLowerCase().includes(destName.toLowerCase())
        );
        
        // Add matching accommodations to our list
        matchingAccommodations.forEach(acc => {
          if (!relevantAccommodations.some(a => a.id === acc.id)) {
            relevantAccommodations.push(acc);
          }
        });
      });
      
      // If we found relevant accommodations, use those
      if (relevantAccommodations.length > 0) {
        accommodations = relevantAccommodations;
      }
    }
    
    // Add a bot message showing accommodation options
    const accommodationMessage = {
      type: 'bot',
      content: `Please select an accommodation for day ${day}:`,
      showAccommodations: true,
      accommodations: accommodations,
      id: `accommodation-options-${day}-${Date.now()}`
    };
    
    setMessages(prev => [...prev, accommodationMessage]);
  };

  const handleAccommodationSelect = (accommodation) => {
    // Input validation
    if (!accommodation || !accommodation.name) {
      console.error('Invalid accommodation selected:', accommodation);
      return;
    }
    
    // Store the selected accommodation
    setSelectedAccommodation(prev => ({
      ...prev,
      [currentDay]: accommodation
    }));
    
    // Add messages to chat
    const userMessage = {
      type: 'user',
      content: `I'll stay at ${accommodation.name} on day ${currentDay}`,
      id: `accommodation-selection-${accommodation.id}-${Date.now()}`
    };
    
    // Get conversational response for accommodation selection
    const accommodationResponse = getConversationalResponse('accommodationSelected', {
      name: accommodation.name,
      location: accommodation.location,
      day: currentDay
    });
    
    // Prepare suggestions based on planning progress
    const allDaysDone = Object.keys(selectedDestinations).length >= tripDuration &&
                         Object.keys(selectedAccommodation).length >= tripDuration;
    
    const nextDaySuggestion = currentDay < tripDuration 
      ? [`Continue to day ${currentDay + 1}`] 
      : [];
    
    const suggestions = allDaysDone
      ? ['Generate my trip plan', 'Review my selections']
      : [...nextDaySuggestion, 'Generate my trip plan'];
    
    const botMessage = {
      type: 'bot',
      content: `${accommodationResponse}`,
      suggestions: suggestions,
      id: `accommodation-response-${accommodation.id}-${Date.now()}`
    };
    
    setMessages(prev => [...prev, userMessage, botMessage]);
    
    // If this is not the last day, proceed to next day planning
    if (currentDay < tripDuration) {
      // Add suggestion to move to next day
      setTimeout(() => {
        // Get conversational response for day transition
        const dayTransitionResponse = getConversationalResponse('dayTransition', {
          day: currentDay + 1
        });
        
        setMessages(prev => [...prev, {
          type: 'bot',
          content: `${dayTransitionResponse} Would you like to continue planning?`,
          suggestions: [`Continue to day ${currentDay + 1}`, 'Review my selections'],
          id: `day-transition-${currentDay + 1}-${Date.now()}`
        }]);
        
        // Automatically move to the next day after a short delay
        setTimeout(() => {
          setCurrentDay(currentDay + 1);
          fetchAndShowDestinations();
        }, 3000);
      }, 2000);
    } else if (allDaysDone) {
      // If all days are planned with destinations and accommodations, prompt to generate the plan
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: `You've completed planning for all ${tripDuration} days of your trip! Your itinerary looks fantastic. Would you like to generate your detailed trip plan now?`,
          suggestions: ['Generate my trip plan', 'Review my selections'],
          id: `generate-plan-prompt-${Date.now()}`
        }]);
      }, 2000);
    }
  };

  // Helper functions for destination information - updated to work with API data
  const getDestinationDescription = (dest) => {
    // First check if the destination has a description property from the API
    if (dest.description) {
      return dest.description;
    }
    
    // Fallback to predefined descriptions
    const descriptions = {
      'Sigiriya Rock Fortress': 'Ancient rock fortress with spectacular views and beautiful frescoes. UNESCO World Heritage Site dating back to the 5th century.',
      'Mirissa Beach': 'Beautiful golden sand beach with crystal clear waters. Perfect for relaxation, swimming, and whale watching tours.',
      'Ella Rock': 'Scenic hiking trail offering breathtaking panoramic views of the surrounding hills and tea plantations.',
      'Temple of the Tooth': 'Sacred Buddhist temple housing the relic of Buddha\'s tooth. One of Sri Lanka\'s most important religious sites.',
      'Yala National Park': 'Sri Lanka\'s most famous wildlife park known for leopards, elephants, and crocodiles in their natural habitat.',
      'Galle Fort': 'Historic colonial fort with charming streets, Dutch architecture, and ocean views. UNESCO World Heritage Site.'
    };
    
    if (descriptions[dest.name]) {
      return descriptions[dest.name];
    }
    
    // Generate a description based on category
    const category = dest.category || 'tourist';
    return `A beautiful ${category.toLowerCase()} destination in Sri Lanka. ${dest.name} offers visitors an authentic Sri Lankan experience with its unique charm and character.`;
  };
  
  const getDestinationHighlights = (dest) => {
    // First check if the destination has highlights from the API
    if (dest.highlights) {
      return dest.highlights;
    }
    
    // Fallback to predefined highlights
    const highlights = {
      'Sigiriya Rock Fortress': 'Ancient frescoes, Mirror Wall, Lion\'s Paw entrance, Water Gardens',
      'Mirissa Beach': 'Whale watching, surfing, coconut palm groves, seafood restaurants',
      'Ella Rock': 'Hiking trails, panoramic views, tea plantations, cooler climate',
      'Temple of the Tooth': 'Sacred tooth relic, Kandy Lake, Royal Palace complex, cultural performances',
      'Yala National Park': 'Leopard safaris, elephant herds, coastal landscapes, bird watching',
      'Galle Fort': 'Colonial architecture, rampart walls, artisan shops, historic lighthouse'
    };
    
    if (highlights[dest.name]) {
      return highlights[dest.name];
    }
    
    // Generate highlights based on category
    const category = dest.category?.toLowerCase() || '';
    
    if (category.includes('beach')) {
      return 'Beautiful shoreline, water activities, scenic views, relaxation';
    } else if (category.includes('historical') || category.includes('religious')) {
      return 'Cultural significance, architectural beauty, historical value, photo opportunities';
    } else if (category.includes('nature') || category.includes('wildlife')) {
      return 'Natural beauty, diverse flora and fauna, outdoor activities, peaceful atmosphere';
    }
    
    return 'Local culture, natural beauty, authentic experiences';
  };
  
  const getDestinationTravelInfo = (dest) => {
    // First check if the destination has travel info from the API
    if (dest.travelInfo) {
      return dest.travelInfo;
    }
    
    // Fallback to predefined travel info
    const travelInfo = {
      'Sigiriya Rock Fortress': 'About 3.5 hours from Colombo, best visited early morning',
      'Mirissa Beach': '2.5 hours from Colombo, perfect for sunset beach activities',
      'Ella Rock': '6 hours from Colombo by train, moderate hiking difficulty',
      'Temple of the Tooth': '3 hours from Colombo, visit during evening puja ceremony',
      'Yala National Park': '5 hours from Colombo, early morning or late afternoon safaris',
      'Galle Fort': '2 hours from Colombo, pleasant to visit any time of day'
    };
    
    if (travelInfo[dest.name]) {
      return travelInfo[dest.name];
    }
    
    // Generate generic travel info
    return 'Accessible with local transportation options, best enjoyed during daylight hours';
  };

  return (
    <Box sx={{ 
      height: '100vh', // Make it full viewport height
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f0f5f9',
      maxWidth: '1400px',
      mx: 'auto',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      borderRadius: { xs: 0, md: 3 },
      overflow: 'hidden',
      mt: { xs: 0, md: 3 },
      mb: { xs: 0, md: 3 }
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2.5, 
        bgcolor: '#4FD1C5', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TravelExploreIcon sx={{ mr: 2, fontSize: '2rem' }} />
          <Typography variant="h5" sx={{ 
            fontFamily: "'Poppins', sans-serif", 
            fontWeight: 600,
            letterSpacing: '0.5px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            Ceylon Circuit AI Travel Planner
          </Typography>
        </Box>
        <IconButton 
          color="inherit" 
          onClick={handleReset} 
          title="Start New Chat"
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.15)', 
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            transition: 'all 0.2s ease'
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Chat messages */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: { xs: 2, md: 4 },
        pt: { xs: 3, md: 5 },
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        bgcolor: '#f0f5f9',
        height: 'calc(100vh - 140px)' // Adjust to leave space for header and input
      }}>
        {messages.map((message, index) => (
          <React.Fragment key={index}>
            <ChatMessage 
              message={message} 
              onSuggestionClick={(suggestion) => processMessage(suggestion)} 
            />
            
            {message.showDestinations && (
              <Box sx={{ width: '100%' }}>
                {renderPlanningProgress()}
                {renderDestinationCards()}
              </Box>
            )}
            
            {message.showAccommodations && (
              <Box sx={{ width: '100%' }}>
                {renderAccommodationCards(message.accommodations)}
              </Box>
            )}
          </React.Fragment>
        ))}
        
        {/* Generate Trip Plan Button */}
        {showTripPlanButton && Object.values(selectedDestinations).some(arr => arr.length > 0) && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            my: 3,
            p: 3,
            bgcolor: 'rgba(79, 209, 197, 0.1)',
            borderRadius: 3,
            border: '1px dashed #4FD1C5',
            boxShadow: '0 4px 12px rgba(79, 209, 197, 0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(79, 209, 197, 0.25)',
              bgcolor: 'rgba(79, 209, 197, 0.15)',
            }
          }}>
            <Button
              variant="contained"
              startIcon={<ArticleIcon />}
              onClick={() => generateTripPlan()}
              sx={{
                bgcolor: '#4FD1C5',
                '&:hover': {
                  bgcolor: '#38A89D',
                },
                boxShadow: '0 4px 10px rgba(79, 209, 197, 0.3)',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderRadius: 2
              }}
              disabled={!tripDuration || Object.keys(selectedDestinations).length < tripDuration}
            >
              Generate My {tripDuration}-Day Trip Plan
            </Button>
            
            {(!tripDuration || Object.keys(selectedDestinations).length < tripDuration) && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                Please complete planning for all {tripDuration} days before generating your trip plan
              </Typography>
            )}
          </Box>
        )}
        
        {planningMode && currentDay > tripDuration && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            my: 3,
            p: 3,
            bgcolor: 'rgba(79, 209, 197, 0.1)',
            borderRadius: 3,
            border: '1px dashed #4FD1C5'
          }}>
            <Button
              variant="contained"
              startIcon={<ArticleIcon />}
              onClick={() => generateTripPlan()}
              sx={{
                bgcolor: '#4FD1C5',
                '&:hover': {
                  bgcolor: '#38A89D',
                },
                boxShadow: '0 4px 10px rgba(79, 209, 197, 0.3)',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderRadius: 2
              }}
              disabled={!tripDuration || Object.keys(selectedDestinations).length < tripDuration}
            >
              Generate My {tripDuration}-Day Trip Plan
            </Button>
          </Box>
        )}
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
            }}
          >
            {error}
          </Alert>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 3, 
          py: 2 
        }}>
          <CircularProgress size={30} sx={{ color: '#4FD1C5' }} />
        </Box>
      )}

      {/* Input area */}
      <Box sx={{ 
        p: 2.5, 
        bgcolor: 'white', 
        borderTop: 1, 
        borderColor: 'rgba(0,0,0,0.08)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        position: 'relative'
      }}>
        {messages.length === 1 && (
          <Box sx={{
            position: 'absolute',
            top: -40,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(79, 209, 197, 0.9)',
            color: 'white',
            py: 1,
            px: 2,
            borderRadius: 2,
            fontSize: '0.9rem',
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            animation: 'bounce 2s infinite',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              marginLeft: -8,
              borderWidth: 8,
              borderStyle: 'solid',
              borderColor: 'rgba(79, 209, 197, 0.9) transparent transparent transparent'
            },
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
              '50%': { transform: 'translateX(-50%) translateY(-10px)' }
            }
          }}>
            Type your response here or use suggestions
          </Box>
        )}
        
        {/* Replace TextField with ChatInput component */}
        <ChatInput 
          onSend={handleSendMessage}
          disabled={isLoading}
          autoFocus={true}
          placeholder="Type your message..."
        />
      </Box>
    </Box>
  );
};

export default ChatInterface; 