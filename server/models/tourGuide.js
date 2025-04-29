import mongoose from 'mongoose';

const tourGuideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  languages: [{
    type: String,
    required: true
  }],
  specializations: [{
    type: String,
    required: true
  }],
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  availability: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  bio: {
    type: String
  },
  image: {
    type: String
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

const TourGuide = mongoose.model('TourGuide', tourGuideSchema);

export default TourGuide;
