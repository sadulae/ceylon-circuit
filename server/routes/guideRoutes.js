const express = require('express');
const { createGuide, getGuides, getGuide, updateGuide, deleteGuide, upload } = require('../controllers/guideController');

const router = express.Router();

router.post('/', upload.single('image'), createGuide);
router.get('/', getGuides);
router.get('/:id', getGuide);
router.put('/:id', upload.single('image'), updateGuide);
router.delete('/:id', deleteGuide);

module.exports = router;
