const Discussion = require('../models/Discussion');

// Get all discussions (with author and reply author populated)
exports.getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate('author', 'name email')
      .populate('replies.author', 'name email')
      .sort('-createdAt');
    res.json({ success: true, data: discussions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new discussion
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content } = req.body;
    const discussion = await Discussion.create({
      title,
      content,
      author: req.user.id
    });
    const populated = await Discussion.findById(discussion._id).populate('author', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a reply to a discussion
exports.addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const discussion = await Discussion.findById(id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });
    discussion.replies.push({ content, author: req.user.id });
    await discussion.save();
    const updated = await Discussion.findById(id)
      .populate('author', 'name email')
      .populate('replies.author', 'name email');
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle like on a discussion
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const discussion = await Discussion.findById(id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });
    const userId = req.user.id;
    const index = discussion.likes.indexOf(userId);
    if (index === -1) discussion.likes.push(userId);
    else discussion.likes.splice(index, 1);
    await discussion.save();
    const updated = await Discussion.findById(id)
      .populate('author', 'name email')
      .populate('replies.author', 'name email');
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a discussion (admin only)
// @route   DELETE /api/discussions/:id
// @access  Private (Admin only)
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized. Admin only.' });
    }
    await discussion.deleteOne();
    res.json({ success: true, message: 'Discussion deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};