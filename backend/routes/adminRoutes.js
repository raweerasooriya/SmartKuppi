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
  adminSendMessage
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

// ============ RESOURCE MANAGEMENT (ADMIN) ============
router.get('/resources', getAllResources);

// ============ ADMIN-TUTOR MESSAGING ============
router.get('/messages/conversations', getAdminConversations);
router.post('/messages/send', adminSendMessage);

module.exports = router;

