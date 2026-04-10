// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  // User management
  getTutors,
  updateTutorStatus,
  getTutorDetails,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  // Lesson scheduling
  getAllLessons,
  adminCreateLesson,
  getTutorCourses,
  adminUpdateLesson,
  adminDeleteLesson,
  // Dashboard
  getDashboardStats,
  getRecentActivities,
  
  getAllCourses,
  adminCreateCourse,
  getAllResources,
  getAdminConversations,
  adminSendMessage,

  adminUpdateCourse,
  adminDeleteCourse
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// ============ TUTOR ROUTES ============
router.get('/tutors', getTutors);
router.get('/tutor/:id', getTutorDetails);
router.put('/update-tutor-status/:id', updateTutorStatus);

// ============ USER MANAGEMENT ROUTES ============
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);

// ============ LESSON SCHEDULING ROUTES ============
// Get all lessons (for schedule view)
router.get('/lessons', getAllLessons);

// Create new lesson (admin scheduling)
router.post('/lessons', adminCreateLesson);

// Get tutor's courses (for step 2 of scheduling)
router.get('/tutors/:tutorId/courses', getTutorCourses);

// Update lesson
router.put('/lessons/:id', adminUpdateLesson);

// Delete lesson
router.delete('/lessons/:id', adminDeleteLesson);

// ============ DASHBOARD STATS ROUTES ============
router.get('/stats', getDashboardStats);
router.get('/recent-activities', getRecentActivities);

// ============ COURSE MANAGEMENT (ADMIN) ============
router.get('/courses', getAllCourses);
router.post('/courses', adminCreateCourse);
router.put('/courses/:id', protect, authorize('admin'), adminUpdateCourse);
router.delete('/courses/:id', protect, authorize('admin'), adminDeleteCourse);

// ============ RESOURCE MANAGEMENT (ADMIN) ============
router.get('/resources', getAllResources);

// ============ ADMIN-TUTOR MESSAGING ============
router.get('/messages/conversations', getAdminConversations);
router.post('/messages/send', adminSendMessage);

// ============ RESOURCE MANAGEMENT (ADMIN) ============
// (keep your existing GET route)
router.get('/resources', getAllResources);


// Add these two new routes:
router.put('/resources/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const Resource = require('../models/Resource');
    const { title, description, fileType } = req.body;
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { title, description, fileType },
      { new: true, runValidators: true }
    );
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, data: resource });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/resources/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const Resource = require('../models/Resource');
    const fs = require('fs');
    const path = require('path');
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    // Delete the physical file if it exists
    if (resource.fileUrl) {
      const filePath = path.join(__dirname, '../uploads', path.basename(resource.fileUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await resource.deleteOne();
    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

