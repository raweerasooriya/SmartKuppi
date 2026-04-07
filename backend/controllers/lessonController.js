// backend/controllers/lessonController.js
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// @desc    Create a lesson for a course
// @route   POST /api/courses/:courseId/lessons
// @access  Private (Tutor of the course)
exports.createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, date, duration, meetingLink, meetingPassword } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const lesson = await Lesson.create({
      title,
      description,
      course: courseId,
      date,
      duration,
      meetingLink,
      meetingPassword
    });

    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all lessons for a course
// @route   GET /api/courses/:courseId/lessons
// @access  Public (if course published) or tutor/student enrolled
exports.getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Check access
    let canView = false;
    if (course.status === 'published') canView = true;
    if (req.user && (req.user.id === course.tutor.toString() || req.user.role === 'admin')) canView = true;
    // For students, check enrollment
    if (req.user && req.user.role === 'student') {
      const Enrollment = require('../models/Enrollment');
      const enrolled = await Enrollment.findOne({ student: req.user.id, course: courseId, status: 'active' });
      if (enrolled) canView = true;
    }
    if (!canView) return res.status(403).json({ success: false, message: 'Not authorized' });

    const lessons = await Lesson.find({ course: courseId }).sort('date');
    res.json({ success: true, data: lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Private (Tutor of the course)
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    if (lesson.course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Tutor of the course)
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    if (lesson.course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await lesson.deleteOne();
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};