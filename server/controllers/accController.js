const Accommodation = require('../models/accModels');
const jwt = require('jsonwebtoken');


// @desc    Register accommodation
// @route   POST /api/accommodation/add
// @access  Public
exports.registerAccommodation = async (req, res) => {
  try {
    console.log("datarece", req.body)
    console.log("accName", req.body.accName)
    console.log("location", req.body.location)

    const { accName , location, address, availableSingleRooms ,availableDoubleRooms ,availableRooms ,facilities } = req.body;
    console.log("accName", req.body.accName)
    console.log("location", req.body.location)
    console.log("address", address)
    console.log("availableSingleRooms", availableSingleRooms)
    console.log("availableDoubleRooms", availableDoubleRooms)
    console.log("facilities", facilities)
    

    // Validate required fields
    if (!accName || !location || !address || !availableSingleRooms ||!availableDoubleRooms || !availableRooms || !facilities) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if accommodation already exists
    const existingAccommodation = await Accommodation.findOne({ accName, location });
    if (existingAccommodation) {
      return res.status(400).json({ message: 'Accommodation already registered' });
    }

    // Create accommodation
    const accommodation = await Accommodation.create({
      accName,
      location,
      address,
      availableSingleRooms,
      availableDoubleRooms,
      availableRooms,
      facilities
    });

    res.status(201).json({ success: true, accommodation });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// @desc    Get all accommodations
// @route   GET /api/accommodations
// @access  Public
exports.getAccommodations = async (req, res) => {
  console.log("inside")
  try {
    const accommodations = await Accommodation.find();
    console.log("accommodations",accommodations)
    res.json({ success: true, accommodations });
  } catch (err) {
    console.error('Error fetching accommodations:', err);
    res.status(500).json({ message: 'Error retrieving accommodations' });
  }
};

// @desc    Get accommodation by ID
// @route   GET /api/accommodations/:id
// @access  Public
exports.getAccommodationById = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    res.json({ success: true, accommodation });
  } catch (err) {
    console.error('Error fetching accommodation:', err);
    res.status(500).json({ message: 'Error retrieving accommodation' });
  }
};

// @desc    Update accommodation details
// @route   PUT /api/accommodations/:id
// @access  Private (Admin only)
exports.updateAccommodation = async (req, res) => {
  try {
    const { accName , location, address, availableSingleRooms ,availableDoubleRooms ,availableRooms ,facilities } = req.body;

    const updatedAccommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          accName: accName || undefined,
          location: location || undefined,
          address: address || undefined,
          availableSingleRooms: availableSingleRooms || undefined,
          availableDoubleRooms: availableDoubleRooms || undefined,
          availableRooms: availableRooms || undefined,
          facilities: facilities || undefined,
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedAccommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    res.json({ success: true, accommodation: updatedAccommodation });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Error updating accommodation' });
  }
};

// @desc    Delete accommodation
// @route   DELETE /api/accommodations/:id
// @access  Private (Admin only)
exports.deleteAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findByIdAndDelete(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    res.json({ success: true, message: 'Accommodation deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Error deleting accommodation' });
  }
};
