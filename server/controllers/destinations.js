const Destination = require('../models/Destination');

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
const getAllDestinations = async (req, res) => {
  try {
    const { search, category, isActive } = req.query;
    const query = {};
    
    if (search) query.$text = { $search: search };
    if (category) query.categories = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const destinations = await Destination.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: destinations.length, data: destinations });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
const getDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }
    res.json({ success: true, data: destination });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Create destination
// @route   POST /api/destinations
// @access  Private/Admin
const createDestination = async (req, res) => {
    try {
      console.log("Incoming request body:", req.body); // Log input
      
      const destination = await Destination.create(req.body);
      console.log("Created destination:", destination); // Log success
      
      res.status(201).json(destination);
    } catch (err) {
      console.error("Full error object:", err); // Detailed log
      
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ errors });
      }
      
      res.status(500).json({ 
        error: "Server error",
        message: err.message 
      });
    }
  };

// @desc    Update destination
// @route   PUT /api/destinations/:id
// @access  Private/Admin
const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }

    const updatableFields = [
      'name', 'description', 'location', 'images', 
      'categories', 'tags', 'bestTimeToVisit', 
      'weather', 'languages', 'isActive'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        destination[field] = req.body[field];
      }
    });

    await destination.save();
    res.json({ success: true, data: destination });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Toggle destination status
// @route   PATCH /api/destinations/:id/status
// @access  Private/Admin
const toggleDestinationStatus = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }

    destination.isActive = !destination.isActive;
    await destination.save();
    res.json({ 
      success: true, 
      data: { 
        _id: destination._id, 
        name: destination.name, 
        isActive: destination.isActive 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};



module.exports = {
  getAllDestinations,
  getDestination,
  createDestination,
  updateDestination,
  toggleDestinationStatus,
};