const express = require('express');
const router = express.Router();
const { registerAccommodation, getAccommodations, getAccommodationById, updateAccommodation, deleteAccommodation } = require('../controllers/accController');
const auth = require('../middleware/auth');

// Accommodation routes
router.post('/add', registerAccommodation);
router.get('/fetchAll', getAccommodations);
// router.get('/:id', getAccommodationById);
router.put('/update/:id', updateAccommodation);
router.delete('/delete/:id', deleteAccommodation);

module.exports = router;
