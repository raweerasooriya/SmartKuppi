// backend/routes/resourceRoutes.js
// backend/routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const Resource = require('../models/Resource'); // Move requirement to the top

// CHANGED: Removed '/resources' from the path
// Full path: PUT /api/resources/:id
router.put('/:id', protect, authorize('tutor', 'admin'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('course');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Authorization check
    if (req.user.role === 'tutor' && resource.course.tutor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, fileType } = req.body;
    resource.title = title;
    resource.description = description;
    resource.fileType = fileType;

    await resource.save();
    res.json({ success: true, data: resource });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// CHANGED: Also fix DELETE and DOWNLOAD routes
router.delete('/:id', protect, authorize('tutor', 'admin'), resourceController.deleteResource);
router.put('/:id/download', protect, resourceController.incrementDownload);

// Keep these as they are (they already worked because they used '/courses')
router.post('/courses/:courseId/resources', protect, authorize('tutor', 'admin'), resourceController.uploadResourceFile, resourceController.createResource);
router.get('/courses/:courseId/resources', protect, resourceController.getCourseResources);

module.exports = router;