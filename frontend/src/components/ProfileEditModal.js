import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Eye, EyeOff, User, Mail, Phone, Key, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

const ProfileEditModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    university: '',
    faculty: '',
    department: '',
    academicYear: '',
    qualifications: '',
    specialization: '',
    yearsOfExperience: '',
    bio: '',
    linkedin: '',
    subjects: []
  });
  const [changePassword, setChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('');

  // Fetch fresh user data when modal opens
  const fetchFreshUserData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        const userData = data.user;
        setCurrentUserRole(userData.role);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          studentId: userData.studentId || '',
          university: userData.university || '',
          faculty: userData.faculty || '',
          department: userData.department || '',
          academicYear: userData.academicYear || '',
          qualifications: userData.qualifications || '',
          specialization: userData.specialization || '',
          yearsOfExperience: userData.yearsOfExperience || '',
          bio: userData.bio || '',
          linkedin: userData.linkedin || '',
          subjects: userData.subjects || []
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFreshUserData();
      setChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    const passedCount = Object.values(checks).filter(Boolean).length;
    let text = '', color = '';
    if (password.length === 0) text = '';
    else if (passedCount <= 2) { text = 'Weak'; color = 'text-rose-500 bg-rose-50'; }
    else if (passedCount === 3) { text = 'Fair'; color = 'text-amber-500 bg-amber-50'; }
    else if (passedCount === 4) { text = 'Good'; color = 'text-blue-500 bg-blue-50'; }
    else { text = 'Strong'; color = 'text-emerald-500 bg-emerald-50'; }
    return { text, color, passedCount };
  };

  const passwordStrength = checkPasswordStrength(passwordData.newPassword);
  const passwordsMatch = passwordData.newPassword && passwordData.confirmPassword &&
                         passwordData.newPassword === passwordData.confirmPassword;

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^0[0-9]{9}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError('Phone number must start with 0 and be exactly 10 digits (e.g., 0712345678)');
      return;
    }

    // Role-specific validation
    if (currentUserRole === 'student') {
      if (!formData.studentId.trim()) setError('Student ID is required');
      else if (!formData.university) setError('University is required');
      else if (!formData.faculty) setError('Faculty is required');
      else if (!formData.academicYear) setError('Academic Year is required');
      if (error) return;
    }
    if (currentUserRole === 'tutor') {
      if (!formData.qualifications.trim()) setError('Qualifications are required');
      else if (!formData.specialization.trim()) setError('Specialization is required');
      else if (!formData.yearsOfExperience) setError('Years of Experience is required');
      else if (!formData.bio.trim()) setError('Bio is required');
      if (error) return;
    }

    // Password validation
    if (changePassword) {
      if (!passwordData.currentPassword) {
        setError('Current password is required');
        return;
      }
      if (!passwordData.newPassword) {
        setError('New password is required');
        return;
      }
      if (passwordData.newPassword.length < 8) {
        setError('New password must be at least 8 characters');
        return;
      }
      if (passwordStrength.passedCount < 3) {
        setError('Password is too weak. Use uppercase, lowercase, number, or special character.');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
    }

    setLoading(true);
    const token = getToken();
    const payload = { ...formData };
    if (changePassword) {
      payload.currentPassword = passwordData.currentPassword;
      payload.newPassword = passwordData.newPassword;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(data.data));
        setSuccess(true);
        if (onUpdate) onUpdate(data.data);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Edit Profile</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
                <p className="text-sm font-medium">Profile updated successfully!</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none"
                    placeholder="0712345678"
                  />
                </div>
              </div>
            </div>

            {/* Student Specific Fields */}
            {currentUserRole === 'student' && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Student ID</label>
                    <input type="text" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">University</label>
                    <input type="text" value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Faculty</label>
                    <input type="text" value={formData.faculty} onChange={e => setFormData({ ...formData, faculty: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Academic Year</label>
                    <input type="text" value={formData.academicYear} onChange={e => setFormData({ ...formData, academicYear: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Department</label>
                    <input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
                  </div>
                </div>
              </div>
            )}

            {/* Tutor Specific Fields */}
            {currentUserRole === 'tutor' && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Qualifications</label>
                    <input type="text" value={formData.qualifications} onChange={e => setFormData({ ...formData, qualifications: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Specialization</label>
                    <input type="text" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Years of Experience</label>
                    <input type="number" value={formData.yearsOfExperience} onChange={e => setFormData({ ...formData, yearsOfExperience: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Bio</label>
                    <textarea rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl resize-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">LinkedIn Profile</label>
                    <input type="url" value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
                  </div>
                </div>
              </div>
            )}

            {/* Password Change Section */}
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Password</h3>
                <button
                  type="button"
                  onClick={() => setChangePassword(!changePassword)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <Key className="h-3 w-3" />
                  {changePassword ? 'Cancel Password Change' : 'Change Password'}
                </button>
              </div>
              {changePassword && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Current Password *</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl pr-10"
                      />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">New Password *</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl pr-10"
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordData.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${
                              passwordStrength.text === 'Weak' ? 'w-1/4 bg-rose-500' :
                              passwordStrength.text === 'Fair' ? 'w-2/4 bg-amber-500' :
                              passwordStrength.text === 'Good' ? 'w-3/4 bg-blue-500' :
                              passwordStrength.text === 'Strong' ? 'w-full bg-emerald-500' : 'w-0'
                            }`} />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${passwordStrength.color}`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Confirm New Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl pr-10"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordData.confirmPassword && (
                      <p className={`text-[10px] mt-1 ${passwordsMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={onClose} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileEditModal;