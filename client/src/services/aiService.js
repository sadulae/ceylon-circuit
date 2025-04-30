import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Sends a message to the AI tripbot and returns the response
 * @param {string} message - The user's message
 * @param {string} sessionId - Optional session ID for conversation context
 * @returns {Promise<Object>} - The AI response
 */
export const sendMessageToAI = async (message, sessionId = null) => {
  try {
    const response = await axios.post(`${API_URL}/api/tripbot/chat`, {
      message,
      sessionId
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message to AI:', error);
    throw error;
  }
};

/**
 * Gets trip suggestions based on user preferences
 * @param {Object} preferences - User preferences (interests, location, budget, etc.)
 * @returns {Promise<Object>} - Recommended destinations
 */
export const getTripSuggestions = async (preferences) => {
  try {
    const response = await axios.post(`${API_URL}/api/tripbot/recommendations`, preferences, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting trip suggestions:', error);
    throw error;
  }
};

/**
 * Saves a trip plan to the user's account
 * @param {Object} plan - The trip plan to save
 * @param {string} sessionId - Optional session ID for context
 * @returns {Promise<Object>} - Result of the save operation
 */
export const saveTripPlan = async (plan, sessionId = null) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(`${API_URL}/api/tripbot/save-plan`, {
      plan,
      sessionId
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error saving trip plan:', error);
    throw error;
  }
};

/**
 * Gets information about a specific destination
 * @param {string} destination - The destination name
 * @returns {Promise<Object>} - Destination details
 */
export const getDestinationInfo = async (destination) => {
  try {
    const response = await axios.get(`${API_URL}/api/tripbot/destination/${destination}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting destination info:', error);
    throw error;
  }
};

/**
 * Gets all saved trip plans for the current user
 * @returns {Promise<Array>} - User's saved trip plans
 */
export const getUserTripPlans = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    const response = await axios.get(`${API_URL}/api/tripbot/user-plans`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user trip plans:', error);
    throw error;
  }
}; 