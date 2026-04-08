// backend/controllers/messageController.js
const Message = require('../models/Message');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// @desc    Send a message (student to tutor, tutor to student, or any to admin)
// @route   POST /api/messages
// @access  Private (any logged-in user)
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, course, content } = req.body;
    const sender = req.user.id;

    // If course is provided, validate it
    if (course) {
      const courseDoc = await Course.findById(course);
      if (!courseDoc) return res.status(404).json({ success: false, message: 'Course not found' });

      // If sender is student, check enrollment
      if (req.user.role === 'student') {
        const enrolled = await Enrollment.findOne({ student: sender, course, status: 'active' });
        if (!enrolled) return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
      } else if (req.user.role === 'tutor') {
        // Tutor must be the tutor of the course
        if (courseDoc.tutor.toString() !== sender) {
          return res.status(403).json({ success: false, message: 'Not the tutor of this course' });
        }
      } else if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    } else {
      // No course provided – only allow if receiver is admin OR sender is admin
      const receiverUser = await User.findById(receiver);
      if (!receiverUser) return res.status(404).json({ success: false, message: 'Receiver not found' });
      
      // Allow: admin sending to anyone, OR anyone sending to admin
      if (req.user.role !== 'admin' && receiverUser.role !== 'admin') {
        return res.status(400).json({ success: false, message: 'Course is required for non-admin messaging' });
      }
    }

    const newMessage = await Message.create({
      sender,
      receiver,
      course: course || null,
      content
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('course', 'title');

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for the logged-in user (inbox)
// @route   GET /api/messages/inbox
// @access  Private
exports.getInbox = async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user.id })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('course', 'title')
      .sort('-createdAt');
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sent messages
// @route   GET /api/messages/sent
// @access  Private
exports.getSent = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user.id })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('course', 'title')
      .sort('-createdAt');
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a message as read
// @route   PUT /api/messages/:id/read
// @access  Private (receiver only)
exports.markRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (message.receiver.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    message.read = true;
    await message.save();
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get conversation between two users (optionally for a specific course)
// @route   GET /api/messages?user=:userId&course=:courseId (course optional)
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const { course, user } = req.query;
    const currentUser = req.user.id;

    if (!user) {
      return res.status(400).json({ success: false, message: 'User parameter is required' });
    }

    let query = {
      $or: [
        { sender: currentUser, receiver: user },
        { sender: user, receiver: currentUser }
      ]
    };

    // Only filter by course if it's provided and not 'general'
    if (course && course !== 'general') {
      query.course = course;
    } else if (course === 'general') {
      // For 'general', match messages where course is null or missing
      query.$and = [{ $or: [{ course: null }, { course: '' }, { course: { $exists: false } }] }];
    }
    // If no course parameter, don't filter by course at all

    const messages = await Message.find(query)
      .sort('createdAt')
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};