import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load env vars
dotenv.config();

const resetAdminPassword = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Find admin user
        const admin = await User.findOne({ email: 'admin@ceyloncircuit.com' });
        if (!admin) {
            console.log('Admin user not found');
            process.exit(1);
        }

        // Update password
        admin.password = 'admin123';
        await admin.save();
        
        console.log('Admin password reset successfully');
        console.log('Email: admin@ceyloncircuit.com');
        console.log('Password: admin123');
        process.exit();
    } catch (error) {
        console.error('Error resetting admin password:', error);
        process.exit(1);
    }
};

resetAdminPassword(); 