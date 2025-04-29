import express from 'express';
import {
  getAllTourPackages,
  getTourPackageById,
  createTourPackage,
  updateTourPackage,
  deleteTourPackage,
  getAvailableResources
} from '../controllers/tourPackageController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllTourPackages);
router.get('/resources', getAvailableResources);
router.get('/:id', getTourPackageById);

// Protected routes (admin only)
router.post('/', verifyToken, verifyAdmin, createTourPackage);
router.put('/:id', verifyToken, verifyAdmin, updateTourPackage);
router.delete('/:id', verifyToken, verifyAdmin, deleteTourPackage);

export default router; 