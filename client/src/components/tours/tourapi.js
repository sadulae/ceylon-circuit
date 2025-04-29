import axios from 'axios';
import store from '../../redux/store';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        // Define public endpoints that don't require authentication
        const publicEndpoints = [
            { path: '/guides', method: 'get' },
            { path: '/tours', method: 'get' },
            { path: '/destinations', method: 'get' }
        ];
        
        // Check if current request is to a public endpoint
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
            config.url?.includes(endpoint.path) && 
            config.method === endpoint.method
        );
        
        if (token) {
            // Add token to headers if available
            config.headers.Authorization = `Bearer ${token}`;
        } else if (!isPublicEndpoint) {
            // Only log for non-public endpoints that should have a token
            console.log('No authentication token found for protected endpoint');
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Authentication error:', error.response?.data?.message || 'Unauthorized access');
            // Don't redirect automatically - let the component handle it
        }
        return Promise.reject(error);
    }
);

// Tour API functions
export const getTours = async () => {
    try {
        const response = await api.get('/tours');
    return response.data;
    } catch (error) {
        console.error('Error fetching tours:', error);
        throw error;
    }
};

export const createTour = async (formData) => {
    try {
        console.log('Creating tour with data:', JSON.stringify(formData, null, 2));
        
        // Ensure all numeric values are properly formatted
        const formattedData = {
            ...formData,
            duration: parseInt(formData.duration, 10) || 1,
            price: parseFloat(formData.price) || 0,
            maxParticipants: parseInt(formData.maxParticipants, 10) || 1
        };
        
        // DEBUG: Check if we have dailyItineraries in the input
        console.log('Input has dailyItineraries:', 
            formattedData.dailyItineraries ? `Yes (${formattedData.dailyItineraries.length} days)` : 'No');
        
        // Handle case when dailyItineraries is missing or not an array
        if (!formattedData.dailyItineraries || !Array.isArray(formattedData.dailyItineraries)) {
            console.warn('dailyItineraries is missing or not an array - creating default');
            formattedData.dailyItineraries = [{
                day: 1,
                destinations: [],
                accommodations: []
            }];
        }
        
        // Format the daily itineraries - fix array empty check and object structure
        if (formattedData.dailyItineraries && Array.isArray(formattedData.dailyItineraries) && formattedData.dailyItineraries.length > 0) {
            console.log('Original dailyItineraries:', JSON.stringify(formattedData.dailyItineraries, null, 2));
            
            // Create a properly formatted dailyItineraries array that matches the schema
            formattedData.dailyItineraries = formattedData.dailyItineraries
                .filter(day => day && typeof day === 'object') // Skip null or undefined days
                .map((day, index) => {
                    console.log(`Processing day ${index + 1}:`, JSON.stringify(day, null, 2));
                    
                    // Process destinations
                    let destinations = [];
                    if (day.destinations && Array.isArray(day.destinations)) {
                        destinations = day.destinations
                            .filter(dest => dest && (typeof dest === 'string' || dest._id))
                            .map(dest => {
                                const id = typeof dest === 'string' ? dest : dest._id;
                                console.log(`- Destination ID: ${id}`);
                                return id;
                            });
                    }
                    
                    // Process accommodations
                    let accommodations = [];
                    if (day.accommodations && Array.isArray(day.accommodations)) {
                        accommodations = day.accommodations
                            .filter(acc => acc && (typeof acc === 'string' || acc._id))
                            .map(acc => {
                                const id = typeof acc === 'string' ? acc : acc._id;
                                console.log(`- Accommodation ID: ${id}`);
                                return id;
                            });
                    }
                    
                    // Debug the processed day
                    console.log(`Day ${index + 1} processed:`, {
                        day: day.day || (index + 1),
                        destinations: destinations,
                        accommodations: accommodations
                    });
                    
                    return {
                        day: day.day || (index + 1),
                        destinations,
                        accommodations
                    };
                });
                
            // If after filtering we don't have any valid days, add a default placeholder
            if (formattedData.dailyItineraries.length === 0) {
                console.warn('No valid itineraries found after filtering - adding placeholder');
                formattedData.dailyItineraries = [{
                    day: 1,
                    destinations: [],
                    accommodations: []
                }];
            }
            
            // Ensure all days have valid structure and at least one destination
            formattedData.dailyItineraries.forEach((day, index) => {
                if (!day.destinations) day.destinations = [];
                if (!day.accommodations) day.accommodations = [];
                
                // Log warning if destinations array is empty as it's required by the server model
                if (day.destinations.length === 0) {
                    console.warn(`WARNING: Day ${index + 1} has no destinations. This will fail validation on the server.`);
                }
            });
        } else {
            // Ensure dailyItineraries exists and has the right structure
            console.warn('dailyItineraries array is empty - creating default structure');
            formattedData.dailyItineraries = [{
                day: 1,
                destinations: [],
                accommodations: []
            }];
        }
        
        // Log the final data being sent to the server
        console.log('Sending tour data to server:', JSON.stringify(formattedData, null, 2));
        console.log('DailyItineraries being sent:', JSON.stringify(formattedData.dailyItineraries, null, 2));
        
        // Check for tourGuideId which is required
        if (!formattedData.tourGuideId) {
            console.error('CRITICAL ERROR: tourGuideId is missing which is required by the server');
        }
        
        // Make the API request with detailed error handling
        try {
            const response = await api.post('/tours', formattedData);
            console.log('Tour creation successful response:', response.data);
            return response.data;
        } catch (apiError) {
            console.error('API error details:', {
                status: apiError.response?.status,
                statusText: apiError.response?.statusText,
                data: apiError.response?.data,
                headers: apiError.response?.headers
            });
            throw apiError;
        }
    } catch (error) {
        console.error('Error creating tour:', error);
        
        // More detailed error logging
        if (error.response) {
            console.error('Response error data:', error.response.data);
            console.error('Response error status:', error.response.status);
            
            // Check for specific validation errors
            if (error.response.data && error.response.data.message) {
                if (error.response.data.message.includes('itineraries')) {
                    console.error('VALIDATION ERROR: There is an issue with the daily itineraries');
                }
                
                if (error.response.data.message.includes('tourGuide')) {
                    console.error('VALIDATION ERROR: There is an issue with the tour guide');
                }
                
                if (error.response.data.message.includes('destinations')) {
                    console.error('VALIDATION ERROR: There is an issue with the destinations');
                }
            }
        }
        
        throw error;
    }
};

export const updateTour = async (tourId, updateData) => {
    try {
        console.log("Updating tour ID:", tourId);
        console.log("Update data:", JSON.stringify(updateData, null, 2));
        
        // Format the updateData for the server
        const tourDataObj = {
            ...updateData,
            // Ensure proper type conversions
            duration: parseInt(updateData.duration, 10) || 1,
            price: parseFloat(updateData.price) || 0,
            maxParticipants: parseInt(updateData.maxParticipants, 10) || 1
        };
        
        // Process dailyItineraries if present to ensure they have the correct format
        if (tourDataObj.dailyItineraries && Array.isArray(tourDataObj.dailyItineraries)) {
            // Process each day to ensure proper format
            tourDataObj.dailyItineraries = tourDataObj.dailyItineraries
                .filter(day => day && day.destinations && day.destinations.length > 0)
                .map((day, index) => ({
                    day: day.day || index + 1,
                    destinations: day.destinations.map(dest => 
                        typeof dest === 'string' ? dest : (dest._id || dest.id || '')
                    ).filter(id => id),
                    accommodations: (day.accommodations || []).map(acc => 
                        typeof acc === 'string' ? acc : (acc._id || acc.id || '')
                    ).filter(id => id)
                }));
        }
        
        console.log("Sending tour data object to server:", JSON.stringify(tourDataObj, null, 2));
        
        // Use the API instance with JSON content type
        const response = await api.put(`/tours/${tourId}`, tourDataObj);
        
        console.log("Update response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating tour:", error);
        if (error.response) {
            console.error("Server response:", error.response.data);
            throw new Error(error.response.data.message || 'Failed to update tour');
        }
        throw error;
    }
};

export const deleteTour = async (id) => {
    try {
        const response = await api.delete(`/tours/${id}`);
    return response.data;
    } catch (error) {
        console.error('Error deleting tour:', error);
        throw error;
    }
};

// Guide API functions
export const fetchGuides = async () => {
    try {
        // Make the request without token check for this public endpoint
        const response = await api.get('/guides');
        
        // Check if the response has a data property that contains a data array
        if (response.data && response.data.data) {
            return { 
                success: true, 
                data: response.data.data 
            };
        } else if (Array.isArray(response.data)) {
            // Handle case where response.data is directly an array of guides
            return { 
                success: true, 
                data: response.data 
            };
        } else {
            // Handle unexpected response format
            console.error('Unexpected response format:', response.data);
            return { 
                success: false, 
                data: [], 
                error: 'Invalid guide data format received from server' 
            };
        }
    } catch (error) {
        console.error('Error fetching guides:', error);
        return { 
            success: false, 
            data: [], 
            error: error.message 
        };
    }
};

export const createGuide = async (formData, explicitToken = null) => {
    try {
        // Get token from multiple sources
        const token = explicitToken || localStorage.getItem('token');
        
        // Create headers with content type for file upload
        const headers = {
            'Content-Type': 'multipart/form-data'
        };
        
        // Add token if available
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Using token for guide creation:', token.substring(0, 10) + '...');
        } else {
            console.warn('No token available for guide creation');
        }
        
        // Use direct axios call to ensure headers are properly set
        const response = await axios.post(`${API_URL}/guides`, formData, {
            headers,
            withCredentials: true
        });
        
    return response.data;
    } catch (error) {
        console.error('Error creating guide:', error);
        throw error;
    }
};

export const updateGuide = async (id, formData, explicitToken = null) => {
    try {
        // Get token from multiple sources
        let token = explicitToken || localStorage.getItem('token');
        
        // If still no token, try to get it from Redux store as a last resort
        if (!token) {
            try {
                const state = store.getState();
                token = state.auth?.token;
                console.log('Token from Redux store:', token ? 'Found' : 'Not found');
            } catch (storeError) {
                console.error('Error accessing Redux store:', storeError);
            }
        }
        
        // Verify token format
        if (token) {
            console.log('Token format check:', token.substring(0, 20) + '...');
            // Make sure token is properly formatted (doesn't have "Bearer " prefix already)
            if (token.startsWith('Bearer ')) {
                token = token.substring(7);
                console.log('Removed Bearer prefix from token');
            }
        } else {
            console.error('No token available, admin operation will likely fail');
        }
        
        // Create a new FormData to avoid potential issues with reusing the passed formData
        const safeFormData = new FormData();
        
        // Log the formData contents for debugging
        console.log('Original FormData entries:');
        for (let pair of formData.entries()) {
            console.log(pair[0], typeof pair[1], pair[1]);
        }
        
        // Transfer all entries from original formData to safeFormData
        for (let pair of formData.entries()) {
            const [key, value] = pair;
            
            // Handle special cases for languages and specializations (ensure they're JSON strings)
            if ((key === 'languages' || key === 'specializations') && Array.isArray(value)) {
                safeFormData.append(key, JSON.stringify(value));
            } else {
                safeFormData.append(key, value);
            }
        }
        
        // Log the safeFormData contents for debugging
        console.log('Safe FormData entries:');
        for (let pair of safeFormData.entries()) {
            console.log(pair[0], typeof pair[1], pair[1] instanceof File ? 'File object' : pair[1]);
        }
        
        // Set up headers with correct content type for multipart/form-data
        const headers = {};
        
        // Add token if available - use Bearer format
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Using token for guide update with Authorization header');
            
            // Include cookie version of token as well
            document.cookie = `token=${token}; path=/; max-age=2592000`; // 30 days
            console.log('Also set token cookie as fallback auth method');
        } else {
            console.warn('No token available for guide update');
        }
        
        // Make the request - DO NOT set Content-Type header for multipart/form-data
        // Axios will set the correct boundary automatically
        const response = await axios.put(
            `${API_URL}/guides/${id}`, 
            safeFormData, 
            {
                headers: headers,
                withCredentials: true
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error in updateGuide:', error);
        
        // More detailed error logging
        if (error.response) {
            console.error('Response error data:', error.response.data);
            console.error('Response error status:', error.response.status);
        }
        
        throw error;
    }
};

export const deleteGuide = async (id) => {
    try {
        // No need to throw error if token is missing, the interceptor will handle it
        const response = await api.delete(`/guides/${id}`);
    return response.data;
    } catch (error) {
        console.error('Error deleting guide:', error);
        throw error;
    }
};