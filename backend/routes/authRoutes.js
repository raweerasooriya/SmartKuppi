// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  registerStudent,
  registerTutor,
  login, 
  getMe 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Student registration validation
const studentValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('university').notEmpty().withMessage('University is required'),
  body('faculty').notEmpty().withMessage('Faculty is required'),
  body('academicYear').notEmpty().withMessage('Academic year is required')
];

// Tutor registration validation
const tutorValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('qualifications').notEmpty().withMessage('Qualifications are required'),
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('yearsOfExperience').isNumeric().withMessage('Years of experience must be a number'),
  body('bio').notEmpty().withMessage('Bio is required'),
  body('subjects').isArray().withMessage('Subjects must be an array')
];

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register/student', studentValidation, registerStudent);
router.post('/register/tutor', tutorValidation, registerTutor);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);

module.exports = router;