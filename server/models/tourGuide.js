const mongoose = require('mongoose');

const GuideSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    languages: { type: [String], required: true },
    experience: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true } // Image file path
}, { timestamps: true });

module.exports = mongoose.model('tourGuide', GuideSchema);
