const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Enroll a student in a course
// @route   POST /api/courses/:courseId/enroll
// @access  Private (Student only)
exports.enroll = async (req, res) => {
  try {
    const { courseId } = req.params;
    const student = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const existing = await Enrollment.findOne({ student, course: courseId, status: 'active' });
    if (existing) return res.status(400).json({ success: false, message: 'Already enrolled' });

    await Enrollment.create({ student, course: courseId });
    course.enrolledCount += 1;
    await course.save();

    await logAudit({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email, userRole: req.user.role,
      action: 'ENROLL_COURSE', entity: 'Enrollment', entityId: courseId,
      details: { courseTitle: course.title },
      req
    });

    res.status(201).json({ success: true, message: 'Enrolled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Drop a course (remove enrollment)
// @route   DELETE /api/courses/:courseId/drop
// @access  Private (Student only)
exports.drop = async (req, res) => {
  try {
    const { courseId } = req.params;
    const student = req.user.id;

    const enrollment = await Enrollment.findOne({ student, course: courseId, status: 'active' });
    if (!enrollment) return res.status(404).json({ success: false, message: 'Not enrolled' });

    enrollment.status = 'dropped';
    await enrollment.save();
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: -1 } });

    await logAudit({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email, userRole: req.user.role,
      action: 'DROP_COURSE', entity: 'Enrollment', entityId: enrollment._id,
      details: { courseId },
      req
    });

    res.json({ success: true, message: 'Dropped successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get courses a student is enrolled in
// @route   GET /api/students/:studentId/courses
// @access  Private (Student themselves or admin)
exports.getStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (req.user.id !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const enrollments = await Enrollment.find({ student: studentId, status: 'active' })
      .populate('course').sort('-enrolledAt');
    const courses = enrollments.map(e => e.course);
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get students enrolled in a course (for tutor)
// @route   GET /api/courses/:courseId/students
// @access  Private (Tutor of the course)
exports.getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const enrollments = await Enrollment.find({ course: courseId, status: 'active' })
      .populate('student', 'name email').sort('-enrolledAt');
    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};