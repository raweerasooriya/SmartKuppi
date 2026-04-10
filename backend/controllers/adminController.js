const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../middleware/auditMiddleware');

// ============ USER MANAGEMENT ============

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
    
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const userData = { name, email, password: hashedPassword, phone, role };
    userData.status = status || (role === 'tutor' ? 'pending' : 'active');
    
    if (role === 'student') {
      userData.studentId = studentId;
      userData.university = university;
      userData.faculty = faculty;
      userData.department = department;
      userData.academicYear = academicYear;
    }
    if (role === 'tutor') {
      userData.qualifications = qualifications;
      userData.specialization = specialization;
      userData.yearsOfExperience = yearsOfExperience;
      userData.bio = bio;
      userData.linkedin = linkedin;
      userData.subjects = subjects || [];
    }
    
    const createdUser = await User.create(userData);
    
    // Audit log
    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: createdUser._id,
      details: { role: createdUser.role, email: createdUser.email, name: createdUser.name },
      req
    });
    
    res.status(201).json({
      success: true,
      message: `${role === 'tutor' ? 'Tutor account created' : 'User created'} successfully`,
      data: { id: createdUser._id, name, email, role, status: userData.status }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single tutor details
// @route   GET /api/admin/tutor/:id
exports.getTutorDetails = async (req, res) => {
  try {
    const tutor = await User.findById(req.params.id).select('-password');
    if (!tutor || tutor.role !== 'tutor') return res.status(404).json({ success: false, message: 'Tutor not found' });
    res.json({ success: true, data: tutor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users with filters
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
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all tutors with course count
exports.getTutors = async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor' }).select('-password').sort({ createdAt: -1 });
    const tutorsWithCount = await Promise.all(tutors.map(async (tutor) => {
      const courseCount = await Course.countDocuments({ tutor: tutor._id });
      return { ...tutor.toObject(), courseCount };
    }));
    res.json({ success: true, data: tutorsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update tutor status (approve/suspend)
exports.updateTutorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!['pending', 'approved', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const tutor = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    if (!tutor) return res.status(404).json({ success: false, message: 'Tutor not found' });
    
    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: `TUTOR_${status.toUpperCase()}`,
      entity: 'User',
      entityId: tutor._id,
      details: { tutorName: tutor.name, newStatus: status },
      req
    });
    
    res.json({ success: true, message: `Tutor status updated to ${status}`, data: tutor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'UPDATE_USER',
      entity: 'User',
      entityId: user._id,
      details: { updatedFields: Object.keys(updateData) },
      req
    });
    
    res.json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'DELETE_USER',
      entity: 'User',
      entityId: user._id,
      details: { email: user.email, name: user.name, role: user.role },
      req
    });
    
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle user status (activate/suspend)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    user.status = newStatus;
    await user.save();
    
    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: `USER_${newStatus.toUpperCase()}`,
      entity: 'User',
      entityId: user._id,
      details: { previousStatus: user.status === 'active' ? 'suspended' : 'active', newStatus },
      req
    });
    
    res.json({ success: true, message: `User ${newStatus}`, data: { id: user._id, status: user.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============ LESSON SCHEDULING ============

exports.getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find()
      .populate('course', 'title tutor')
      .populate({ path: 'course', populate: { path: 'tutor', select: 'name email' } })
      .sort({ date: -1 });
    const formatted = lessons.map(l => ({
      _id: l._id, title: l.title, description: l.description, date: l.date, duration: l.duration,
      meetingLink: l.meetingLink, meetingPassword: l.meetingPassword, status: l.status,
      courseId: l.course._id, courseTitle: l.course.title, tutorId: l.course.tutor._id,
      tutorName: l.course.tutor.name, enrolledCount: 0
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminCreateLesson = async (req, res) => {
  try {
    const { courseId, title, description, date, duration, meetingLink, meetingPassword } = req.body;
    if (!courseId || !title || !date || !duration || !meetingLink) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    
    const lesson = await Lesson.create({
      title, description: description || '', course: courseId, date: new Date(date),
      duration: parseInt(duration), meetingLink, meetingPassword: meetingPassword || '', status: 'scheduled'
    });
    const populated = await Lesson.findById(lesson._id).populate('course', 'title tutor');
    
    await logAudit({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email, userRole: req.user.role,
      action: 'CREATE_LESSON', entity: 'Lesson', entityId: lesson._id,
      details: { title, courseId, date }, req
    });
    
    res.status(201).json({ success: true, data: {
      _id: populated._id, title, description, date: populated.date, duration,
      meetingLink, meetingPassword, courseId: populated.course._id, courseTitle: populated.course.title,
      tutorId: course.tutor, status: populated.status
    } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTutorCourses = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const courses = await Course.find({ tutor: tutorId }).select('title description subject price status enrolledCount');
    const withCounts = await Promise.all(courses.map(async c => ({
      ...c.toObject(), lessonCount: await Lesson.countDocuments({ course: c._id })
    })));
    res.json({ success: true, data: withCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.adminUpdateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('course', 'title');
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    
    await logAudit({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email, userRole: req.user.role,
      action: 'UPDATE_LESSON', entity: 'Lesson', entityId: lesson._id,
      details: { title: lesson.title, updatedFields: Object.keys(req.body) }, req
    });
    
    res.json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminDeleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    
    await logAudit({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email, userRole: req.user.role,
      action: 'DELETE_LESSON', entity: 'Lesson', entityId: lesson._id,
      details: { title: lesson.title, courseId: lesson.course }, req
    });
    
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ DASHBOARD STATS ============

exports.getDashboardStats = async (req, res) => {
  try {
    const Resource = require('../models/Resource');
    const Enrollment = require('../models/Enrollment');
    const [totalUsers, totalTutors, totalCourses, totalLessons, pendingTutors, totalResources, activeLessons] = await Promise.all([
      User.countDocuments(), User.countDocuments({ role: 'tutor' }), Course.countDocuments(),
      Lesson.countDocuments(), User.countDocuments({ role: 'tutor', status: 'pending' }),
      Resource.countDocuments(), Lesson.countDocuments({ date: { $gte: new Date() }, status: 'scheduled' })
    ]);
    const activeEnrollments = await Enrollment.find({ status: 'active' }).populate('course');
    const revenue = activeEnrollments.reduce((sum, e) => sum + (e.course?.price || 0), 0);
    res.json({ success: true, data: { totalUsers, totalTutors, totalCourses, totalLessons, pendingTutors, totalResources, activeLessons, revenue } });
  } catch (error) {
    res.json({ success: true, data: { totalUsers:0, totalTutors:0, totalCourses:0, totalLessons:0, pendingTutors:0, totalResources:0, activeLessons:0, revenue:0 } });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const recentLessons = await Lesson.find().sort({ createdAt: -1 }).limit(5).populate('course', 'title');
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name role createdAt');
    const activities = [];
    recentLessons.forEach(l => activities.push({ _id: l._id, user: l.course?.title || 'Unknown', action: `New lesson: "${l.title}"`, time: formatRelativeTime(l.createdAt), type: 'lesson', icon: 'Calendar', color: 'text-violet-500' }));
    recentUsers.forEach(u => activities.push({ _id: u._id, user: u.name, action: `Registered as ${u.role}`, time: formatRelativeTime(u.createdAt), type: 'user', icon: 'UserCheck', color: 'text-brand-500' }));
    activities.sort((a,b) => parseRelativeTime(b.time) - parseRelativeTime(a.time));
    res.json({ success: true, data: activities.slice(0,5) });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

function formatRelativeTime(date) {
  const diff = Math.floor((new Date() - new Date(date)) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}
function parseRelativeTime(str) {
  const val = parseInt(str);
  if (str.includes('seconds')) return Date.now() - val*1000;
  if (str.includes('minutes')) return Date.now() - val*60*1000;
  if (str.includes('hours')) return Date.now() - val*60*60*1000;
  return Date.now() - val*24*60*60*1000;
}

// ============ COURSE MANAGEMENT ============

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('tutor', 'name email').sort({ createdAt: -1 });
    const Enrollment = require('../models/Enrollment');
    const withCounts = await Promise.all(courses.map(async c => {
      const lessonCount = await Lesson.countDocuments({ course: c._id });
      const enrolledCount = await Enrollment.countDocuments({ course: c._id, status: 'active' });
      return { ...c.toObject(), lessonCount, enrolledCount };
    }));
    res.json({ success: true, data: withCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminCreateCourse = async (req, res) => {
  try {
    const { tutorId, title, subject, description, price, thumbnail } = req.body;
    if (!tutorId || !title || !subject || !description) return res.status(400).json({ success: false, message: 'Missing fields' });
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') return res.status(404).json({ success: false, message: 'Tutor not found' });
    const course = await Course.create({ title, subject, description, price: price||0, thumbnail: thumbnail||'', tutor: tutorId, status: 'published' });
    const populated = await Course.findById(course._id).populate('tutor', 'name email');
    
    await logAudit({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email, userRole: req.user.role,
      action: 'CREATE_COURSE', entity: 'Course', entityId: course._id,
      details: { title, tutorId, subject }, req
    });
    
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminUpdateCourse = async (req, res) => {
  try {
    const { title, subject, description, price, thumbnail } = req.body;
    const course = await Course.findByIdAndUpdate(req.params.id, { title, subject, description, price, thumbnail }, { new: true }).populate('tutor', 'name email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    
    await logAudit({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email, userRole: req.user.role,
      action: 'UPDATE_COURSE', entity: 'Course', entityId: course._id,
      details: { title: course.title, updatedFields: Object.keys(req.body) }, req
    });
    
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminDeleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    
    await logAudit({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email, userRole: req.user.role,
      action: 'DELETE_COURSE', entity: 'Course', entityId: course._id,
      details: { title: course.title, tutorId: course.tutor }, req
    });
    
    await Lesson.deleteMany({ course: req.params.id });
    const Resource = require('../models/Resource');
    await Resource.deleteMany({ course: req.params.id });
    await course.deleteOne();
    res.json({ success: true, message: 'Course and associated lessons/resources deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ RESOURCE MANAGEMENT ============

exports.getAllResources = async (req, res) => {
  try {
    const Resource = require('../models/Resource');
    const resources = await Resource.find()
      .populate({ path: 'course', populate: { path: 'tutor', select: 'name email' } })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    const formatted = resources.map(r => ({
      _id: r._id, title: r.title, description: r.description, fileUrl: r.fileUrl, fileType: r.fileType,
      fileSize: r.fileSize || 'N/A', downloads: r.downloads || 0, createdAt: r.createdAt,
      course: { _id: r.course._id, title: r.course.title, tutor: r.course.tutor }
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminUpdateResource = async (req, res) => {
  try {
    const Resource = require('../models/Resource');
    const { title, description, fileType } = req.body;
    const resource = await Resource.findByIdAndUpdate(req.params.id, { title, description, fileType }, { new: true });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    
    await logAudit({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email, userRole: req.user.role,
      action: 'UPDATE_RESOURCE', entity: 'Resource', entityId: resource._id,
      details: { title: resource.title, courseId: resource.course }, req
    });
    
    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminDeleteResource = async (req, res) => {
  try {
    const Resource = require('../models/Resource');
    const fs = require('fs');
    const path = require('path');
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    
    await logAudit({
      userId: req.user.id, userName: req.user.name, userEmail: req.user.email, userRole: req.user.role,
      action: 'DELETE_RESOURCE', entity: 'Resource', entityId: resource._id,
      details: { title: resource.title, courseId: resource.course }, req
    });
    
    if (resource.fileUrl) {
      const filePath = path.join(__dirname, '../uploads', path.basename(resource.fileUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await resource.deleteOne();
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ADMIN-TUTOR MESSAGING ============

exports.getAdminConversations = async (req, res) => {
  try {
    const Message = require('../models/Message');
    const adminId = req.user.id;
    const messages = await Message.find({
      $or: [{ sender: adminId }, { receiver: adminId }]
    }).populate('sender receiver', 'name email role').populate('course', 'title').sort({ createdAt: -1 });
    const map = new Map();
    for (const msg of messages) {
      const otherUser = msg.sender._id.toString() === adminId ? msg.receiver : msg.sender;
      const courseId = msg.course?._id?.toString() || 'general';
      const key = `${otherUser._id}_${courseId}`;
      if (!map.has(key)) {
        map.set(key, {
          id: key, otherUser: { _id: otherUser._id, name: otherUser.name, email: otherUser.email, role: otherUser.role },
          course: msg.course || null, lastMessage: msg,
          unread: msg.receiver._id.toString() === adminId && !msg.read ? 1 : 0, messages: []
        });
      } else {
        const existing = map.get(key);
        if (msg.createdAt > existing.lastMessage.createdAt) existing.lastMessage = msg;
        if (msg.receiver._id.toString() === adminId && !msg.read) existing.unread++;
      }
    }
    const conversations = Array.from(map.values()).sort((a,b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminSendMessage = async (req, res) => {
  try {
    const { receiverId, courseId, content } = req.body;
    if (!receiverId || !content) return res.status(400).json({ success: false, message: 'Missing fields' });
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: 'User not found' });
    const Message = require('../models/Message');
    const message = await Message.create({
      sender: req.user.id, receiver: receiverId, course: courseId || null, content, read: false
    });
    const populated = await Message.findById(message._id).populate('sender receiver', 'name email').populate('course', 'title');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get audit logs with filters
// @route   GET /api/admin/audit-logs
// @access  Private (Admin only)
exports.getAuditLogs = async (req, res) => {
  try {
    const { limit = 50, page = 1, user, action, startDate, endDate } = req.query;
    const query = {};
    if (user) query['user.id'] = user;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await AuditLog.countDocuments(query);
    res.json({ success: true, data: logs, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};