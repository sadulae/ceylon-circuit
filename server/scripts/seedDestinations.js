import mongoose from 'mongoose';
import { seedDestinations } from '../data/destinations.js';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected...');
    // Seed destinations
    return seedDestinations();
  })
  .then(() => {
    console.log('Destinations seeded successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  }); 