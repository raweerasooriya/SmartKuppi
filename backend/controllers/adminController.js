// backend/controllers/adminController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// @desc    Create new user (admin, tutor, student)
// @route   POST /api/admin/users
// @access  Private (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { 
      name, email, password, phone, role, status,
      studentId, university, faculty, department, academicYear,
      qualifications, specialization, yearsOfExperience, bio, linkedin, subjects
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: name, email, password, phone' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    // Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Build user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      role
    };
    
    // Set status: Use the status from frontend if provided, otherwise use default
    if (status) {
      userData.status = status;
    } else {
      // Default status based on role (for self-registration)
      userData.status = role === 'tutor' ? 'pending' : 'active';
    }
    
    // Add student-specific fields
    if (role === 'student') {
      userData.studentId = studentId;
      userData.university = university;
      userData.faculty = faculty;
      userData.department = department;
      userData.academicYear = academicYear;
    }
    
    // Add tutor-specific fields
    if (role === 'tutor') {
      userData.qualifications = qualifications;
      userData.specialization = specialization;
      userData.yearsOfExperience = yearsOfExperience;
      userData.bio = bio;
      userData.linkedin = linkedin;
      userData.subjects = subjects || [];
    }
    
    // Create the user
    const createdUser = await User.create(userData);
    
    res.status(201).json({
      success: true,
      message: `${role === 'tutor' ? 'Tutor account created' : 'User created'} successfully`,
      data: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        status: createdUser.status
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Get single tutor details
// @route   GET /api/admin/tutor/:id
// @access  Private (Admin only)
exports.getTutorDetails = async (req, res) => {
  try {
    const tutor = await User.findById(req.params.id).select('-password');
    
    if (!tutor || tutor.role !== 'tutor') {
      return res.status(404).json({ 
        success: false, 
        message: 'Tutor not found' 
      });
    }

    res.json({
      success: true,
      data: tutor
    });
  } catch (error) {
    console.error('Error fetching tutor details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    
    let query = {};
    
    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get all tutors with course count
// @route   GET /api/admin/tutors
// @access  Private (Admin only)
exports.getTutors = async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor' }).select('-password').sort({ createdAt: -1 });
    const Course = require('../models/Course');
    
    const tutorsWithCount = await Promise.all(tutors.map(async (tutor) => {
      const courseCount = await Course.countDocuments({ tutor: tutor._id });
      return {
        _id: tutor._id,
        name: tutor.name,
        email: tutor.email,
        phone: tutor.phone,
        qualifications: tutor.qualifications,
        specialization: tutor.specialization,
        yearsOfExperience: tutor.yearsOfExperience,
        status: tutor.status,
        bio: tutor.bio,
        linkedin: tutor.linkedin,
        subjects: tutor.subjects,
        createdAt: tutor.createdAt,
        courseCount
      };
    }));
    
    res.json({ success: true, data: tutorsWithCount });
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update tutor status (approve/suspend)
// @route   PUT /api/admin/update-tutor-status/:id
// @access  Private (Admin only)
exports.updateTutorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'approved', 'suspended'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }

    const tutor = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!tutor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tutor not found' 
      });
    }

    res.json({
      success: true,
      message: `Tutor status updated to ${status}`,
      data: tutor
    });
  } catch (error) {
    console.error('Error updating tutor status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // If password is provided, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Toggle user status (activate/suspend)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    user.status = newStatus;
    await user.save();
    
    res.json({
      success: true,
      message: `User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`,
      data: { id: user._id, status: user.status }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// ============ LESSON SCHEDULING CONTROLLER FUNCTIONS ============

// @desc    Get all lessons (admin only)
// @route   GET /api/admin/lessons
// @access  Private (Admin only)
exports.getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find()
      .populate('course', 'title tutor')
      .populate({
        path: 'course',
        populate: { path: 'tutor', select: 'name email' }
      })
      .sort({ date: -1 });
    
    const formattedLessons = lessons.map(lesson => ({
      _id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      date: lesson.date,
      duration: lesson.duration,
      meetingLink: lesson.meetingLink,
      meetingPassword: lesson.meetingPassword,
      status: lesson.status,
      courseId: lesson.course._id,
      courseTitle: lesson.course.title,
      tutorId: lesson.course.tutor._id,
      tutorName: lesson.course.tutor.name,
      enrolledCount: 0
    }));
    
    res.json({ success: true, data: formattedLessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin creates lesson for any course
// @route   POST /api/admin/lessons
// @access  Private (Admin only)
exports.adminCreateLesson = async (req, res) => {
  try {
    const { courseId, title, description, date, duration, meetingLink, meetingPassword } = req.body;
    
    if (!courseId || !title || !date || !duration || !meetingLink) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: courseId, title, date, duration, meetingLink' 
      });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const lesson = await Lesson.create({
      title,
      description: description || '',
      course: courseId,
      date: new Date(date),
      duration: parseInt(duration),
      meetingLink,
      meetingPassword: meetingPassword || '',
      status: 'scheduled'
    });
    
    const populatedLesson = await Lesson.findById(lesson._id)
      .populate('course', 'title tutor');
    
    res.status(201).json({ 
      success: true, 
      data: {
        _id: populatedLesson._id,
        title: populatedLesson.title,
        description: populatedLesson.description,
        date: populatedLesson.date,
        duration: populatedLesson.duration,
        meetingLink: populatedLesson.meetingLink,
        meetingPassword: populatedLesson.meetingPassword,
        courseId: populatedLesson.course._id,
        courseTitle: populatedLesson.course.title,
        tutorId: course.tutor,
        status: populatedLesson.status
      }
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tutor's courses (for scheduling)
// @route   GET /api/admin/tutors/:tutorId/courses
// @access  Private (Admin only)
exports.getTutorCourses = async (req, res) => {
  try {
    const { tutorId } = req.params;
    
    const courses = await Course.find({ tutor: tutorId })
      .select('title description subject price status enrolledCount');
    
    const coursesWithCounts = await Promise.all(courses.map(async (course) => {
      const lessonCount = await Lesson.countDocuments({ course: course._id });
      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        subject: course.subject,
        price: course.price,
        status: course.status,
        enrolledCount: course.enrolledCount || 0,
        lessonCount
      };
    }));
    
    res.json({ success: true, data: coursesWithCounts });
  } catch (error) {
    console.error('Error fetching tutor courses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update lesson
// @route   PUT /api/admin/lessons/:id
// @access  Private (Admin only)
exports.adminUpdateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'title');
    
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    
    res.json({ success: true, data: lesson });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/admin/lessons/:id
// @access  Private (Admin only)
exports.adminDeleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    
    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ DASHBOARD STATS CONTROLLER FUNCTIONS ============

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const Resource = require('../models/Resource');
    const Enrollment = require('../models/Enrollment');
    
    const [totalUsers, totalTutors, totalCourses, totalLessons, pendingTutors, totalResources, activeLessons] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'tutor' }),
      Course.countDocuments(),
      Lesson.countDocuments(),
      User.countDocuments({ role: 'tutor', status: 'pending' }),
      Resource.countDocuments(),
      Lesson.countDocuments({ date: { $gte: new Date() }, status: 'scheduled' })
    ]);
    
    const activeEnrollments = await Enrollment.find({ status: 'active' }).populate('course');
    const revenue = activeEnrollments.reduce((sum, enrollment) => sum + (enrollment.course?.price || 0), 0);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalTutors,
        totalCourses,
        totalLessons,
        pendingTutors,
        totalResources,
        activeLessons,
        revenue
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.json({
      success: true,
      data: {
        totalUsers: 0,
        totalTutors: 0,
        totalCourses: 0,
        totalLessons: 0,
        pendingTutors: 0,
        totalResources: 0,
        activeLessons: 0,
        revenue: 0
      }
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/admin/recent-activities
// @access  Private (Admin only)
exports.getRecentActivities = async (req, res) => {
  try {
    const recentLessons = await Lesson.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('course', 'title');
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name role createdAt');
    
    const activities = [];
    
    recentLessons.forEach(lesson => {
      activities.push({
        _id: lesson._id,
        user: lesson.course?.title || 'Unknown Course',
        action: `New lesson scheduled: "${lesson.title}"`,
        time: formatRelativeTime(lesson.createdAt),
        type: 'lesson',
        icon: 'Calendar',
        color: 'text-violet-500'
      });
    });
    
    recentUsers.forEach(user => {
      activities.push({
        _id: user._id,
        user: user.name,
        action: `Registered as ${user.role}`,
        time: formatRelativeTime(user.createdAt),
        type: 'user',
        icon: 'UserCheck',
        color: 'text-brand-500'
      });
    });
    
    activities.sort((a, b) => {
      const timeA = parseRelativeTime(a.time);
      const timeB = parseRelativeTime(b.time);
      return timeB - timeA;
    });
    
    res.json({ success: true, data: activities.slice(0, 5) });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.json({ success: true, data: [] });
  }
};

// Helper functions
function formatRelativeTime(date) {
  const diff = Math.floor((new Date() - new Date(date)) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

function parseRelativeTime(timeStr) {
  const value = parseInt(timeStr);
  if (timeStr.includes('seconds')) return Date.now() - (value * 1000);
  if (timeStr.includes('minutes')) return Date.now() - (value * 60 * 1000);
  if (timeStr.includes('hours')) return Date.now() - (value * 60 * 60 * 1000);
  if (timeStr.includes('days')) return Date.now() - (value * 24 * 60 * 60 * 1000);
  return 0;
}

// ============ COURSE MANAGEMENT (ADMIN) ============

// @desc    Get all courses with tutor details
// @route   GET /api/admin/courses
// @access  Private (Admin only)
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('tutor', 'name email')
      .sort({ createdAt: -1 });
    
    // Add lesson count and enrolled count (if not already stored)
    const coursesWithCounts = await Promise.all(courses.map(async (course) => {
      const lessonCount = await Lesson.countDocuments({ course: course._id });
      // enrolledCount should be stored in course, but we can compute if needed
      const Enrollment = require('../models/Enrollment');
      const enrolledCount = await Enrollment.countDocuments({ course: course._id, status: 'active' });
      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        subject: course.subject,
        price: course.price,
        thumbnail: course.thumbnail,
        status: course.status,
        createdAt: course.createdAt,
        tutor: course.tutor,
        lessonCount,
        enrolledCount
      };
    }));
    
    res.json({ success: true, data: coursesWithCounts });
  } catch (error) {
    console.error('Error fetching all courses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin create course (assign to any tutor)
// @route   POST /api/admin/courses
// @access  Private (Admin only)
exports.adminCreateCourse = async (req, res) => {
  try {
    const { tutorId, title, subject, description, price, thumbnail } = req.body;
    
    if (!tutorId || !title || !subject || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }
    
    const course = await Course.create({
      title,
      subject,
      description,
      price: price || 0,
      thumbnail: thumbnail || '',
      tutor: tutorId,
      status: 'published'  // Admin-created courses are published by default
    });
    
    const populatedCourse = await Course.findById(course._id).populate('tutor', 'name email');
    
    res.status(201).json({ success: true, data: populatedCourse });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ RESOURCE MANAGEMENT (ADMIN) ============

// @desc    Get all resources across all courses
// @route   GET /api/admin/resources
// @access  Private (Admin only)
exports.getAllResources = async (req, res) => {
  try {
    const Resource = require('../models/Resource');
    const resources = await Resource.find()
      .populate({
        path: 'course',
        populate: { path: 'tutor', select: 'name email' }
      })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    
    const formattedResources = resources.map(r => ({
      _id: r._id,
      title: r.title,
      description: r.description,
      fileUrl: r.fileUrl,
      fileType: r.fileType,
      fileSize: r.fileSize || 'N/A',
      downloads: r.downloads || 0,
      createdAt: r.createdAt,
      course: {
        _id: r.course._id,
        title: r.course.title,
        tutor: r.course.tutor
      }
    }));
    
    res.json({ success: true, data: formattedResources });
  } catch (error) {
    console.error('Error fetching all resources:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ADMIN-TUTOR MESSAGING ============

// @desc    Get all conversations between admin and tutors
// @route   GET /api/admin/messages/conversations
// @access  Private (Admin only)
exports.getAdminConversations = async (req, res) => {
  try {
    const Message = require('../models/Message');
    const adminId = req.user.id;
    
    // Find all messages where admin is either sender or receiver, and the other party is a tutor
    const messages = await Message.find({
      $or: [
        { sender: adminId, receiver: { $ne: adminId } },
        { receiver: adminId, sender: { $ne: adminId } }
      ]
    })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    
    // Group by the other user (tutor) and course
    const conversationsMap = new Map();
    
    for (const msg of messages) {
      const otherUser = msg.sender._id.toString() === adminId ? msg.receiver : msg.sender;
      // Only include tutors (and possibly admins? but admin only needs tutors)
      if (otherUser.role !== 'tutor') continue;
      
      const courseId = msg.course?._id?.toString() || 'general';
      const key = `${otherUser._id}_${courseId}`;
      
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          id: key,
          otherUser: {
            _id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email
          },
          course: msg.course || null,
          lastMessage: msg,
          unread: msg.receiver._id.toString() === adminId && !msg.read ? 1 : 0,
          messages: []
        });
      } else {
        const existing = conversationsMap.get(key);
        if (msg.createdAt > existing.lastMessage.createdAt) {
          existing.lastMessage = msg;
        }
        if (msg.receiver._id.toString() === adminId && !msg.read) {
          existing.unread += 1;
        }
      }
    }
    
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
    
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Error fetching admin conversations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send message from admin to tutor
// @route   POST /api/admin/messages/send
// @access  Private (Admin only)
exports.adminSendMessage = async (req, res) => {
  try {
    const { receiverId, courseId, content } = req.body;
    const senderId = req.user.id;
    
    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const receiver = await User.findById(receiverId);
    if (!receiver || receiver.role !== 'tutor') {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }
    
    const Message = require('../models/Message');
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      course: courseId || null,
      content,
      read: false
    });
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('course', 'title');
    
    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    console.error('Error sending admin message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};