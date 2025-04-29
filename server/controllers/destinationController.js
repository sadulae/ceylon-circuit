import Destination from '../models/Destination.js';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
export const getDestinations = asyncHandler(async (req, res) => {
  // Extract query parameters
  const { 
    page = 1, 
    limit = 10, 
    sort, 
    category, 
    province, 
    district, 
    search 
  } = req.query;
  
  // Build filter object
  const filter = {};
  
  if (category) {
    filter.category = category;
  }
  
  if (province) {
    filter['location.province'] = province;
  }
  
  if (district) {
    filter['location.district'] = district;
  }
  
  if (search) {
    filter.$text = { $search: search };
  }
  
  // Count total documents
  const total = await Destination.countDocuments(filter);
  
  // Calculate pagination
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;
  
  // Create query
  let query = Destination.find(filter)
    .skip(skip)
    .limit(parsedLimit);
  
  // Apply sorting
  if (sort) {
    const sortBy = sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  
  // Execute query
  const destinations = await query;
  
  // Calculate pagination info
  const totalPages = Math.ceil(total / parsedLimit);
  const hasNextPage = parsedPage < totalPages;
  const hasPrevPage = parsedPage > 1;
  
  res.status(200).json({
    success: true,
    count: destinations.length,
    pagination: {
      total,
      totalPages,
      currentPage: parsedPage,
      hasNextPage,
      hasPrevPage
    },
    data: destinations
  });
});

// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
export const getDestination = asyncHandler(async (req, res, next) => {
  const destination = await Destination.findById(req.params.id);
  
  if (!destination) {
    return next(new ErrorResponse(`Destination not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: destination
  });
});

// @desc    Create new destination
// @route   POST /api/destinations
// @access  Private (Admin)
export const createDestination = asyncHandler(async (req, res, next) => {
  console.log('Create destination request received');
  console.log('Request body:', req.body); // For debugging
  console.log('Request files:', req.files ? Object.keys(req.files) : 'No files uploaded'); // For debugging file uploads
  
  try {
    // Add user ID to request body
    req.body.createdBy = req.user.id;
    
    // Parse JSON strings from FormData
    const jsonFields = ['location', 'features', 'bestTimeToVisit', 'entryFee', 'openingHours', 'tips'];
    
    for (const field of jsonFields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try {
          req.body[field] = JSON.parse(req.body[field]);
          console.log(`Parsed ${field}:`, req.body[field]);
        } catch (err) {
          console.error(`Error parsing ${field}:`, err);
          return next(new ErrorResponse(`Invalid ${field} data format`, 400));
        }
      }
    }
    
    // Validate required fields from model
    if (!req.body.name) {
      return next(new ErrorResponse('A destination must have a name', 400));
    }
    
    if (!req.body.description) {
      return next(new ErrorResponse('A destination must have a description', 400));
    }
    
    if (!req.body.category) {
      return next(new ErrorResponse('A destination must have a category', 400));
    }
    
    if (!req.body.location || !req.body.location.address) {
      return next(new ErrorResponse('A destination must have an address', 400));
    }
    
    if (!req.body.location || !req.body.location.district) {
      return next(new ErrorResponse('A destination must have a district', 400));
    }
    
    // Process image uploads if any
    if (req.files) {
      console.log('Processing files:', Object.keys(req.files));
      
      try {
        // Handle main image
        if (req.files.mainImage) {
          console.log('Processing main image:', req.files.mainImage.name);
          
          // Check file type
          const mainImageFile = req.files.mainImage;
          const fileExtension = mainImageFile.name.split('.').pop().toLowerCase();
          const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
          
          if (!allowedExtensions.includes(fileExtension)) {
            return next(new ErrorResponse(`Invalid file type for main image. Allowed: ${allowedExtensions.join(', ')}`, 400));
          }
          
          // Check file size (5MB limit)
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (mainImageFile.size > maxSize) {
            return next(new ErrorResponse('Main image file is too large. Max size: 5MB', 400));
          }
          
          // In a real application, you would upload this to cloud storage
          // For now, we'll use a placeholder URL with sanitized filename
          const sanitizedFilename = mainImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const mainImageUrl = `/uploads/${sanitizedFilename}`;
          req.body.mainImage = mainImageUrl;
          
          // Here you would actually save the file
          // For example:
          // await mainImageFile.mv(`./public/uploads/${sanitizedFilename}`);
          
          // Save the file to the uploads directory
          await mainImageFile.mv(`${process.cwd()}/uploads/${sanitizedFilename}`);
          console.log('Main image saved to:', `${process.cwd()}/uploads/${sanitizedFilename}`);
        }
        
        // Handle additional images
        if (req.files.images) {
          const images = [];
          
          // Convert to array if single file
          const imageFiles = Array.isArray(req.files.images) 
            ? req.files.images 
            : [req.files.images];
          
          console.log(`Processing ${imageFiles.length} additional images`);
          
          // Allowed extensions and max size
          const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
          const maxSize = 5 * 1024 * 1024; // 5MB
          
          // Process each image
          for (const file of imageFiles) {
            // Check file type
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
              console.warn(`Skipping file ${file.name}: invalid type`);
              continue;
            }
            
            // Check file size
            if (file.size > maxSize) {
              console.warn(`Skipping file ${file.name}: too large (${(file.size/1024/1024).toFixed(2)}MB)`);
              continue;
            }
            
            // In a real application, you would upload this to cloud storage
            const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const imageUrl = `/uploads/${sanitizedFilename}`;
            images.push(imageUrl);
            
            // Here you would actually save the file
            // For example:
            // await file.mv(`./public/uploads/${sanitizedFilename}`);
            
            // Save the file to the uploads directory
            await file.mv(`${process.cwd()}/uploads/${sanitizedFilename}`);
            console.log('Additional image saved to:', `${process.cwd()}/uploads/${sanitizedFilename}`);
          }
          
          req.body.images = images;
        }
      } catch (err) {
        console.error('Error processing file uploads:', err);
        return next(new ErrorResponse('Error processing file uploads: ' + err.message, 400));
      }
    }
    
    // Validate required fields
    if (!req.body.mainImage) {
      return next(new ErrorResponse('A destination must have a main image', 400));
    }
    
    // Create destination
    console.log('Creating destination with data:', {
      ...req.body,
      // Don't log the full image URLs in production
      mainImage: req.body.mainImage ? 'Image URL exists' : 'No image',
      images: req.body.images ? `${req.body.images.length} images` : 'No images'
    });
    
    const destination = await Destination.create(req.body);
    console.log('Destination created successfully:', destination.name);
    
    res.status(201).json({
      success: true,
      data: destination
    });
  } catch (error) {
    console.error('Error creating destination:', error);
    
    // Handle duplicate key error (code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      const message = `Destination with ${field} '${value}' already exists`;
      console.error(message);
      return next(new ErrorResponse(message, 400));
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.error('Validation error:', messages);
      return next(new ErrorResponse(messages.join(', '), 400));
    }
    
    next(error);
  }
});

// @desc    Update destination
// @route   PUT /api/destinations/:id
// @access  Private (Admin)
export const updateDestination = asyncHandler(async (req, res, next) => {
  console.log('Update destination request received for ID:', req.params.id);
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  
  let destination = await Destination.findById(req.params.id);
  
  if (!destination) {
    return next(new ErrorResponse(`Destination not found with id of ${req.params.id}`, 404));
  }
  
  // Parse JSON strings from FormData 
  // (Same parsing logic as create function - could be refactored to a helper function)
  if (req.body.location && typeof req.body.location === 'string') {
    try {
      req.body.location = JSON.parse(req.body.location);
      console.log('Parsed location:', req.body.location);
    } catch (err) {
      console.error('Error parsing location:', err);
      return next(new ErrorResponse('Invalid location data', 400));
    }
  }
  
  if (req.body.features && typeof req.body.features === 'string') {
    try {
      req.body.features = JSON.parse(req.body.features);
      console.log('Parsed features:', req.body.features);
    } catch (err) {
      console.error('Error parsing features:', err);
      return next(new ErrorResponse('Invalid features data', 400));
    }
  }
  
  if (req.body.bestTimeToVisit && typeof req.body.bestTimeToVisit === 'string') {
    try {
      req.body.bestTimeToVisit = JSON.parse(req.body.bestTimeToVisit);
    } catch (err) {
      console.error('Error parsing bestTimeToVisit:', err);
      return next(new ErrorResponse('Invalid best time to visit data', 400));
    }
  }
  
  if (req.body.entryFee && typeof req.body.entryFee === 'string') {
    try {
      req.body.entryFee = JSON.parse(req.body.entryFee);
    } catch (err) {
      console.error('Error parsing entryFee:', err);
      return next(new ErrorResponse('Invalid entry fee data', 400));
    }
  }
  
  if (req.body.openingHours && typeof req.body.openingHours === 'string') {
    try {
      req.body.openingHours = JSON.parse(req.body.openingHours);
    } catch (err) {
      console.error('Error parsing openingHours:', err);
      return next(new ErrorResponse('Invalid opening hours data', 400));
    }
  }
  
  if (req.body.tips && typeof req.body.tips === 'string') {
    try {
      req.body.tips = JSON.parse(req.body.tips);
    } catch (err) {
      console.error('Error parsing tips:', err);
      return next(new ErrorResponse('Invalid tips data', 400));
    }
  }
  
  // Process image uploads if any
  if (req.files) {
    console.log('Processing files for update:', Object.keys(req.files));
    
    try {
      // Handle main image
      if (req.files.mainImage) {
        console.log('Processing new main image:', req.files.mainImage.name);
        
        // Check file type
        const mainImageFile = req.files.mainImage;
        const fileExtension = mainImageFile.name.split('.').pop().toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        
        if (!allowedExtensions.includes(fileExtension)) {
          return next(new ErrorResponse(`Invalid file type for main image. Allowed: ${allowedExtensions.join(', ')}`, 400));
        }
        
        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (mainImageFile.size > maxSize) {
          return next(new ErrorResponse('Main image file is too large. Max size: 5MB', 400));
        }
        
        // In a real application, you would upload this to cloud storage
        const sanitizedFilename = mainImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const mainImageUrl = `/uploads/${sanitizedFilename}`;
        req.body.mainImage = mainImageUrl;
        
        // Save the file to the uploads directory
        await mainImageFile.mv(`${process.cwd()}/uploads/${sanitizedFilename}`);
        console.log('Updated main image saved to:', `${process.cwd()}/uploads/${sanitizedFilename}`);
      }
      
      // Handle additional images
      if (req.files.images) {
        let images = [...(destination.images || [])]; // Keep existing images
        
        // Convert to array if single file
        const imageFiles = Array.isArray(req.files.images) 
          ? req.files.images 
          : [req.files.images];
        
        console.log(`Processing ${imageFiles.length} new additional images`);
        
        // Allowed extensions and max size
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        // Process each image
        for (const file of imageFiles) {
          // Check file type
          const fileExtension = file.name.split('.').pop().toLowerCase();
          if (!allowedExtensions.includes(fileExtension)) {
            console.warn(`Skipping file ${file.name}: invalid type`);
            continue;
          }
          
          // Check file size
          if (file.size > maxSize) {
            console.warn(`Skipping file ${file.name}: too large (${(file.size/1024/1024).toFixed(2)}MB)`);
            continue;
          }
          
          // In a real application, you would upload this to cloud storage
          const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const imageUrl = `/uploads/${sanitizedFilename}`;
          images.push(imageUrl);
          
          // Save the file to the uploads directory
          await file.mv(`${process.cwd()}/uploads/${sanitizedFilename}`);
          console.log('Additional image saved to:', `${process.cwd()}/uploads/${sanitizedFilename}`);
        }
        
        req.body.images = images;
      }
    } catch (err) {
      console.error('Error processing file uploads:', err);
      return next(new ErrorResponse('Error processing file uploads: ' + err.message, 400));
    }
  }
  
  try {
    // Update destination
    destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    console.log('Destination updated successfully:', destination.name);
    
    res.status(200).json({
      success: true,
      data: destination
    });
  } catch (error) {
    console.error('Error updating destination:', error);
    
    // Handle duplicate key error (code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      const message = `Destination with ${field} '${value}' already exists`;
      console.error(message);
      return next(new ErrorResponse(message, 400));
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.error('Validation error:', messages);
      return next(new ErrorResponse(messages.join(', '), 400));
    }
    
    next(error);
  }
});

// @desc    Delete destination
// @route   DELETE /api/destinations/:id
// @access  Private (Admin)
export const deleteDestination = asyncHandler(async (req, res, next) => {
  const destination = await Destination.findById(req.params.id);
  
  if (!destination) {
    return next(new ErrorResponse(`Destination not found with id of ${req.params.id}`, 404));
  }
  
  await destination.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get destinations by category
// @route   GET /api/destinations/category/:category
// @access  Public
export const getDestinationsByCategory = asyncHandler(async (req, res) => {
  const destinations = await Destination.find({ 
    category: req.params.category 
  });
  
  res.status(200).json({
    success: true,
    count: destinations.length,
    data: destinations
  });
});

// @desc    Get destinations by province
// @route   GET /api/destinations/province/:province
// @access  Public
export const getDestinationsByProvince = asyncHandler(async (req, res) => {
  const destinations = await Destination.find({ 
    'location.province': req.params.province 
  });
  
  res.status(200).json({
    success: true,
    count: destinations.length,
    data: destinations
  });
});

// @desc    Get destinations by district
// @route   GET /api/destinations/district/:district
// @access  Public
export const getDestinationsByDistrict = asyncHandler(async (req, res) => {
  const destinations = await Destination.find({ 
    'location.district': req.params.district 
  });
  
  res.status(200).json({
    success: true,
    count: destinations.length,
    data: destinations
  });
});

// @desc    Add review to destination
// @route   POST /api/destinations/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide rating and comment'
      });
    }

    // Find the destination
    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({
        status: 'fail',
        message: 'Destination not found'
      });
    }

    // Create new review
    const newReview = {
      user: req.user.id,
      rating,
      comment,
      date: Date.now()
    };

    // Add review to destination
    destination.reviews.push(newReview);

    // Update ratings average and quantity
    const totalRatings = destination.reviews.reduce((sum, review) => sum + review.rating, 0);
    destination.ratingsQuantity = destination.reviews.length;
    destination.ratingsAverage = totalRatings / destination.reviews.length;

    // Save destination
    await destination.save();

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview
      }
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add review',
      error: error.message
    });
  }
};

// @desc    Get top rated destinations
// @route   GET /api/destinations/top-rated
// @access  Public
export const getTopRatedDestinations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    
    const destinations = await Destination.find()
      .sort({ ratingsAverage: -1 })
      .limit(limit);

    res.status(200).json({
      status: 'success',
      results: destinations.length,
      data: {
        destinations
      }
    });
  } catch (error) {
    console.error('Error fetching top rated destinations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch top rated destinations',
      error: error.message
    });
  }
}; 