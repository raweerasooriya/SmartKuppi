// backend/controllers/adminController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all tutors with filters
// @route   GET /api/admin/tutors
// @access  Private (Admin only)
exports.getTutors = async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: tutors
    });
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
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

    console.log(`Tutor ${tutor.email} status updated to ${status} by admin ${req.user.id}`);

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

// @desc    Get single tutor details
// @route   GET /api/admin/tutor/:id
// @access  Private (Admin only)
exports.getTutorDetails = async (req, res) => {
  try {
    const tutor = await User.findById(req.params.id)
      .select('-password');
    
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
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
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

// @desc    Create new user (admin, tutor, student)
// @route   POST /api/admin/users
// @access  Private (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { 
      name, email, password, phone, role, 
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

      // Then in userData:
      const userData = {
        name,
        email,
        password: hashedPassword,   // ✅ use hashed password
        phone,
        role,
        status: role === 'tutor' ? 'pending' : 'active'
      };
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
      message: `${role === 'tutor' ? 'Tutor application submitted' : 'User created'} successfully`,
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

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Don't allow password update through this route
    delete updateData.password;
    
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