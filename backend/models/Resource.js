const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'video', 'image', 'link', 'other'], default: 'other' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  previewUrl: { type: String },
  tags: [{ type: String }]
});

module.exports = mongoose.model('Resource', resourceSchema);