const mongoose = require('mongoose');
const { Schema } = mongoose;

const destinationSchema = new Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },

    // Location Details
    location: {
      city: { type: String, required: true },
      country: { type: String, required: true },
      continent: { 
        type: String, 
        enum: ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'] 
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
      timeZone: String,
    },

    // Media
    images: [{
      url: String,
      caption: String,
      isFeatured: Boolean,
    }],

    // Categorization
    categories: [{
      type: String,
      enum: ['Beach', 'Mountain', 'City', 'Historical', 'Adventure', 'Wildlife', 'Religious', 'Luxury'],
    }],
    tags: [String],

    // Travel Info
    bestTimeToVisit: [String],
    weather: {
      averageTemp: Number,
      rainySeason: [String],
      bestSeason: String,
    },
    languages: [String],

    // Status
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { timestamps: true } // Handles createdAt/updatedAt automatically
);

// Indexes
destinationSchema.index({ name: 'text', description: 'text' });
destinationSchema.index({ 'location.coordinates': '2dsphere' });

const Destination = mongoose.model('Destination', destinationSchema);
module.exports = Destination;