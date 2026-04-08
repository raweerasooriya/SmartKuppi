// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');
console.log('JWT_EXPIRE value:', process.env.JWT_EXPIRE);

// Helper function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register a student
// @route   POST /api/auth/register/student
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone, studentId, university, faculty, department, academicYear } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      if (existingUser.email === email) return res.status(400).json({ success: false, message: 'Email already registered' });
      if (existingUser.studentId === studentId) return res.status(400).json({ success: false, message: 'Student ID already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'student',
      status: 'active',
      studentId,
      university,
      faculty,
      department,
      academicYear
    });

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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a tutor
// @route   POST /api/auth/register/tutor
// @access  Public
const registerTutor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone, qualifications, specialization, yearsOfExperience, bio, linkedin, subjects } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'tutor',
      status: 'pending',
      qualifications,
      specialization,
      yearsOfExperience: Number(yearsOfExperience),
      bio,
      linkedin: linkedin || '',
      subjects: subjects || []
    });

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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been suspended. Please contact admin.' 
      });
    }

    if (user.role === 'tutor' && user.status === 'pending') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your tutor application is pending approval. Please wait for admin verification.' 
      });
    }

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
const getMe = async (req, res) => {
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

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const user = await User.findOne({ email });
    
    res.json({
      success: true,
      exists: !!user
    });
    
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all admin users
// @route   GET /api/auth/admins
// @access  Private (any authenticated user)
const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('name email');
    res.json({ success: true, data: admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Export all functions
module.exports = {
  registerStudent,
  registerTutor,
  login,
  getMe,
  checkEmail,
  getAdmins
};