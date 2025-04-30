import Tour from '../models/tourModel.js';
import TourGuide from '../models/tourGuide.js';
import { createError } from '../utils/error.js';
import mongoose from 'mongoose';

// @desc    Get all tours
// @route   GET /api/tours
// @access  Public
export const getTours = async (req, res, next) => {
    try {
        const tours = await Tour.find()
            .populate('tourGuide', 'name email phone')
            .populate('dailyItineraries.destinations', 'name location')
            .populate('dailyItineraries.accommodations', 'accName location')
            .sort({ createdAt: -1 });
            
        res.status(200).json({
            success: true,
            data: tours
        });
    } catch (error) {
        console.error("Error getting tours:", error);
        next(error);
    }
};

// @desc    Get single tour
// @route   GET /api/tours/:id
// @access  Public
export const getTourById = async (req, res, next) => {
    try {
        const tour = await Tour.findById(req.params.id)
            .populate('tourGuide', 'name email phone')
            .populate('dailyItineraries.destinations', 'name location')
            .populate('dailyItineraries.accommodations', 'accName location');

        if (!tour) {
            return next(createError(404, 'Tour not found'));
        }

        res.status(200).json({
            success: true,
            data: tour
        });
    } catch (error) {
        console.error("Error getting tour by ID:", error);
        next(error);
    }
};

// @desc    Create new tour
// @route   POST /api/tours
// @access  Private/Admin
export const createTour = async (req, res, next) => {
    try {
        console.log("Raw request body:", req.body);
        console.log("Creating tour with data:", JSON.stringify(req.body, null, 2));
        const { tourGuideId, dailyItineraries, ...tourData } = req.body;

        // Log all the keys in the request body
        console.log("Request keys:", Object.keys(req.body));

        // Convert string values to appropriate types
        const formattedTourData = {
            ...tourData,
            duration: parseInt(tourData.duration, 10) || 1,
            price: parseFloat(tourData.price) || 0,
            maxParticipants: parseInt(tourData.maxParticipants, 10) || 1,
            difficulty: tourData.difficulty || 'Moderate',
            mealOptions: tourData.mealOptions || 'Bed & Breakfast',
            // Add default values for startDistrict and endDistrict since they're still required in the schema
            startDistrict: 'Colombo',
            endDistrict: 'Colombo'
        };

        // Verify tour guide exists
        if (!tourGuideId) {
            console.error("Tour guide ID is missing in request");
            return next(createError(400, 'Tour guide ID is required'));
        }
        
        const tourGuide = await TourGuide.findById(tourGuideId);
        if (!tourGuide) {
            console.error(`Tour guide with ID ${tourGuideId} not found`);
            return next(createError(404, 'Tour guide not found'));
        }

        // Process daily itineraries if provided, otherwise create defaults
        let finalDailyItineraries = [];
        
        if (dailyItineraries && Array.isArray(dailyItineraries) && dailyItineraries.length > 0) {
            // Process the provided itineraries
            finalDailyItineraries = dailyItineraries;
        } else {
            // Create default itineraries
            try {
                // Find a valid destination to use as default
                const Destination = mongoose.model('Destination');
                const destinations = await Destination.find().limit(2);
                
                if (destinations.length > 0) {
                    // Create a default day with real destinations
                    const defaultDay = {
                        day: 1,
                        destinations: destinations.map(dest => dest._id),
                        accommodations: []
                    };
                    
                    // Find a valid accommodation to use as default
                    try {
                        const Accommodation = mongoose.model('Accommodation');
                        const accommodations = await Accommodation.find().limit(1);
                        
                        if (accommodations.length > 0) {
                            defaultDay.accommodations = accommodations.map(acc => acc._id);
                        }
                    } catch (accErr) {
                        console.warn("Error finding default accommodations:", accErr.message);
                    }
                    
                    finalDailyItineraries = [defaultDay];
                    console.log("Created default daily itinerary with real destinations:", JSON.stringify(defaultDay, null, 2));
                } else {
                    console.error("No destinations found in database to create default itinerary");
                    return next(createError(400, 'No destinations available. Please create at least one destination first.'));
                }
            } catch (destErr) {
                console.error("Error finding destinations:", destErr.message);
                return next(createError(500, 'Error creating default itinerary: ' + destErr.message));
            }
        }
        
        // Create the tour with formatted data
        const tour = new Tour({
            ...formattedTourData,
            tourGuide: tourGuideId,
            dailyItineraries: finalDailyItineraries
        });
        
        // Log data being saved
        console.log("Tour data about to be saved:", JSON.stringify({
            name: tour.name,
            description: tour.description,
            difficulty: tour.difficulty,
            mealOptions: tour.mealOptions,
            tourGuide: tour.tourGuide,
            dailyItineraries: tour.dailyItineraries
        }, null, 2));
        
        // Save the tour to database
        await tour.save();
        
        // Verify the tour was saved with dailyItineraries
        const savedTour = await Tour.findById(tour._id);
        console.log("Tour after save:", {
            id: savedTour._id,
            hasItineraries: savedTour.dailyItineraries ? 'Yes' : 'No',
            itinerariesCount: savedTour.dailyItineraries ? savedTour.dailyItineraries.length : 0
        });
        
        // Populate the related data
        const populatedTour = await savedTour.populate([
            { path: 'tourGuide', select: 'name email phone' },
            { path: 'dailyItineraries.destinations', select: 'name location' },
            { path: 'dailyItineraries.accommodations', select: 'accName location' }
        ]);

        console.log("Tour created successfully:", tour._id);
        
        res.status(201).json({
            success: true,
            data: populatedTour
        });
    } catch (error) {
        console.error("Error creating tour:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            console.error("Validation errors:", messages);
            return next(createError(400, messages.join(', ')));
        }
        next(error);
    }
};

// @desc    Update tour
// @route   PUT /api/tours/:id
// @access  Private/Admin
export const updateTour = async (req, res, next) => {
    try {
        console.log("Updating tour with data:", JSON.stringify(req.body, null, 2));
        const { tourGuideId, dailyItineraries, ...updateData } = req.body;

        // Convert string values to appropriate types
        const formattedUpdateData = {
            ...updateData,
            duration: parseInt(updateData.duration, 10) || updateData.duration,
            price: parseFloat(updateData.price) || updateData.price,
            maxParticipants: parseInt(updateData.maxParticipants, 10) || updateData.maxParticipants,
            difficulty: updateData.difficulty || undefined,
            mealOptions: updateData.mealOptions || undefined,
            // Ensure startDistrict and endDistrict are present if they need to be updated
            startDistrict: updateData.startDistrict || 'Colombo',
            endDistrict: updateData.endDistrict || 'Colombo'
        };

        // If tourGuideId is provided, verify tour guide exists
        if (tourGuideId) {
            const tourGuide = await TourGuide.findById(tourGuideId);
            if (!tourGuide) {
                return next(createError(404, 'Tour guide not found'));
            }
            formattedUpdateData.tourGuide = tourGuideId;
        }

        // If daily itineraries are provided, validate them with detailed logging
        if (dailyItineraries) {
            console.log("Daily itineraries received for update:", JSON.stringify(dailyItineraries, null, 2));
            
            if (!Array.isArray(dailyItineraries)) {
                console.error("dailyItineraries is not an array:", typeof dailyItineraries);
                return next(createError(400, 'Daily itineraries must be an array'));
            }
            
            if (dailyItineraries.length === 0) {
                return next(createError(400, 'At least one daily itinerary is required'));
            }

            // Process and validate each day's data
            const processedItineraries = [];
            
            for (let i = 0; i < dailyItineraries.length; i++) {
                const day = dailyItineraries[i];
                
                // Basic validation checks
                if (!day || typeof day !== 'object') {
                    console.error(`Day ${i+1} is invalid:`, day);
                    return next(createError(400, `Day ${i+1} is missing or invalid`));
                }
                
                // Ensure day number exists or use index+1
                const dayNumber = day.day || (i + 1);
                console.log(`Processing day ${dayNumber} for update:`, JSON.stringify(day, null, 2));
                
                // Validate destinations
                if (!day.destinations) {
                    console.error(`No destinations for day ${dayNumber}`);
                    return next(createError(400, `Destinations are required for day ${dayNumber}`));
                }
                
                if (!Array.isArray(day.destinations)) {
                    console.error(`Destinations for day ${dayNumber} is not an array:`, typeof day.destinations);
                    return next(createError(400, `Destinations for day ${dayNumber} must be an array`));
                }
                
                if (day.destinations.length === 0) {
                    console.error(`Empty destinations array for day ${dayNumber}`);
                    return next(createError(400, `At least one destination is required for day ${dayNumber}`));
                }
                
                // Validate each destination ID
                for (let j = 0; j < day.destinations.length; j++) {
                    const destId = day.destinations[j];
                    if (!destId || (typeof destId !== 'string' && !destId._id)) {
                        console.error(`Invalid destination at index ${j} for day ${dayNumber}:`, destId);
                        return next(createError(400, `Invalid destination ID at position ${j+1} for day ${dayNumber}`));
                    }
                }
                
                // Process destinations to ensure they are valid IDs
                const destinationIds = day.destinations.map(dest => 
                    typeof dest === 'string' ? dest : dest._id
                );
                
                // Validate accommodations
                if (!day.accommodations) {
                    day.accommodations = []; // Default to empty array if not provided
                }
                
                if (!Array.isArray(day.accommodations)) {
                    console.error(`Accommodations for day ${dayNumber} is not an array:`, typeof day.accommodations);
                    return next(createError(400, `Accommodations for day ${dayNumber} must be an array`));
                }
                
                if (day.accommodations.length > 2) {
                    console.error(`Too many accommodations (${day.accommodations.length}) for day ${dayNumber}`);
                    return next(createError(400, `Maximum 2 accommodations allowed per day, got ${day.accommodations.length} for day ${dayNumber}`));
                }
                
                // Process accommodations to ensure they are valid IDs
                const accommodationIds = day.accommodations.map(acc => 
                    typeof acc === 'string' ? acc : acc._id
                );
                
                // Create a properly formatted day
                processedItineraries.push({
                    day: dayNumber,
                    destinations: destinationIds,
                    accommodations: accommodationIds
                });
            }
            
            console.log("Processed itineraries for update:", JSON.stringify(processedItineraries, null, 2));
            formattedUpdateData.dailyItineraries = processedItineraries;
        }

        const tour = await Tour.findByIdAndUpdate(
            req.params.id,
            formattedUpdateData,
            { new: true, runValidators: true }
        ).populate([
            { path: 'tourGuide', select: 'name email phone' },
            { path: 'dailyItineraries.destinations', select: 'name location' },
            { path: 'dailyItineraries.accommodations', select: 'accName location' }
        ]);

        if (!tour) {
            return next(createError(404, 'Tour not found'));
        }

        console.log("Tour updated successfully:", tour._id);
        
        res.status(200).json({
            success: true,
            data: tour
        });
    } catch (error) {
        console.error("Error updating tour:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            console.error("Validation errors:", messages);
            return next(createError(400, messages.join(', ')));
        }
        next(error);
    }
};

// @desc    Delete tour
// @route   DELETE /api/tours/:id
// @access  Private/Admin
export const deleteTour = async (req, res, next) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id);

        if (!tour) {
            return next(createError(404, 'Tour not found'));
        }

        res.status(200).json({
            success: true,
            message: 'Tour deleted successfully'
        });
    } catch (error) {
        console.error("Error deleting tour:", error);
        next(error);
    }
}; 