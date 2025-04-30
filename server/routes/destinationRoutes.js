import express from 'express';
const router = express.Router();
import {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  getDestinationsByCategory,
  getDestinationsByProvince,
  getDestinationsByDistrict
} from '../controllers/destinationController.js';

import { protect, authorize } from '../middleware/auth.js';

// Routes for all destinations
router
  .route('/')
  .get(getDestinations)
  .post(protect, authorize('admin'), createDestination);

// Routes for specific destination
router
  .route('/:id')
  .get(getDestination)
  .put(protect, authorize('admin'), updateDestination)
  .delete(protect, authorize('admin'), deleteDestination);

// Routes for filtering destinations
router.get('/category/:category', getDestinationsByCategory);
router.get('/province/:province', getDestinationsByProvince);
router.get('/district/:district', getDestinationsByDistrict);

export default router; 