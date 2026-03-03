// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getTutors, 
  updateTutorStatus, 
  getTutorDetails 
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/tutors', getTutors);
router.get('/tutor/:id', getTutorDetails);
router.put('/update-tutor-status/:id', updateTutorStatus);

module.exports = router;