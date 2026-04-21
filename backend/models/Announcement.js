const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  audience: { type: String, enum: ['common', 'module'], default: 'common' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByRole: { type: String, enum: ['admin', 'tutor'], required: true }
}, { timestamps: true });

announcementSchema.index({ createdBy: 1, createdAt: -1 });
announcementSchema.index({ audience: 1, course: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);