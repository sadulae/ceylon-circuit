const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB successfully');

    // Delete existing admin if exists
    await User.deleteOne({ email: 'admin@ceyloncircuit.com' });
    console.log('Cleaned up existing admin user');

    // Create admin user without hashing password (model will handle it)
    const adminUser = new User({
      username: 'admin',
      email: 'admin@ceyloncircuit.com',
      password: 'admin123',  // Model middleware will hash this
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phone: '+94 11 234 5678',
      location: 'Colombo, Sri Lanka',
      bio: 'System Administrator for Ceylon Circuit',
      interests: ['Travel Management', 'System Administration', 'Customer Service']
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Admin Credentials:');
    console.log('Email: admin@ceyloncircuit.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedAdmin(); 