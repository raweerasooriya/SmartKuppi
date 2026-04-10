const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['admin', 'tutor', 'student'], required: true }
  },
  action: { type: String, required: true }, // e.g., 'CREATE_COURSE', 'DELETE_USER'
  entity: { type: String, required: true }, // e.g., 'Course', 'User', 'Lesson'
  entityId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: mongoose.Schema.Types.Mixed }, // flexible object for extra data
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);