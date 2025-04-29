import Tour from '../models/tourModel.js';
import TourGuide from '../models/tourGuide.js';
import Destination from '../models/destinationModel.js';
import Accommodation from '../models/accModels.js';
import mongoose from 'mongoose';

// Get all tour packages
export const getAllTourPackages = async (req, res) => {
  try {
    const tours = await Tour.find()
      .populate('tourGuide', 'name district languages specializations')
      .populate('dailyItineraries.destination', 'name location.district category mainImage')
      .populate('dailyItineraries.accommodation', 'accName location facilities')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: tours.length,
      data: tours
    });
  } catch (error) {
    console.error('Error getting tour packages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tour packages',
      error: error.message
    });
  }
};

// Get a single tour package by ID
export const getTourPackageById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate('tourGuide', 'name district languages specializations experience bio image')
      .populate('dailyItineraries.destination', 'name description location.district category mainImage features')
      .populate('dailyItineraries.accommodation', 'accName location facilities availableRooms');
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: tour
    });
  } catch (error) {
    console.error('Error getting tour package by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tour package',
      error: error.message
    });
  }
};

// Create a new tour package
export const createTourPackage = async (req, res) => {
  try {
    const {
      name,
      description,
      duration,
      price,
      maxParticipants,
      startDistrict,
      endDistrict,
      tourGuide,
      dailyItineraries
    } = req.body;

    // Validate tour guide exists
    if (tourGuide) {
      const guideExists = await TourGuide.findById(tourGuide);
      if (!guideExists) {
        return res.status(400).json({
          success: false,
          message: 'Tour guide not found'
        });
      }
    }

    // Validate daily itineraries
    if (dailyItineraries && dailyItineraries.length > 0) {
      for (const day of dailyItineraries) {
        // Validate destination exists
        if (day.destination) {
          const destinationExists = await Destination.findById(day.destination);
          if (!destinationExists) {
            return res.status(400).json({
              success: false,
              message: `Destination not found for day ${day.day}`
            });
          }
        }

        // Validate accommodation exists
        if (day.accommodation) {
          const accommodationExists = await Accommodation.findById(day.accommodation);
          if (!accommodationExists) {
            return res.status(400).json({
              success: false,
              message: `Accommodation not found for day ${day.day}`
            });
          }
        }
      }
    }

    // Create new tour package
    const newTourPackage = await Tour.create({
      name,
      description,
      duration,
      price,
      maxParticipants,
      startDistrict,
      endDistrict,
      tourGuide,
      dailyItineraries: dailyItineraries || []
    });

    res.status(201).json({
      success: true,
      message: 'Tour package created successfully',
      data: newTourPackage
    });
  } catch (error) {
    console.error('Error creating tour package:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating tour package',
      error: error.message
    });
  }
};

// Update a tour package
export const updateTourPackage = async (req, res) => {
  try {
    const tourId = req.params.id;
    const updateData = req.body;

    // Validate tour guide if provided
    if (updateData.tourGuide) {
      const guideExists = await TourGuide.findById(updateData.tourGuide);
      if (!guideExists) {
        return res.status(400).json({
          success: false,
          message: 'Tour guide not found'
        });
      }
    }

    // Validate daily itineraries if provided
    if (updateData.dailyItineraries && updateData.dailyItineraries.length > 0) {
      for (const day of updateData.dailyItineraries) {
        // Validate destination exists
        if (day.destination) {
          const destinationExists = await Destination.findById(day.destination);
          if (!destinationExists) {
            return res.status(400).json({
              success: false,
              message: `Destination not found for day ${day.day}`
            });
          }
        }

        // Validate accommodation exists
        if (day.accommodation) {
          const accommodationExists = await Accommodation.findById(day.accommodation);
          if (!accommodationExists) {
            return res.status(400).json({
              success: false,
              message: `Accommodation not found for day ${day.day}`
            });
          }
        }
      }
    }

    // Find and update the tour package
    const updatedTourPackage = await Tour.findByIdAndUpdate(
      tourId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tour package updated successfully',
      data: updatedTourPackage
    });
  } catch (error) {
    console.error('Error updating tour package:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tour package',
      error: error.message
    });
  }
};

// Delete a tour package
export const deleteTourPackage = async (req, res) => {
  try {
    const tourId = req.params.id;
    const deletedTour = await Tour.findByIdAndDelete(tourId);

    if (!deletedTour) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tour package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tour package:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting tour package',
      error: error.message
    });
  }
};

// Get available resources for tour packages
export const getAvailableResources = async (req, res) => {
  try {
    const guides = await TourGuide.find().select('name district languages specializations experience');
    const destinations = await Destination.find().select('name location.district category mainImage');
    const accommodations = await Accommodation.find().select('accName location facilities availableRooms');

    res.status(200).json({
      success: true,
      data: {
        guides,
        destinations,
        accommodations
      }
    });
  } catch (error) {
    console.error('Error fetching available resources:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available resources',
      error: error.message
    });
  }
}; 