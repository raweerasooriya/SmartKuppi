// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a student
// @route   POST /api/auth/register/student
// @access  Public
exports.registerStudent = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { 
      name, email, password, phone, 
      studentId, university, faculty, department, academicYear 
    } = req.body;

    // Check if user exists by email or studentId
    const existingUser = await User.findOne({ 
      $or: [{ email }, { studentId }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already registered' 
        });
      }
      if (existingUser.studentId === studentId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Student ID already exists' 
        });
      }
    }

    // Create student
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'student',
      status: 'approved', // Students are auto-approved
      studentId,
      university,
      faculty,
      department,
      academicYear
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Register a tutor
// @route   POST /api/auth/register/tutor
// @access  Public
exports.registerTutor = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const {
      name, email, password, phone,
      qualifications, specialization, yearsOfExperience,
      bio, linkedin, subjects
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create tutor (pending approval)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'tutor',
      status: 'pending', // Tutors need admin approval
      qualifications,
      specialization,
      yearsOfExperience: Number(yearsOfExperience),
      bio,
      linkedin: linkedin || '',
      subjects: subjects || []
    });

    // Generate token (they can use it to check status)
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Tutor application submitted successfully. Pending admin approval.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Tutor registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check user status
    if (user.status === 'suspended') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been suspended. Please contact admin.' 
      });
    }

    // Check if tutor is pending
    if (user.role === 'tutor' && user.status === 'pending') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your tutor application is pending approval. Please wait for admin verification.' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};