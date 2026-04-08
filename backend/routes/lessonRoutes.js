const express = require('express');
const router = express.Router();
const {
  createLesson,
  getCourseLessons,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes under a specific course
router.post('/courses/:courseId/lessons', protect, authorize('tutor', 'admin'), createLesson);
router.get('/courses/:courseId/lessons', protect, getCourseLessons); // protect but check inside controller

router.put('/:id', protect, authorize('tutor', 'admin'), updateLesson);
router.delete('/:id', protect, authorize('tutor', 'admin'), deleteLesson);

module.exports = router;