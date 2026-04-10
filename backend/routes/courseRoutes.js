const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getTutorCourses
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Tutor-only routes
router.use(protect);
router.post('/', authorize('tutor', 'admin'), createCourse);
router.get('/tutor/courses', authorize('tutor', 'admin'), getTutorCourses);
router.put('/:id', protect, authorize('tutor', 'admin'), updateCourse);
router.delete('/:id', authorize('tutor', 'admin'), deleteCourse);


module.exports = router;