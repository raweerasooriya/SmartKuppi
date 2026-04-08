const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDiscussions,
  createDiscussion,
  addReply,
  toggleLike,
  deleteDiscussion
} = require('../controllers/discussionController');

router.use(protect); // all routes require authentication

router.get('/', getDiscussions);
router.post('/', createDiscussion);
router.post('/:id/reply', addReply);
router.post('/:id/like', toggleLike);

router.delete('/:id', protect, deleteDiscussion); 

module.exports = router;