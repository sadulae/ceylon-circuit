const Guide = require('../models/tourGuide');
const multer = require('multer');
const path = require('path');

// Multer Config for Image Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Create a Guide
exports.createGuide = async (req, res) => {
    try {
        const { name, email, languages, experience, description } = req.body;
        const image = req.file ? req.file.filename : null; // Store only filename

        const guide = new Guide({ name, email, languages: languages.split(','), experience, description, image });
        await guide.save();
        res.status(201).json(guide);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Guides
exports.getGuides = async (req, res) => {
    try {
        const guides = await Guide.find();
        const updatedGuides = guides.map(guide => ({
            ...guide._doc,
            image: guide.image ? `http://localhost:5000/uploads/${guide.image}` : null  // Construct full URL
        }));
        res.json(updatedGuides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Single Guide
exports.getGuide = async (req, res) => {
    try {
        const guide = await Guide.findById(req.params.id);
        if (!guide) return res.status(404).json({ message: 'Guide not found' });

        res.json({
            ...guide._doc,
            image: guide.image ? `http://localhost:5000/uploads/${guide.image}` : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Guide
exports.updateGuide = async (req, res) => {
    try {
        const { name, email, languages, experience, description } = req.body;
        const image = req.file ? req.file.filename : req.body.image; // Store only filename

        const guide = await Guide.findByIdAndUpdate(req.params.id, 
            { name, email, languages: languages.split(','), experience, description, image }, 
            { new: true }
        );

        res.json({
            ...guide._doc,
            image: guide.image ? `http://localhost:5000/uploads/${guide.image}` : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Guide
exports.deleteGuide = async (req, res) => {
    try {
        await Guide.findByIdAndDelete(req.params.id);
        res.json({ message: "Guide deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.upload = upload;
