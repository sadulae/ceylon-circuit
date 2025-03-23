const TripPlan = require('../models/TripPlan');

// @desc    Generate a trip plan based on preferences
// @route   POST /api/tripbot/generate-plan
// @access  Private
exports.generateTripPlan = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      interests,
      budget,
      transportation,
      specialRequirements
    } = req.body;

    // Calculate trip duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // Mock data for demonstration - replace with actual destination matching logic
    const destinations = {
      cultural: ['Kandy', 'Anuradhapura', 'Polonnaruwa', 'Dambulla'],
      beaches: ['Mirissa', 'Unawatuna', 'Trincomalee', 'Pasikuda'],
      wildlife: ['Yala', 'Udawalawe', 'Minneriya', 'Wilpattu'],
      nature: ['Ella', 'Nuwara Eliya', 'Horton Plains', 'Sinharaja'],
      adventure: ['Kitulgala', 'Knuckles Mountain', 'Pidurangala', 'Riverston']
    };

    // Generate itinerary based on interests
    const itinerary = [];
    let currentDate = new Date(startDate);

    for (let day = 0; day < duration; day++) {
      const dayPlan = {
        date: new Date(currentDate),
        location: '',
        activities: []
      };

      // Select destination based on interests
      const selectedInterest = interests[day % interests.length];
      const destinationType = Object.keys(destinations).find(type => 
        selectedInterest.toLowerCase().includes(type.toLowerCase())
      );
      
      if (destinationType) {
        const destinationList = destinations[destinationType];
        dayPlan.location = destinationList[day % destinationList.length];

        // Add activities for the day
        dayPlan.activities = [
          {
            time: '09:00',
            title: `Explore ${dayPlan.location}`,
            description: `Discover the beauty of ${dayPlan.location}`,
            duration: '3 hours'
          },
          {
            time: '13:00',
            title: 'Local Cuisine Experience',
            description: 'Enjoy authentic Sri Lankan cuisine',
            duration: '1.5 hours'
          },
          {
            time: '15:00',
            title: 'Cultural Activity',
            description: 'Immerse in local culture and traditions',
            duration: '2 hours'
          }
        ];
      }

      itinerary.push(dayPlan);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate estimated budget based on preferences
    const budgetRates = {
      budget: 50,
      moderate: 100,
      luxury: 200
    };
    const dailyRate = budgetRates[budget.toLowerCase()] || budgetRates.moderate;
    const estimatedBudget = dailyRate * duration;

    const tripPlan = {
      userId: req.user.id,
      startDate,
      endDate,
      duration,
      interests,
      budget,
      transportation,
      specialRequirements,
      itinerary,
      estimatedBudget,
      totalDistance: Math.floor(Math.random() * 500) + 100 // Mock distance calculation
    };

    res.status(200).json(tripPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating trip plan' });
  }
};

// @desc    Save a generated trip plan
// @route   POST /api/tripbot/save-plan
// @access  Private
exports.saveTripPlan = async (req, res) => {
  try {
    const tripPlan = await TripPlan.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json(tripPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving trip plan' });
  }
};

// @desc    Get a specific trip plan
// @route   GET /api/tripbot/plan/:id
// @access  Private
exports.getTripPlan = async (req, res) => {
  try {
    const tripPlan = await TripPlan.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!tripPlan) {
      return res.status(404).json({ message: 'Trip plan not found' });
    }

    res.status(200).json(tripPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving trip plan' });
  }
};

// @desc    Update a trip plan
// @route   PUT /api/tripbot/plan/:id
// @access  Private
exports.updateTripPlan = async (req, res) => {
  try {
    const tripPlan = await TripPlan.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!tripPlan) {
      return res.status(404).json({ message: 'Trip plan not found' });
    }

    res.status(200).json(tripPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating trip plan' });
  }
}; 