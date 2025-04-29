import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load env vars
dotenv.config();

const adminUser = {
    username: 'admin',
    email: 'admin@ceyloncircuit.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    phone: '1234567890',
    location: 'Colombo',
    bio: 'System Administrator'
};

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminUser.email });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit();
        }

        // Create admin user
        const user = await User.create(adminUser);
        console.log('Admin user created successfully:', user);
        process.exit();
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

seedAdmin(); 