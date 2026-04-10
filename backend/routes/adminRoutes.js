const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAuditLogs } = require('../controllers/adminController');

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
  // Course management
  getAllCourses,
  adminCreateCourse,
  adminUpdateCourse,
  adminDeleteCourse,
  // Resource management
  getAllResources,
  adminUpdateResource,
  adminDeleteResource,
  // Messaging
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
router.get('/lessons', getAllLessons);
router.post('/lessons', adminCreateLesson);
router.get('/tutors/:tutorId/courses', getTutorCourses);
router.put('/lessons/:id', adminUpdateLesson);
router.delete('/lessons/:id', adminDeleteLesson);

// ============ DASHBOARD STATS ROUTES ============
router.get('/stats', getDashboardStats);
router.get('/recent-activities', getRecentActivities);

// ============ COURSE MANAGEMENT (ADMIN) ============
router.get('/courses', getAllCourses);
router.post('/courses', adminCreateCourse);
router.put('/courses/:id', adminUpdateCourse);
router.delete('/courses/:id', adminDeleteCourse);

// ============ RESOURCE MANAGEMENT (ADMIN) ============
router.get('/resources', getAllResources);
router.put('/resources/:id', adminUpdateResource);
router.delete('/resources/:id', adminDeleteResource);

// ============ ADMIN MESSAGING ============
router.get('/messages/conversations', getAdminConversations);
router.post('/messages/send', adminSendMessage);

router.get('/audit-logs', getAuditLogs);

module.exports = router;