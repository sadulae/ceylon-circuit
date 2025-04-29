import jwt from 'jsonwebtoken';
import Accommodation from '../models/accModels.js';
import { createError } from '../utils/error.js';

// @desc    Register accommodation
// @route   POST /api/accommodation/add
// @access  Private/Admin
export const registerAccommodation = async (req, res, next) => {
  try {
    console.log('Accommodation registration request body:', req.body);
    const { 
      accName, 
      location, 
      address, 
      availableSingleRooms, 
      availableDoubleRooms, 
      availableRooms, 
      facilities 
    } = req.body;

    // Check if required fields are present
    if (!accName || !location || !address) {
      console.log('Missing required fields in request:', { accName, location, address });
      return next(createError(400, "Missing required fields"));
    }

    // Check if accommodation already exists
    const existingAcc = await Accommodation.findOne({ accName });
    if (existingAcc) {
      return next(createError(400, "Accommodation already exists"));
    }

    // Create new accommodation
    const newAccommodation = new Accommodation({
      accName,
      location,
      address,
      availableSingleRooms: availableSingleRooms || 0,
      availableDoubleRooms: availableDoubleRooms || 0,
      availableRooms: availableRooms || 0,
      facilities: facilities || []
    });

    await newAccommodation.save();

    console.log('Accommodation created successfully:', newAccommodation);

    res.status(201).json({
      success: true,
      message: "Accommodation registered successfully",
      data: newAccommodation
    });
  } catch (error) {
    console.error('Error creating accommodation:', error);
    next(error);
  }
};

// @desc    Get all accommodations
// @route   GET /api/accommodation/fetchAll
// @access  Public
export const getAccommodations = async (req, res, next) => {
  try {
    const accommodations = await Accommodation.find();
    console.log("Server: Fetched accommodations count:", accommodations.length);
    
    // Use consistent response format
    res.status(200).json({
      success: true,
      count: accommodations.length,
      accommodations: accommodations // Use 'accommodations' field consistently
    });
  } catch (error) {
    console.error("Server: Error fetching accommodations:", error);
    next(error);
  }
};

// @desc    Get accommodation by ID
// @route   GET /api/accommodation/:id
// @access  Public
export const getAccommodation = async (req, res, next) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return next(createError(404, "Accommodation not found"));
    }
    res.status(200).json({
      success: true,
      data: accommodation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update accommodation details
// @route   PUT /api/accommodation/update/:id
// @access  Private/Admin
export const updateAccommodation = async (req, res, next) => {
  try {
    const { accName, location, address, contact, email, description, roomTypes } = req.body;

    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return next(createError(404, "Accommodation not found"));
    }

    // Update fields
    if (accName) accommodation.accName = accName;
    if (location) accommodation.location = location;
    if (address) accommodation.address = address;
    if (contact) accommodation.contact = contact;
    if (email) accommodation.email = email;
    if (description) accommodation.description = description;
    if (roomTypes) accommodation.roomTypes = roomTypes;

    await accommodation.save();

    res.status(200).json({
      success: true,
      message: "Accommodation updated successfully",
      data: accommodation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete accommodation
// @route   DELETE /api/accommodation/delete/:id
// @access  Private/Admin
export const deleteAccommodation = async (req, res, next) => {
  try {
    const accommodation = await Accommodation.findByIdAndDelete(req.params.id);
    if (!accommodation) {
      return next(createError(404, "Accommodation not found"));
    }
    res.status(200).json({
      success: true,
      message: "Accommodation deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
