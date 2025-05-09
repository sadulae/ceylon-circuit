import Destination from '../models/Destination.js';
import Accommodation from '../models/accModels.js';
import TourGuide from '../models/tourGuide.js';
import Tour from '../models/tourModel.js';

/**
 * Calculate distance between two points using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Group destinations by region/proximity
 */
const groupDestinationsByRegion = (destinations) => {
  const regions = new Map();
  
  destinations.forEach(dest => {
    const { province } = dest.location;
    if (!regions.has(province)) {
      regions.set(province, []);
    }
    regions.get(province).push(dest);
  });
  
  return regions;
};

/**
 * Find nearest accommodations to a destination
 */
const findNearbyAccommodations = async (destination, preferences = {}) => {
  const { budget = 'moderate', type = 'any' } = preferences;
  
  // Define radius based on location type
  const searchRadius = destination.category === 'city' ? 5 : 15; // km
  
  const accommodations = await Accommodation.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: destination.location.coordinates
        },
        $maxDistance: searchRadius * 1000 // Convert to meters
      }
    }
  }).limit(5);

  // Filter by preferences
  return accommodations.filter(acc => {
    if (type !== 'any' && acc.type !== type) return false;
    
    // Basic budget filtering
    const pricePerNight = acc.price.amount;
    switch(budget) {
      case 'budget': return pricePerNight < 100;
      case 'moderate': return pricePerNight >= 100 && pricePerNight <= 300;
      case 'luxury': return pricePerNight > 300;
      default: return true;
    }
  });
};

/**
 * Validate if destinations can be visited in one day
 */
const validateDayPlan = (destinations) => {
  if (destinations.length < 1) return false;
  if (destinations.length === 1) return true;
  
  let totalDistance = 0;
  for (let i = 0; i < destinations.length - 1; i++) {
    const current = destinations[i];
    const next = destinations[i + 1];
    const distance = calculateDistance(
      current.location.coordinates[1],
      current.location.coordinates[0],
      next.location.coordinates[1],
      next.location.coordinates[0]
    );
    totalDistance += distance;
  }
  
  // Maximum reasonable distance for a day trip (150km)
  return totalDistance <= 150;
};

/**
 * Generate optimal day-by-day itinerary
 */
const generateDayPlans = async (preferences) => {
  const {
    duration,
    interests = [],
    startingPoint = 'Colombo',
    budget = 'moderate',
    accommodationType = 'any'
  } = preferences;

  try {
    // Fetch all relevant destinations
    const destinations = await Destination.find({
      category: interests.length ? { $in: interests } : { $exists: true }
    });

    // Group destinations by region
    const regionGroups = groupDestinationsByRegion(destinations);
    
    // Create day-by-day plans
    const dayPlans = [];
    let currentRegion = null;
    let remainingDestinations = [...destinations];
    
    for (let day = 1; day <= duration; day++) {
      // If no current region or current region is exhausted, pick a new region
      if (!currentRegion || currentRegion.length === 0) {
        // Find region with most remaining destinations
        let maxDestinations = 0;
        let bestRegion = null;
        
        for (const [region, dests] of regionGroups) {
          if (dests.length > maxDestinations) {
            maxDestinations = dests.length;
            bestRegion = region;
          }
        }
        
        currentRegion = regionGroups.get(bestRegion) || [];
      }
      
      // Select destinations for the day
      const dayDestinations = [];
      let currentDestination = currentRegion[0];
      
      while (currentDestination && dayDestinations.length < 3) {
        const potentialPlan = [...dayDestinations, currentDestination];
        if (validateDayPlan(potentialPlan)) {
          dayDestinations.push(currentDestination);
          currentRegion = currentRegion.filter(d => d !== currentDestination);
          remainingDestinations = remainingDestinations.filter(d => d !== currentDestination);
          
          // Find next closest destination
          currentDestination = currentRegion.reduce((closest, dest) => {
            if (!closest) return dest;
            
            const distToClosest = calculateDistance(
              currentDestination.location.coordinates[1],
              currentDestination.location.coordinates[0],
              closest.location.coordinates[1],
              closest.location.coordinates[0]
            );
            
            const distToDest = calculateDistance(
              currentDestination.location.coordinates[1],
              currentDestination.location.coordinates[0],
              dest.location.coordinates[1],
              dest.location.coordinates[0]
            );
            
            return distToDest < distToClosest ? dest : closest;
          }, null);
        } else {
          break;
        }
      }
      
      // Find suitable accommodation
      const lastDestination = dayDestinations[dayDestinations.length - 1];
      const accommodations = await findNearbyAccommodations(lastDestination, {
        budget,
        type: accommodationType
      });
      
      dayPlans.push({
        day,
        destinations: dayDestinations.map(d => ({
          name: d.name,
          category: d.category,
          description: d.description,
          location: d.location,
          suggestedDuration: d.suggestedDuration || '2-3 hours',
          activities: d.activities || []
        })),
        accommodation: accommodations.length > 0 ? {
          name: accommodations[0].name,
          type: accommodations[0].type,
          location: accommodations[0].location,
          price: accommodations[0].price,
          amenities: accommodations[0].amenities
        } : null
      });
    }
    
    return {
      success: true,
      dayPlans,
      summary: {
        totalDestinations: dayPlans.reduce((total, day) => total + day.destinations.length, 0),
        regions: [...new Set(dayPlans.flatMap(day => 
          day.destinations.map(dest => dest.location.province)
        ))]
      }
    };
  } catch (error) {
    console.error('Error generating day plans:', error);
    return {
      success: false,
      error: 'Failed to generate trip plan'
    };
  }
};

const TripPlanningService = {
  generateDayPlans,
  validateDayPlan,
  findNearbyAccommodations
};

export default TripPlanningService; 