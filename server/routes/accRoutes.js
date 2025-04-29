import { registerAccommodation, getAccommodations, getAccommodation, updateAccommodation, deleteAccommodation } from '../controllers/accController.js';
import express from 'express';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
router.post('/add', verifyAdmin, registerAccommodation);
router.get('/fetchAll', getAccommodations);
router.get('/:id', getAccommodation);
router.put('/update/:id', verifyAdmin, updateAccommodation);
router.delete('/delete/:id', verifyAdmin, deleteAccommodation);

export default router;
