import mongoose from 'mongoose';

const accommodationSchema = new mongoose.Schema({
  accName: {
    type: String,
    required: [true, 'Please add an accommodation name'],
    unique: true,
    trim: true,
    minlength: [3, 'Accommodation name must be at least 3 characters']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
    trim: true
  },
  availableSingleRooms: {
    type: Number,
    default: 0,
    min: [0, 'Room count cannot be negative']
  },
  availableDoubleRooms: {
    type: Number,
    default: 0,
    min: [0, 'Room count cannot be negative']
  },
  availableRooms: {
    type: Number,
    default: 0,
    min: [0, 'Room count cannot be negative']
  },
  facilities: {
    type: [String],
    enum: [
      "WiFi", "Parking", "Swimming Pool", "Gym", "Laundry Service", "24/7 Security"
    ],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Accommodation = mongoose.model('Accommodation', accommodationSchema);

export default Accommodation;
