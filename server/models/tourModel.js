import mongoose from 'mongoose';
import Destination from './Destination.js';
import Accommodation from './accModels.js';

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Moderate', 'Challenging', 'Difficult'],
    default: 'Moderate'
  },
  mealOptions: {
    type: String,
    required: true,
    enum: ['Full Board', 'Half Board', 'Bed & Breakfast', 'Room Only', 'All Inclusive'],
    default: 'Bed & Breakfast'
  },
  places: [{
    name: String,
    district: String,
    description: String,
    order: Number
  }],
  tourGuide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourGuide',
    required: true
  },
  dailyItineraries: [{
    day: {
      type: Number,
      required: true
    },
    destinations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: true
    }],
    accommodations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accommodation',
      required: false
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add pre-save middleware to update the updatedAt field and validate data
tourSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  // Log the document being saved
  console.log(`Saving tour: ${this.name}`);
  console.log(`Tour has ${this.dailyItineraries ? this.dailyItineraries.length : 0} daily itineraries`);
  
  // If no daily itineraries, create one with default values
  if (!this.dailyItineraries || this.dailyItineraries.length === 0) {
    console.warn(`Tour ${this.name} has no daily itineraries, creating defaults`);
    
    try {
      // Find a valid destination to use as default
      const destinations = await Destination.find().limit(2);
      
      if (destinations.length > 0) {
        // Create a default day with destinations
        const defaultDay = {
          day: 1,
          destinations: destinations.map(dest => dest._id),
          accommodations: []
        };
        
        // Find a valid accommodation to use as default
        try {
          const accommodations = await Accommodation.find().limit(1);
          
          if (accommodations.length > 0) {
            defaultDay.accommodations = accommodations.map(acc => acc._id);
          }
        } catch (err) {
          console.warn("Error finding default accommodations:", err.message);
        }
        
        // Set the dailyItineraries
        this.dailyItineraries = [defaultDay];
        console.log("Created default daily itinerary:", JSON.stringify(defaultDay, null, 2));
      } else {
        console.error("Cannot create default daily itinerary: no destinations found");
      }
    } catch (err) {
      console.error("Error creating default daily itinerary:", err.message);
    }
  } else {
    // Log each day's data
    this.dailyItineraries.forEach((day, index) => {
      console.log(`Day ${day.day || index + 1}:`);
      console.log(`- Destinations: ${day.destinations ? day.destinations.length : 0}`);
      console.log(`- Accommodations: ${day.accommodations ? day.accommodations.length : 0}`);
    });
  }
  
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

export default Tour; 