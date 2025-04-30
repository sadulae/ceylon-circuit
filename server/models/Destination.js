import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const destinationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A destination must have a name'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'A destination must have a category'],
      enum: {
        values: ['Beach', 'Mountain', 'Cultural', 'Wildlife', 'Historical', 'Waterfall', 'Adventure'],
        message: 'Category must be one of: Beach, Mountain, Cultural, Wildlife, Historical, Waterfall, Adventure',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'A destination must have a description'],
      trim: true,
    },
    location: {
      province: {
        type: String,
        required: [true, 'A destination must have a province'],
        enum: {
          values: [
            'Western',
            'Central',
            'Southern',
            'Northern',
            'Eastern',
            'North Western',
            'North Central',
            'Uva',
            'Sabaragamuwa',
          ],
          message: 'Province must be one of the 9 provinces of Sri Lanka',
        },
      },
      district: {
        type: String,
        required: [true, 'A destination must have a district'],
      },
      address: {
        type: String,
        trim: true,
      },
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
    tags: [String],
    facilities: [String],
    images: [String],
    visitorTips: [String],
    bestTimeToVisit: {
      type: String,
      trim: true,
    },
    entryFee: {
      type: String,
      trim: true,
    },
    contactInfo: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for reviews (if implemented)
destinationSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'destination',
  localField: '_id',
});

// Create a text index for search functionality
destinationSchema.index({ 
  name: 'text', 
  description: 'text', 
  'location.province': 'text', 
  'location.district': 'text',
  tags: 'text'
});

// Pre-save middleware to ensure coordinates are properly formatted
destinationSchema.pre('save', function(next) {
  // Format latitude and longitude to have max 6 decimal places
  if (this.coordinates && this.coordinates.latitude) {
    this.coordinates.latitude = parseFloat(this.coordinates.latitude.toFixed(6));
  }
  
  if (this.coordinates && this.coordinates.longitude) {
    this.coordinates.longitude = parseFloat(this.coordinates.longitude.toFixed(6));
  }
  
  next();
});

const Destination = mongoose.model('Destination', destinationSchema);

export default Destination; 