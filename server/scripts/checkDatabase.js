import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Destination from '../models/Destination.js';

// Load env vars
dotenv.config();

const checkDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected Successfully');

    // Count destinations
    const destinationCount = await Destination.countDocuments();
    console.log(`Number of destinations in database: ${destinationCount}`);

    // If there are destinations, show their names
    if (destinationCount > 0) {
      const destinations = await Destination.find().select('name category');
      console.log('\nDestinations:');
      destinations.forEach(dest => {
        console.log(`- ${dest.name} (${dest.category})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDatabase(); 