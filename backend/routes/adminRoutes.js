// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getTutors, 
  updateTutorStatus, 
  getTutorDetails,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Tutor routes
router.get('/tutors', getTutors);
router.get('/tutor/:id', getTutorDetails);
router.put('/update-tutor-status/:id', updateTutorStatus);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const totalUsers = await User.countDocuments();
    const pendingTutors = await User.countDocuments({ role: 'tutor', status: 'pending' });
    const totalResources = 856;
    const activeLessons = 128;
    
    res.json({
      success: true,
      data: { totalUsers, pendingTutors, totalResources, activeLessons }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Recent activities
router.get('/recent-activities', async (req, res) => {
  try {
    const activities = [
      { _id: '1', user: 'John Doe', action: 'Uploaded new resource', time: '5 min ago', type: 'resource', color: 'text-emerald-500' },
      { _id: '2', user: 'Nimali Silva', action: 'Registered as tutor', time: '12 min ago', type: 'user', color: 'text-brand-500' },
      { _id: '3', user: 'Kamal Perera', action: 'Completed a lesson', time: '1 hr ago', type: 'lesson', color: 'text-violet-500' },
    ];
    res.json({ success: true, data: activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.json({ success: true, data: [] });
  }
});

module.exports = router;