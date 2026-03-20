// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a name'], trim: true },
  email: { type: String, required: [true, 'Please add an email'], unique: true, lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'] },
  password: { type: String, required: [true, 'Please add a password'], minlength: 6, select: false },
  phone: { type: String, required: [true, 'Please add a phone number'] },
  role: { type: String, enum: ['student', 'tutor', 'admin'], default: 'student' },
  status: { type: String, enum: ['pending', 'approved', 'suspended', 'active'],
    default: function() { return this.role === 'tutor' ? 'pending' : 'active'; } },
  profilePicture: { type: String, default: 'default.jpg' },
  createdAt: { type: Date, default: Date.now },
  // Student specific fields
  studentId: { type: String, unique: true, sparse: true,
    required: function() { return this.role === 'student'; } },
  university: { type: String, required: function() { return this.role === 'student'; } },
  faculty: { type: String, required: function() { return this.role === 'student'; } },
  department: String,
  academicYear: { type: String, required: function() { return this.role === 'student'; } },
  // Tutor specific fields
  qualifications: { type: String, required: function() { return this.role === 'tutor'; } },
  specialization: { type: String, required: function() { return this.role === 'tutor'; } },
  yearsOfExperience: { type: Number, required: function() { return this.role === 'tutor'; } },
  bio: { type: String, maxlength: 500, required: function() { return this.role === 'tutor'; } },
  linkedin: String,
  subjects: [{ type: String }]
}, { timestamps: true });

// Match user entered password to hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);