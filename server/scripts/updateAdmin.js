import mongoose from 'mongoose';
import User from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const updateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@ceyloncircuit.com';
        const result = await User.findOneAndUpdate(
            { email: adminEmail },
            { isAdmin: true },
            { new: true }
        );

        if (result) {
            console.log('Admin user updated successfully:', result);
        } else {
            console.log('Admin user not found');
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateAdmin(); 