const User = require('../models/User');

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

    // Validate status
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

    // Log the action (you can add to audit_logs collection)
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