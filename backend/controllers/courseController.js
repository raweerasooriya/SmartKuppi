const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Resource = require('../models/Resource');
const Enrollment = require('../models/Enrollment');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Tutor only)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, subject, thumbnail, price, status } = req.body;
    const tutor = req.user.id;

    const course = await Course.create({
      title,
      description,
      subject,
      tutor,
      thumbnail: thumbnail || '',
      price: price || 0,
      status: status || 'published'
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all published courses (for students)
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const { subject, search } = req.query;
    let query = { status: 'published' };
    if (subject) query.subject = subject;
    if (search) query.title = { $regex: search, $options: 'i' };

    const courses = await Course.find(query).populate('tutor', 'name email');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Public (if published) or tutor/student enrolled
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('tutor', 'name email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // If user is logged in and is tutor of this course or is enrolled, allow to see even if draft
    if (req.user && (req.user.id === course.tutor._id.toString() || req.user.role === 'admin')) {
      return res.json({ success: true, data: course });
    }
    // Otherwise only show if published
    if (course.status === 'published') {
      return res.json({ success: true, data: course });
    }
    res.status(403).json({ success: false, message: 'Not authorized to view this course' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Tutor who created it)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    // Check ownership
    if (req.user.role !== 'admin' && course.tutor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a course (and its lessons, resources, enrollments)
// @route   DELETE /api/courses/:id
// @access  Private (Tutor who created it or admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete related data
    await Lesson.deleteMany({ course: req.params.id });
    await Resource.deleteMany({ course: req.params.id });
    await Enrollment.deleteMany({ course: req.params.id });

    await course.deleteOne();
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get courses created by the logged-in tutor
// @route   GET /api/courses/tutor
// @access  Private (Tutor only)
exports.getTutorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ tutor: req.user.id }).sort('-createdAt');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};