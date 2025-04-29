import express from 'express';
import { createGuide, getGuides, getGuideById, updateGuide, deleteGuide } from '../controllers/guideController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guide routes
router.post('/', verifyAdmin, createGuide);
router.get('/', getGuides);
router.get('/:id', getGuideById);
router.put('/:id', verifyAdmin, updateGuide);
router.delete('/:id', verifyAdmin, deleteGuide);

export default router;
