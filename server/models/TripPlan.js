import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  location: String,
  cost: Number
});

const dayPlanSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  activities: [activitySchema],
  accommodation: {
    name: String,
    type: String,
    cost: Number
  },
  transportation: {
    type: String,
    cost: Number,
    details: String
  }
});

const tripPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  interests: {
    type: [String],
    required: true
  },
  budget: {
    type: String,
    enum: ['budget', 'moderate', 'luxury'],
    required: true
  },
  transportation: {
    type: String,
    enum: ['public', 'private', 'mixed'],
    required: true
  },
  specialRequirements: String,
  itinerary: [dayPlanSchema],
  estimatedBudget: {
    type: Number,
    required: true
  },
  totalDistance: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'completed', 'cancelled'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
tripPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TripPlan = mongoose.model('TripPlan', tripPlanSchema);

export default TripPlan; 