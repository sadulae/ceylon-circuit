import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A destination must have a name'],
    unique: true,
    trim: true,
    maxlength: [100, 'A destination name must have less than or equal to 100 characters']
  },
  description: {
    type: String,
    required: [true, 'A destination must have a description'],
    trim: true
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [200, 'Summary cannot be more than 200 characters']
  },
  location: {
    address: {
      type: String,
      required: [true, 'A destination must have an address']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function(coords) {
          return !coords.length || coords.length === 2;
        },
        message: 'Coordinates must be in the format [longitude, latitude]'
      }
    },
    mapLink: {
      type: String,
      validate: {
        validator: function(link) {
          if (!link) return true; // Allow empty links (validator will be skipped)
          
          // List of valid Google Maps URL patterns
          const validPatterns = [
            'google.com/maps',
            'maps.google.com',
            'goo.gl/maps',
            'maps.app.goo.gl'
          ];
          
          // Check if any of the valid patterns are in the URL
          return validPatterns.some(pattern => link.includes(pattern));
        },
        message: 'Please provide a valid Google Maps link (e.g., google.com/maps, maps.app.goo.gl)'
      }
    },
    district: {
      type: String,
      required: [true, 'A destination must belong to a district'],
      enum: {
        values: [
          'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 
          'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 
          'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 
          'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 
          'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
        ],
        message: 'Please provide a valid district in Sri Lanka'
      }
    },
    province: {
      type: String,
      enum: {
        values: [
          'Central', 'Eastern', 'North Central', 'Northern', 
          'North Western', 'Sabaragamuwa', 'Southern', 
          'Uva', 'Western'
        ],
        message: 'Please provide a valid province in Sri Lanka'
      }
    }
  },
  images: [String],
  mainImage: {
    type: String,
    required: [true, 'A destination must have a main image']
  },
  category: {
    type: String,
    required: [true, 'A destination must have a category'],
    enum: {
      values: [
        'Beach', 'Cultural', 'Historical', 'Religious', 'Wildlife', 
        'Nature', 'Adventure', 'Heritage', 'City', 'Other'
      ],
      message: 'Please provide a valid category'
    }
  },
  features: {
    type: [String],
    validate: {
      validator: function(features) {
        // If no features are provided, that's fine
        if (!features || features.length === 0) return true;
        
        const validFeatures = [
          'Swimming', 'Hiking', 'Photography', 'Wildlife Viewing', 
          'Camping', 'Shopping', 'Local Cuisine', 'Historical Tours',
          'Water Sports', 'Cultural Experience', 'Pilgrimage', 
          'Bird Watching', 'Boat Rides', 'Fishing', 'Diving'
        ];
        return features.every(feature => validFeatures.includes(feature));
      },
      message: 'Please provide valid features'
    }
  },
  bestTimeToVisit: {
    season: {
      type: String,
      enum: {
        values: ['Dry Season', 'Rainy Season', 'Year Round'],
        message: 'Season must be either Dry Season, Rainy Season, or Year Round'
      }
    },
    months: [String],
    notes: String
  },
  entryFee: {
    local: {
      type: Number,
      default: 0
    },
    foreign: {
      type: Number,
      default: 0
    },
    notes: String
  },
  openingHours: {
    open: String,
    close: String,
    daysClosed: [String],
    notes: String
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: val => Math.round(val * 10) / 10 // Round to 1 decimal place
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  tips: [String],
  nearbyPlaces: [{
    name: String,
    distance: Number, // in kilometers
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Update the updatedAt timestamp before saving
destinationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexing for efficient queries
destinationSchema.index({ name: 1 });
destinationSchema.index({ "location.district": 1 });
destinationSchema.index({ category: 1 });
destinationSchema.index({ ratingsAverage: -1 });

const Destination = mongoose.model('Destination', destinationSchema);

export default Destination; 