const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const countLetters = (value) => (value || '').replace(/[^A-Za-z]/g, '').length;

const populateAnnouncement = (query) =>
  query
    .populate('createdBy', 'name email role')
    .populate('course', 'title subject');

const validateAnnouncementInput = ({ title, content, audience, course }) => {
  const errors = {};
  const normalizedTitle = typeof title === 'string' ? title.trim() : '';
  const normalizedContent = typeof content === 'string' ? content.trim() : '';

  if (!normalizedTitle) {
    errors.title = 'Title is required';
  } else if (countLetters(normalizedTitle) < 3) {
    errors.title = 'Title must contain at least 3 letters';
  }

  if (!normalizedContent) {
    errors.content = 'Content is required';
  } else if (normalizedContent.length < 10) {
    errors.content = 'Content must be at least 10 characters';
  }

  if (!['common', 'module'].includes(audience)) {
    errors.audience = 'Select a valid announcement type';
  }

  if (audience === 'module' && !course) {
    errors.course = 'Select a module/course for this announcement';
  }

  return errors;
};

const ensureCourseOwnership = async (user, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    return { ok: false, status: 404, message: 'Course not found' };
  }

  if (user.role === 'tutor' && course.tutor.toString() !== user.id) {
    return { ok: false, status: 403, message: 'You can only use your own course' };
  }

  return { ok: true, course };
};

// @desc    Get announcements visible to the user or owned by the user
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res) => {
  try {
    let query = {};

    // 1. If Admin: Show EVERYTHING
    if (req.user.role === 'admin') {
      query = {};
    } 
    
    // 2. If Tutor: Show own posts + Global posts + Admin posts for their courses
    else if (req.user.role === 'tutor') {
      // First, find all courses that belong to this tutor
      const myCourses = await Course.find({ tutor: req.user.id }).select('_id');
      const myCourseIds = myCourses.map(c => c._id);

      query = {
        $or: [
          { createdBy: req.user.id },            // Announcements the tutor wrote
          { audience: 'common' },                // Global announcements from Admin
          { course: { $in: myCourseIds } }       // Admin announcements for this tutor's modules
        ]
      };
    } 
    
    // 3. If Student: Show common + their enrolled modules
    else {
      const enrolled = await Enrollment.find({ student: req.user.id, status: 'active' });
      const enrolledCourseIds = enrolled.map(e => e.course);
      
      query = {
        $or: [
          { audience: 'common' },
          { audience: 'module', course: { $in: enrolledCourseIds } }
        ]
      };
    }

    const announcements = await populateAnnouncement(Announcement.find(query).sort('-createdAt'));
    res.json({ success: true, data: announcements });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private (admin, tutor)
exports.createAnnouncement = async (req, res) => {
  try {
    if (!['admin', 'tutor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, content, audience = 'common', course } = req.body;
    const errors = validateAnnouncementInput({ title, content, audience, course });

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Please fix the highlighted fields', errors });
    }

    if (req.user.role === 'tutor' && audience !== 'module') {
      return res.status(403).json({ success: false, message: 'Tutors can only create module announcements' });
    }

    let courseId = null;
    if (audience === 'module') {
      const ownership = await ensureCourseOwnership(req.user, course);
      if (!ownership.ok) {
        return res.status(ownership.status).json({ success: false, message: ownership.message });
      }
      courseId = ownership.course._id;
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      audience,
      course: courseId,
      createdBy: req.user.id,
      createdByRole: req.user.role
    });

    const populated = await populateAnnouncement(Announcement.findById(announcement._id));

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private (owner only)
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    if (announcement.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this announcement' });
    }

    const { title, content, audience = announcement.audience, course } = req.body;
    const errors = validateAnnouncementInput({ title, content, audience, course: audience === 'module' ? course : true });

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Please fix the highlighted fields', errors });
    }

    if (req.user.role === 'tutor' && audience !== 'module') {
      return res.status(403).json({ success: false, message: 'Tutors can only save module announcements' });
    }

    let courseId = null;
    if (audience === 'module') {
      const ownership = await ensureCourseOwnership(req.user, course);
      if (!ownership.ok) {
        return res.status(ownership.status).json({ success: false, message: ownership.message });
      }
      courseId = ownership.course._id;
    }

    announcement.title = title.trim();
    announcement.content = content.trim();
    announcement.audience = audience;
    announcement.course = courseId;
    await announcement.save();

    const populated = await populateAnnouncement(Announcement.findById(announcement._id));
    res.json({ success: true, data: populated });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Owner or Admin)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // FIX: Allow if user is the Creator OR if user is an Admin
    const isOwner = announcement.createdBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this announcement' 
      });
    }

    await announcement.deleteOne();
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};