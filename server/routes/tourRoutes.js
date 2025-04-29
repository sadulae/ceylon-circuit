import express from 'express';
import { createTour, getTours, getTourById, updateTour, deleteTour } from '../controllers/tourController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';
import Tour from '../models/tourModel.js';
import Destination from '../models/Destination.js';
import Accommodation from '../models/accModels.js';
import mongoose from 'mongoose';

const router = express.Router();

// Tour routes
router.post('/', verifyAdmin, createTour);
router.get('/', getTours);
router.get('/:id', getTourById);
router.put('/:id', verifyAdmin, updateTour);
router.delete('/:id', verifyAdmin, deleteTour);

// Special route to fix tours missing daily itineraries
router.get('/admin/fix-tours', verifyAdmin, async (req, res, next) => {
    try {
        // Find all tours missing daily itineraries
        const toursToFix = await Tour.find({
            $or: [
                { dailyItineraries: { $exists: false } },
                { dailyItineraries: { $size: 0 } }
            ]
        });
        
        console.log(`Found ${toursToFix.length} tours to fix`);
        
        // Get default destinations and accommodations
        const destinations = await Destination.find().limit(2);
        const accommodations = await Accommodation.find().limit(1);
        
        if (destinations.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No destinations found to use as defaults'
            });
        }
        
        // Create a default day
        const defaultDay = {
            day: 1,
            destinations: destinations.map(dest => dest._id),
            accommodations: accommodations.map(acc => acc._id)
        };
        
        // Update each tour
        const updateResults = [];
        for (const tour of toursToFix) {
            tour.dailyItineraries = [defaultDay];
            await tour.save();
            updateResults.push({
                id: tour._id,
                name: tour.name,
                status: 'fixed'
            });
        }
        
        res.status(200).json({
            success: true,
            message: `Fixed ${updateResults.length} tours`,
            data: updateResults
        });
    } catch (error) {
        console.error('Error fixing tours:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 