import TourGuide from '../models/tourGuide.js';
import { createError } from '../utils/error.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// @desc    Get all guides
// @route   GET /api/guides
// @access  Public
export const getGuides = async (req, res, next) => {
    try {
        const guides = await TourGuide.find().sort({ name: 1 });
        res.status(200).json({
            success: true,
            data: guides
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single guide
// @route   GET /api/guides/:id
// @access  Public
export const getGuideById = async (req, res, next) => {
    try {
        const guide = await TourGuide.findById(req.params.id);
        
        if (!guide) {
            return next(createError(404, 'Tour guide not found'));
        }

        res.status(200).json({
            success: true,
            data: guide
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new guide
// @route   POST /api/guides
// @access  Private/Admin
export const createGuide = async (req, res, next) => {
    try {
        console.log('Create guide request body:', req.body);
        console.log('Create guide request files:', req.files);
        console.log('User making request:', req.user);

        // Get data from FormData
        const {
            name,
            email,
            phone,
            district,
            languages,
            specializations,
            experience,
            bio,
            rating
        } = req.body;

        // Parse arrays if they are strings
        let parsedLanguages = languages;
        let parsedSpecializations = specializations;

        try {
            if (typeof languages === 'string') {
                parsedLanguages = JSON.parse(languages);
            }
            if (typeof specializations === 'string') {
                parsedSpecializations = JSON.parse(specializations);
            }
        } catch (parseError) {
            console.error('Error parsing arrays:', parseError);
            return next(createError(400, 'Invalid format for languages or specializations'));
        }

        const guideData = {
            name,
            email,
            phone,
            district,
            languages: parsedLanguages,
            specializations: parsedSpecializations,
            experience: Number(experience),
            bio: bio || '',
            rating: Number(rating),
            createdAt: Date.now()
        };

        // Handle file upload if present
        if (req.files && req.files.image) {
            try {
                const file = req.files.image;
                const fileName = `${Date.now()}-${file.name}`;
                const uploadDir = join(__dirname, '..', 'uploads');
                const uploadPath = join(uploadDir, fileName);

                // Ensure uploads directory exists
                if (!existsSync(uploadDir)) {
                    mkdirSync(uploadDir, { recursive: true });
                }

                await file.mv(uploadPath);
                guideData.image = fileName;
                console.log('File uploaded successfully:', fileName);
            } catch (uploadError) {
                console.error('File upload error:', uploadError);
                // Don't fail the entire creation if file upload fails
                // Just log the error and continue without the image
            }
        }

        console.log('Create guide data:', guideData);

        // Create the guide
        const guide = await TourGuide.create(guideData);

        if (!guide) {
            console.error('Failed to create guide');
            return next(createError(500, 'Failed to create tour guide'));
        }

        console.log('Successfully created guide:', guide);
        res.status(201).json({
            success: true,
            data: guide
        });
    } catch (error) {
        console.error('Create guide error:', error);
        if (error.name === 'ValidationError') {
            return next(createError(400, error.message));
        }
        next(createError(500, error.message || 'Internal server error'));
    }
};

// @desc    Update guide
// @route   PUT /api/guides/:id
// @access  Private/Admin
export const updateGuide = async (req, res, next) => {
    try {
        console.log('Update guide request received for ID:', req.params.id);
        console.log('Update guide request body keys:', Object.keys(req.body));
        console.log('Update guide request files:', req.files ? Object.keys(req.files) : 'No files');
        
        // First check if guide exists
        const existingGuide = await TourGuide.findById(req.params.id);
        if (!existingGuide) {
            console.error('Guide not found:', req.params.id);
            return next(createError(404, 'Tour guide not found'));
        }
        
        // Prepare update data starting with existing data
        const updateData = {};
        
        // Process simple fields
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.email) updateData.email = req.body.email;
        if (req.body.phone) updateData.phone = req.body.phone;
        if (req.body.district) updateData.district = req.body.district;
        if (req.body.bio) updateData.bio = req.body.bio;
        if (req.body.experience) updateData.experience = Number(req.body.experience);
        if (req.body.rating) updateData.rating = Number(req.body.rating);

        // Process arrays with safe parsing
        try {
            if (req.body.languages) {
                // Handle languages coming as string or array
                if (typeof req.body.languages === 'string') {
                    try {
                        updateData.languages = JSON.parse(req.body.languages);
                        console.log('Parsed languages:', updateData.languages);
                    } catch (parseError) {
                        console.error('Error parsing languages:', parseError);
                        // If can't parse, use as a single item array
                        updateData.languages = [req.body.languages];
                    }
                } else if (Array.isArray(req.body.languages)) {
                    updateData.languages = req.body.languages;
                }
            }
            
            if (req.body.specializations) {
                // Handle specializations coming as string or array
                if (typeof req.body.specializations === 'string') {
                    try {
                        updateData.specializations = JSON.parse(req.body.specializations);
                        console.log('Parsed specializations:', updateData.specializations);
                    } catch (parseError) {
                        console.error('Error parsing specializations:', parseError);
                        // If can't parse, use as a single item array
                        updateData.specializations = [req.body.specializations];
                    }
                } else if (Array.isArray(req.body.specializations)) {
                    updateData.specializations = req.body.specializations;
                }
            }
        } catch (parseError) {
            console.error('Error processing arrays:', parseError);
            // Don't fail the entire update for array parsing issues
        }
        
        // Set update timestamp
        updateData.updatedAt = Date.now();

        // Handle file upload if present
        try {
        if (req.files && req.files.image) {
                const file = req.files.image;
                const fileName = `${Date.now()}-${file.name}`;
                const uploadDir = join(__dirname, '..', 'uploads');

                // Ensure uploads directory exists
                if (!existsSync(uploadDir)) {
                    mkdirSync(uploadDir, { recursive: true });
                }

                const uploadPath = join(uploadDir, fileName);
                
                try {
                await file.mv(uploadPath);
                updateData.image = fileName;
                console.log('File uploaded successfully:', fileName);
                } catch (fileError) {
                    console.error('File move error:', fileError);
                    // Don't fail the update if file move fails
                }
            }
        } catch (fileProcessError) {
            console.error('File processing error:', fileProcessError);
            // Don't fail the update for file processing issues
        }

        console.log('Final update data:', updateData);

        // Update the guide
        const guide = await TourGuide.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!guide) {
            console.error('Failed to update guide:', req.params.id);
            return next(createError(500, 'Failed to update tour guide'));
        }

        console.log('Successfully updated guide:', guide._id);
        res.status(200).json({
            success: true,
            data: guide
        });
    } catch (error) {
        console.error('Update guide error:', error);
        if (error.name === 'ValidationError') {
            return next(createError(400, error.message));
        }
        next(createError(500, error.message || 'Internal server error'));
    }
};

// @desc    Delete guide
// @route   DELETE /api/guides/:id
// @access  Private/Admin
export const deleteGuide = async (req, res, next) => {
    try {
        const guide = await TourGuide.findByIdAndDelete(req.params.id);

        if (!guide) {
            return next(createError(404, 'Tour guide not found'));
        }

        res.status(200).json({
            success: true,
            message: 'Tour guide deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
