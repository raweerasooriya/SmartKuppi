// src/pages/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, isSameDay, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import {
  Menu, X, ChevronDown, LogOut, Settings,
  Layout, Users, BookOpen, Calendar as CalendarIcon, Bell,
  TrendingUp, CheckCircle, XCircle, Clock,
  BarChart3, FileText, Shield, Award, Mail, Phone,
  Search, Plus, Filter, MoreVertical, ArrowUpRight,
  UserCheck, UserX, GraduationCap, ChevronLeft, Video, ExternalLink, Save,
  Edit3, Trash2, UserPlus, MessageSquare, Star, AlertCircle, FolderOpen,
  Eye, EyeOff, Key, Upload, User, Download, Globe, Edit2, Send, ThumbsUp
} from 'lucide-react';

import MessageThread from '../components/MessageThread';
import AnnouncementManager from '../components/AnnouncementManager';
import ProfileEditModal from '../components/ProfileEditModal';


const API_BASE_URL = 'http://localhost:5000/api';

// ─── Helper: get auth token ──────────────────────────────────────────────
const getToken = () => localStorage.getItem('token');

// ─── Schedule Lesson Modal (uses real API to fetch tutor courses) ─────────
const ScheduleLessonModal = ({ isOpen, onClose, tutors, onSchedule, loading: scheduleLoading }) => {
  const [step, setStep] = useState(1);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [tutorCourses, setTutorCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [lessonData, setLessonData] = useState({
    title: '', description: '', date: '', time: '', duration: '60', meetingLink: '', meetingPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setStep(1); setSelectedTutor(null); setSelectedCourse(null);
      setLessonData({ title: '', description: '', date: '', time: '', duration: '60', meetingLink: '', meetingPassword: '' });
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchTutorCourses = async () => {
      if (!selectedTutor) return;
      setCoursesLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/admin/tutors/${selectedTutor._id}/courses`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (data.success) setTutorCourses(data.data);
        else setTutorCourses([]);
      } catch (error) {
        console.error('Error fetching tutor courses:', error);
        setTutorCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };
    if (selectedTutor && isOpen) fetchTutorCourses();
  }, [selectedTutor, isOpen]);

  const validateLesson = () => {
    const newErrors = {};
    if (!lessonData.title.trim()) newErrors.title = 'Title required';
    if (!lessonData.description.trim()) newErrors.description = 'Description required';
    if (!lessonData.date) newErrors.date = 'Date required';
    if (!lessonData.time) newErrors.time = 'Time required';
    if (!lessonData.meetingLink) newErrors.meetingLink = 'Meeting link required';
    if (lessonData.meetingLink && !lessonData.meetingLink.startsWith('http'))
      newErrors.meetingLink = 'Must start with http:// or https://';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && selectedTutor) setStep(2);
    else if (step === 2 && selectedCourse) setStep(3);
  };
  const handleBack = () => { if (step > 1) setStep(step - 1); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateLesson()) return;
    const dateTime = new Date(`${lessonData.date}T${lessonData.time}`);
    if (isNaN(dateTime.getTime())) {
      setErrors({ ...errors, date: 'Invalid date/time' });
      return;
    }
    const payload = {
      courseId: selectedCourse._id,
      title: lessonData.title,
      description: lessonData.description,
      date: dateTime.toISOString(),
      duration: parseInt(lessonData.duration),
      meetingLink: lessonData.meetingLink,
      meetingPassword: lessonData.meetingPassword
    };
    onSchedule(payload);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
          onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-5">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Schedule New Lesson</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl"><X className="h-5 w-5 text-white" /></button>
            </div>
            <div className="flex items-center justify-between">
              {[{ step: 1, label: 'Select Tutor' }, { step: 2, label: 'Select Course' }, { step: 3, label: 'Lesson Details' }].map((item) => (
                <div key={item.step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= item.step ? 'bg-white text-indigo-600 shadow-lg' : 'bg-white/20 text-white'}`}>
                      {item.step}
                    </div>
                    <span className="text-[10px] text-white/80 mt-1">{item.label}</span>
                  </div>
                  {item.step < 3 && <div className={`flex-1 h-0.5 mx-2 rounded-full ${step > item.step ? 'bg-white' : 'bg-white/30'}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Select a tutor from the list below.</p>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {tutors.map(tutor => (
                    <button key={tutor._id} onClick={() => {
                        setSelectedTutor(tutor);
                        if (step === 1) setStep(2);
                      }}
                      className={`w-full p-4 rounded-2xl border-2 text-left ${selectedTutor?._id === tutor._id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {tutor.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-bold text-slate-900">{tutor.name}</h4>
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{tutor.courseCount || 0} courses</span>
                          </div>
                          <p className="text-sm text-slate-500">{tutor.email}</p>
                          <p className="text-xs text-slate-400 mt-1">{tutor.specialization}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center"><Users className="h-5 w-5 text-indigo-600" /></div>
                  <div><p className="text-xs text-slate-500">Selected Tutor</p><p className="font-bold">{selectedTutor?.name}</p></div>
                </div>
                <p className="text-sm text-slate-600">Select a course to schedule the lesson for.</p>
                {coursesLoading ? (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto">
                    {tutorCourses.map(course => (
                      <button key={course._id} onClick={() => {
                          setSelectedCourse(course);
                          if (step === 2) setStep(3);
                        }}
                        className={`w-full p-4 rounded-2xl border-2 text-left ${selectedCourse?._id === course._id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900">{course.title}</h4>
                            <p className="text-sm text-slate-500 mt-1">{course.subject}</p>
                            <div className="flex gap-3 mt-2 text-xs text-slate-400">
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrolledCount || 0} students</span>
                              <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.lessonCount || 0} lessons</span>
                            </div>
                          </div>
                          {selectedCourse?._id === course._id && <CheckCircle className="h-5 w-5 text-indigo-600" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="max-h-[400px] overflow-y-auto pr-2">
                <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center"><BookOpen className="h-5 w-5 text-indigo-600" /></div>
                  <div><p className="text-xs text-slate-500">Scheduling for</p><p className="font-bold">{selectedCourse?.title}</p><p className="text-xs text-slate-500">Tutor: {selectedTutor?.name}</p></div>
                </div>
                <div><label className="text-xs font-bold uppercase">Lesson Title *</label><input type="text" value={lessonData.title} onChange={e => setLessonData({...lessonData, title: e.target.value})} className={`w-full px-4 py-3 bg-slate-50 rounded-xl ${errors.title ? 'border-rose-300' : 'border-transparent focus:border-indigo-500'}`} />{errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}</div>
                <div><label className="text-xs font-bold uppercase">Description *</label><textarea rows={3} value={lessonData.description} onChange={e => setLessonData({...lessonData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl" /></div>
                <div className="grid grid-cols-2 gap-4"><div><label>Date *</label><input type="date" value={lessonData.date} onChange={e => setLessonData({...lessonData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl" /></div><div><label>Start Time *</label><input type="time" value={lessonData.time} onChange={e => setLessonData({...lessonData, time: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl" /></div></div>
                <div className="grid grid-cols-2 gap-4"><div><label>Duration</label><select value={lessonData.duration} onChange={e => setLessonData({...lessonData, duration: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl"><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option><option value="90">90 min</option><option value="120">120 min</option></select></div><div><label>Meeting Link *</label><input type="url" value={lessonData.meetingLink} onChange={e => setLessonData({...lessonData, meetingLink: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl" placeholder="https://..." /></div></div>
                <div><label>Meeting Password (Optional)</label><input type="text" value={lessonData.meetingPassword} onChange={e => setLessonData({...lessonData, meetingPassword: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl" /></div>
                <div className="flex gap-3 pt-4">
                  {step > 1 && <button type="button" onClick={handleBack} className="px-6 py-3 bg-white border-2 rounded-xl font-bold">Back</button>}
                  {step < 3 ? <button type="button" onClick={handleNext} disabled={!selectedTutor || (step===2 && !selectedCourse)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">Continue</button>
                    : <button type="submit" disabled={scheduleLoading} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">{scheduleLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-5 w-5" />}{scheduleLoading ? 'Scheduling...' : 'Schedule Lesson'}</button>}
                  <button type="button" onClick={onClose} className="px-6 py-3 bg-white border-2 rounded-xl font-bold">Cancel</button>
                </div>
              </form>
              </div>
            )}
          </div>
          
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Tutor Detail Modal ───────────────────────────────────────────────────
const TutorDetailModal = ({ tutor, onClose, onStatusChange, actionLoading }) => {
  if (!tutor) return null;
  const getInitials = (name) => name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'T';
  const getStatusBadge = (status) => {
    const map = { pending: <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-full flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</span>, approved: <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</span>, suspended: <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full flex items-center gap-1"><XCircle className="h-3 w-3" /> Suspended</span> };
    return map[status];
  };
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl"><X className="h-5 w-5" /></button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">{getInitials(tutor.name)}</div>
              <div><h3 className="text-xl font-bold">{tutor.name}</h3><p className="text-slate-400 text-sm">{tutor.qualifications}</p><div className="mt-2">{getStatusBadge(tutor.status)}</div></div>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[10px] font-bold text-slate-400 uppercase">Email</p><p className="text-sm flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{tutor.email}</p></div>
              <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p><p className="text-sm flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{tutor.phone || 'N/A'}</p></div>
              <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[10px] font-bold text-slate-400 uppercase">Specialization</p><p className="text-sm">{tutor.specialization || 'N/A'}</p></div>
              <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[10px] font-bold text-slate-400 uppercase">Experience</p><p className="text-sm">{tutor.yearsOfExperience ? `${tutor.yearsOfExperience} years` : 'N/A'}</p></div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Bio</p><p className="text-sm">{tutor.bio || 'No bio provided.'}</p></div>
            {tutor.subjects?.length > 0 && (<div><p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Subjects</p><div className="flex flex-wrap gap-2">{tutor.subjects.map(s => <span key={s} className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">{s}</span>)}</div></div>)}
            <div className="flex gap-3 pt-2">
              {tutor.status === 'pending' && (<><button onClick={() => { onStatusChange(tutor._id, 'approved'); onClose(); }} disabled={actionLoading} className="flex-1 bg-emerald-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4" /> Approve</button><button onClick={() => { onStatusChange(tutor._id, 'suspended'); onClose(); }} disabled={actionLoading} className="flex-1 bg-rose-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"><XCircle className="h-4 w-4" /> Reject</button></>)}
              {tutor.status === 'approved' && (<button onClick={() => { onStatusChange(tutor._id, 'suspended'); onClose(); }} disabled={actionLoading} className="flex-1 bg-rose-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"><UserX className="h-4 w-4" /> Suspend</button>)}
              {tutor.status === 'suspended' && (<button onClick={() => { onStatusChange(tutor._id, 'approved'); onClose(); }} disabled={actionLoading} className="flex-1 bg-emerald-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"><UserCheck className="h-4 w-4" /> Reactivate</button>)}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Course Management Component (real API) ──────────────────────────────
const CourseManagement = ({ onBack }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [tutors, setTutors] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [step, setStep] = useState(1);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [newCourse, setNewCourse] = useState({ title: '', subject: '', description: '', price: 0, thumbnail: '' });
  const subjectsList = ['Programming', 'Web Development', 'Database', 'Networking', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Economics'];
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', subject: '', description: '', price: 0, thumbnail: '' });
  const [editFormError, setEditFormError] = useState('');
  const [editFormLoading, setEditFormLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/courses`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setCourses(data.data);
      else console.error('Failed to fetch courses');
    } catch (error) { console.error(error); }
    setLoading(false);
  };
  const fetchTutors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tutors`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setTutors(data.data);
    } catch (error) { console.error(error); }
  };
  useEffect(() => { fetchCourses(); fetchTutors(); }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!selectedTutor) { setFormError('Please select a tutor'); return; }
    if (!newCourse.title.trim()) { setFormError('Title required'); return; }
    if (!newCourse.subject) { setFormError('Subject required'); return; }
    if (!newCourse.description.trim()) { setFormError('Description required'); return; }
    setFormLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ...newCourse, tutorId: selectedTutor._id })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        fetchCourses();
        setStep(1);
        setSelectedTutor(null);
        setNewCourse({ title: '', subject: '', description: '', price: 0, thumbnail: '' });
      } else setFormError(data.message || 'Creation failed');
    } catch (error) { setFormError('Network error'); }
    setFormLoading(false);
  };

  const filteredCourses = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = subjectFilter === 'all' || c.subject === subjectFilter;
    return matchSearch && matchSubject;
  });

  const handleEditCourse = (course) => {
  setEditingCourse(course);
  setEditFormData({
    title: course.title,
    subject: course.subject,
    description: course.description,
    price: course.price,
    thumbnail: course.thumbnail || ''
  });
  setShowEditModal(true);
};

const handleUpdateCourse = async (e) => {
  e.preventDefault();
  setEditFormError('');
  
  if (!editFormData.title.trim()) {
    setEditFormError('Title is required');
    return;
  }
  if (!editFormData.subject) {
    setEditFormError('Subject is required');
    return;
  }
  if (!editFormData.description.trim()) {
    setEditFormError('Description is required');
    return;
  }
  
  setEditFormLoading(true);
  const token = getToken();
  try {
    const res = await fetch(`${API_BASE_URL}/admin/courses/${editingCourse._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(editFormData)
    });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        fetchCourses(); // refresh the list
        setEditingCourse(null);
      } else {
        setEditFormError(data.message || 'Failed to update course');
      }
    } catch (error) {
      setEditFormError('Network error. Please try again.');
    } finally {
      setEditFormLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to permanently delete this course? This will also delete all lessons and resources associated with it. This action cannot be undone.')) {
      return;
    }
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchCourses(); // refresh the list
      } else {
        alert(data.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Network error. Please try again.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white border rounded-xl"><ChevronLeft className="h-5 w-5" /></button>
          <div><h1 className="text-2xl font-bold">Course Management</h1><p className="text-slate-500">View and manage all courses</p></div>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md"><Plus className="h-4 w-4" />Create Course</button>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border"><p className="text-xs font-bold text-slate-400">Total Courses</p><p className="text-2xl font-bold">{courses.length}</p></div>
        <div className="bg-white p-5 rounded-3xl border"><p className="text-xs font-bold text-slate-400">Published</p><p className="text-2xl font-bold text-emerald-600">{courses.filter(c => c.status === 'published').length}</p></div>
        <div className="bg-white p-5 rounded-3xl border"><p className="text-xs font-bold text-slate-400">Total Students</p><p className="text-2xl font-bold text-indigo-600">{courses.reduce((s,c) => s + (c.enrolledCount||0), 0)}</p></div>
        <div className="bg-white p-5 rounded-3xl border"><p className="text-xs font-bold text-slate-400">Free Courses</p><p className="text-2xl font-bold text-amber-600">{courses.filter(c => c.price === 0).length}</p></div>
      </div>
      {/* Filters */}
      <div className="bg-white p-5 rounded-3xl border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input type="text" placeholder="Search by title or subject..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl" /></div>
          <div className="flex gap-3"><div className="flex items-center bg-slate-50 rounded-xl px-3"><Filter className="h-4 w-4 text-slate-400 mr-2" /><select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="bg-transparent py-3 text-sm"><option value="all">All Subjects</option>{subjectsList.map(s => <option key={s} value={s}>{s}</option>)}</select></div></div>
        </div>
      </div>
      {/* Table */}
      {loading ? (<div className="flex justify-center py-12"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>) : (
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50"><tr><th className="px-6 py-4 text-left text-[10px] font-bold">Course</th><th className="px-6 py-4 text-left text-[10px] font-bold">Tutor</th><th className="px-6 py-4 text-left text-[10px] font-bold">Subject</th><th className="px-6 py-4 text-left text-[10px] font-bold">Students</th><th className="px-6 py-4 text-left text-[10px] font-bold">Price</th><th className="px-6 py-4 text-left text-[10px] font-bold">Created</th><th className="px-6 py-4 text-right text-[10px] font-bold">Actions</th></tr></thead>
              <tbody className="divide-y">
                {filteredCourses.map(course => (
                  <tr key={course._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4"><div><p className="font-bold">{course.title}</p><p className="text-xs text-slate-500">{course.description?.slice(0,60)}</p></div></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">{course.tutor?.name?.split(' ').map(n=>n[0]).join('')}</div><span>{course.tutor?.name}</span></div></td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full">{course.subject}</span></td>
                    <td className="px-6 py-4">{course.enrolledCount || 0}</td>
                    <td className="px-6 py-4">{course.price === 0 ? 'Free' : `LKR ${course.price}`}</td>
                    <td className="px-6 py-4 text-sm">{new Date(course.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleEditCourse(course)}
                          className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit3 className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCourse(course._id)}
                          className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Create Course Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between">
                <h2 className="text-2xl font-bold">Create Course</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setStep(1);
                    setSelectedTutor(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-xl"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">Select a tutor for this course.</p>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {tutors.map(t => (
                        <button
                          key={t._id}
                          onClick={() => {
                            setSelectedTutor(t);
                            setStep(2);
                          }}
                          className="w-full p-4 rounded-2xl border-2 hover:border-indigo-500 text-left flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {t.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold">{t.name}</p>
                            <p className="text-xs text-slate-500">{t.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <form onSubmit={handleCreateCourse} className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Selected Tutor</p>
                        <p className="font-bold">{selectedTutor?.name}</p>
                      </div>
                      <button type="button" onClick={() => setStep(1)} className="ml-auto text-indigo-600 text-sm">
                        Change
                      </button>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase">Course Title *</label>
                      <input
                        type="text"
                        value={newCourse.title}
                        onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase">Subject *</label>
                      <select
                        value={newCourse.subject}
                        onChange={e => setNewCourse({ ...newCourse, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl"
                      >
                        <option value="">Select subject</option>
                        {subjectsList.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase">Description *</label>
                      <textarea
                        rows={3}
                        value={newCourse.description}
                        onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase">Price (LKR)</label>
                      <input
                        type="number"
                        value={newCourse.price}
                        onChange={e => setNewCourse({ ...newCourse, price: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase">Thumbnail URL</label>
                      <input
                        type="url"
                        value={newCourse.thumbnail}
                        onChange={e => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl"
                      />
                    </div>
                    {formError && <div className="bg-rose-50 p-3 rounded-xl text-rose-600 text-sm">{formError}</div>}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 py-3 bg-white border-2 rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        {formLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {formLoading ? 'Creating...' : 'Create Course'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Course Modal */}
      <AnimatePresence>
        {showEditModal && editingCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between">
                <h2 className="text-2xl font-bold">Edit Course</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateCourse} className="p-6 space-y-5">
                {editFormError && (
                  <div className="bg-rose-50 p-3 rounded-xl text-rose-600 text-sm">{editFormError}</div>
                )}
                <div>
                  <label className="text-xs font-bold uppercase">Course Title *</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase">Subject *</label>
                  <select
                    value={editFormData.subject}
                    onChange={e => setEditFormData({ ...editFormData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl"
                  >
                    <option value="">Select subject</option>
                    {subjectsList.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase">Description *</label>
                  <textarea
                    rows={3}
                    value={editFormData.description}
                    onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase">Price (LKR)</label>
                  <input
                    type="number"
                    value={editFormData.price}
                    onChange={e => setEditFormData({ ...editFormData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase">Thumbnail URL</label>
                  <input
                    type="url"
                    value={editFormData.thumbnail}
                    onChange={e => setEditFormData({ ...editFormData, thumbnail: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-white border-2 rounded-xl font-bold">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editFormLoading}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {editFormLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {editFormLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


// ─── Admin Messaging Component (supports tutors, students, and admins) ────
// ─── Admin Messaging Component (supports tutors, students, and admins) ────
const AdminMessages = ({ onBack }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [chatRole, setChatRole] = useState('tutor');
  const [chatSearch, setChatSearch] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // Fetch conversations and preserve selected conversation (even if not yet in backend)
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/messages/conversations`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        const backendConvs = data.data;
        // Merge temporary conversations that are not yet in backend
        const allConvs = [...backendConvs];
        // Add any temporary conversation (id starts with 'temp-') that is not already in backend
        conversations.forEach(conv => {
          if (conv.id.startsWith('temp-') && !backendConvs.find(bc => bc.otherUser._id === conv.otherUser._id)) {
            allConvs.push(conv);
          }
        });
        setConversations(allConvs);
        // If we have a selected conversation, find it (or keep the existing one)
        if (selectedConversation) {
          const updated = allConvs.find(c => c.otherUser._id === selectedConversation.otherUser._id);
          if (updated) setSelectedConversation(updated);
        }
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const fetchUsersByRole = async (role, search = '') => {
    setLoadingUsers(true);
    try {
      let url = `${API_BASE_URL}/admin/users?role=${role}&limit=50`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setUsersList(data.data);
      else setUsersList([]);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersList([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (showNewChat) fetchUsersByRole(chatRole, chatSearch);
  }, [showNewChat, chatRole, chatSearch]);

  const handleSelectConversation = (conv) => setSelectedConversation(conv);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          receiverId: selectedConversation.otherUser._id,
          content: newMessage,
          courseId: selectedConversation.course?._id || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage('');
        await fetchConversations(); // Refresh after sending
      }
    } catch (error) {
      console.error(error);
    }
    setSending(false);
  };

  const handleStartNewChat = () => {
    setChatRole('tutor');
    setChatSearch('');
    setUsersList([]);
    setShowNewChat(true);
  };

  const handleSelectUserForChat = (user) => {
    // Check if conversation already exists
    let existing = conversations.find(c => c.otherUser._id === user._id);
    if (existing) {
      setSelectedConversation(existing);
    } else {
      // Create a permanent temporary conversation (id starts with 'temp-')
      const tempConv = {
        id: `temp-${user._id}`,
        otherUser: user,
        course: null,
        messages: [],
        lastMessage: null,
        unreadCount: 0
      };
      setConversations(prev => [tempConv, ...prev]);
      setSelectedConversation(tempConv);
    }
    setShowNewChat(false);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-rose-100 text-rose-700';
      case 'tutor': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-emerald-100 text-emerald-700';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white border rounded-xl">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Admin Messaging</h1>
          <p className="text-slate-500">Communicate with tutors, students, and other admins</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
        {/* Conversations list */}
        <div className="bg-white rounded-3xl border shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold">Conversations</h3>
            <button onClick={handleStartNewChat} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y">
            {loading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 text-left hover:bg-slate-50 transition-all ${
                    selectedConversation?.id === conv.id ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {conv.otherUser.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="font-bold truncate">{conv.otherUser.name}</p>
                        <span className="text-[10px] text-slate-400">
                          {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString() : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getRoleBadgeColor(conv.otherUser.role)}`}>
                          {conv.otherUser.role}
                        </span>
                        <p className="text-xs text-slate-500 truncate">
                          {conv.lastMessage?.content || 'No messages'}
                        </p>
                      </div>
                    </div>
                    {conv.unread > 0 && <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className="lg:col-span-2 bg-white rounded-3xl border shadow-sm flex flex-col overflow-hidden">
          {selectedConversation ? (
            <MessageThread conversation={selectedConversation} onMessageSent={fetchConversations} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p>Select a conversation or start a new chat</p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowNewChat(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold mb-4">Start New Chat</h3>

              {/* Role selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Select user type</label>
                <div className="flex gap-2">
                  {['admin', 'student', 'tutor'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setChatRole(role)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        chatRole === role ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Search input */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Users list */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loadingUsers ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : usersList.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">No users found</div>
                ) : (
                  usersList.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleSelectUserForChat(user)}
                      className="w-full p-3 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button onClick={() => setShowNewChat(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Resource Management Component (real API) ────────────────────────────
const ResourceManagement = ({ onBack }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [tutorFilter, setTutorFilter] = useState('all');
  const [tutors, setTutors] = useState([]);

  // Edit/Delete state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', fileType: 'other' });
  const [editFormError, setEditFormError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/resources`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setResources(data.data);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const fetchTutors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tutors`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setTutors(data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchResources(); fetchTutors(); }, []);

  const filteredResources = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || (r.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'all' || r.fileType === typeFilter;
    const matchTutor = tutorFilter === 'all' || r.course?.tutor?._id === tutorFilter;
    let matchDate = true;
    if (dateFilter === 'week') matchDate = new Date(r.createdAt) > new Date(Date.now() - 7 * 86400000);
    else if (dateFilter === 'month') matchDate = new Date(r.createdAt) > new Date(Date.now() - 30 * 86400000);
    return matchSearch && matchType && matchTutor && matchDate;
  });

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to permanently delete this resource? This action cannot be undone.')) return;
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchResources();
      } else {
        alert(data.message || 'Failed to delete resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Network error');
    }
    setDropdownOpen(null);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setEditForm({
      title: resource.title,
      description: resource.description || '',
      fileType: resource.fileType
    });
    setShowEditModal(true);
    setDropdownOpen(null);
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      setEditFormError('Title is required');
      return;
    }
    setEditSubmitting(true);
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/resources/${editingResource._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          fileType: editForm.fileType
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        fetchResources();
      } else {
        setEditFormError(data.message || 'Failed to update resource');
      }
    } catch (error) {
      setEditFormError('Network error. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white border rounded-xl"><ChevronLeft className="h-5 w-5" /></button>
        <div>
          <h1 className="text-2xl font-bold">Resource Management</h1>
          <p className="text-slate-500">View all learning resources</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border"><p className="text-xs font-bold text-slate-400">Total Resources</p><p className="text-2xl font-bold">{resources.length}</p></div>
        <div className="bg-white p-5 rounded-3xl border"><p className="text-xs font-bold text-slate-400">PDFs</p><p className="text-2xl font-bold text-rose-600">{resources.filter(r => r.fileType === 'pdf').length}</p></div>
        <div className="bg-white p-5 rounded-3xl border"><p className="text-xs font-bold text-slate-400">Videos</p><p className="text-2xl font-bold text-blue-600">{resources.filter(r => r.fileType === 'video').length}</p></div>
        <div className="bg-white p-5 rounded-3xl border"><p className="text-xs font-bold text-slate-400">Total Downloads</p><p className="text-2xl font-bold text-emerald-600">{resources.reduce((s, r) => s + (r.downloads || 0), 0)}</p></div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-3xl border">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search resources..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-3 bg-slate-50 rounded-xl">
            <option value="all">All Types</option><option value="pdf">PDF</option><option value="video">Video</option><option value="image">Image</option><option value="other">Other</option>
          </select>
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="px-4 py-3 bg-slate-50 rounded-xl">
            <option value="all">All Time</option><option value="week">Last 7 days</option><option value="month">Last 30 days</option>
          </select>
          <select value={tutorFilter} onChange={e => setTutorFilter(e.target.value)} className="px-4 py-3 bg-slate-50 rounded-xl">
            <option value="all">All Tutors</option>
            {tutors.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold">Resource</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold">Course / Tutor</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold">Type</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold">Uploaded</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredResources.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-slate-500" />
                        <div>
                          <p className="font-bold text-slate-900">{r.title}</p>
                          <p className="text-xs text-slate-500">{r.description?.slice(0, 60)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium">{r.course?.title}</p>
                        <p className="text-xs text-slate-500">by {r.course?.tutor?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full uppercase">{r.fileType}</span></td>
                    <td className="px-6 py-4 text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Download icon */}
                        <a
                          href={`${API_BASE_URL}${r.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        {/* Dropdown button */}
                        <div className="relative">
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === r._id ? null : r._id)}
                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {dropdownOpen === r._id && (
                            <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-10">
                              <button onClick={() => openEditModal(r)} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Edit2 className="h-4 w-4" /> Edit
                              </button>
                              <button onClick={() => handleDeleteResource(r._id)} className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                <Trash2 className="h-4 w-4" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      <AnimatePresence>
        {showEditModal && editingResource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Edit Resource</h2>
                  <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/10 rounded-xl">
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleUpdateResource} className="p-6 space-y-4">
                {editFormError && (
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-600 text-sm">
                    {editFormError}
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Resource Title *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Description (optional)</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">File Type</label>
                  <select
                    value={editForm.fileType}
                    onChange={e => setEditForm({ ...editForm, fileType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                    <option value="link">Link (URL)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {editSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
                    {editSubmitting ? 'Updating...' : 'Update Resource'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCHEDULE MANAGEMENT VIEW (extracted)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCHEDULE MANAGEMENT VIEW (extracted)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ScheduleManagementView = ({
  selectedDate,
  setSelectedDate,
  allLessons,
  scheduleView,
  setScheduleView,
  filterTutor,
  setFilterTutor,
  filterCourse,
  setFilterCourse,
  setShowScheduleModal,
  formatTime,
  setActiveView,
  onEditLesson,
  onDeleteLesson
}) => {
  // Helper: filter lessons by tutor and course (no date filter)
  const filterByTutorAndCourse = (lessons) => {
    return lessons.filter(lesson => {
      const matchTutor = filterTutor === 'all' || lesson.tutorId === filterTutor;
      const matchCourse = filterCourse === 'all' || lesson.courseId === filterCourse;
      return matchTutor && matchCourse;
    });
  };

  const filteredByTutorCourse = filterByTutorAndCourse(allLessons);

  // Lessons for the selected date (calendar right panel)
  const filteredLessons = filteredByTutorCourse.filter(lesson =>
    isSameDay(parseISO(lesson.date), selectedDate)
  );

  // All lessons matching filters, sorted for list view
  const listFilteredLessons = [...filteredByTutorCourse].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Custom tile content – shows dot only if a filtered lesson exists on that date
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hasLesson = filteredByTutorCourse.some(lesson =>
        isSameDay(parseISO(lesson.date), date)
      );
      if (hasLesson) {
        return <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mx-auto mt-1"></div>;
      }
    }
    return null;
  };
  
  const getStatusBadge = (date) => {
    const lessonDate = new Date(date);
    const now = new Date();
    if (lessonDate < now) {
      return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">Past</span>;
    }
    return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full">Upcoming</span>;
  };

  const uniqueTutors = [
    ...new Map(allLessons.map(l => [l.tutorId, { id: l.tutorId, name: l.tutorName }])).values(),
  ];
  const uniqueCourses = [
    ...new Map(allLessons.map(l => [l.courseId, { id: l.courseId, title: l.courseTitle }])).values(),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('dashboard')}
            className="p-2 hover:bg-white border rounded-xl"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Schedule Management</h1>
            <p className="text-slate-500">View all scheduled lessons</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setScheduleView('calendar')}
            className={`px-4 py-2 rounded-xl text-sm font-bold ${
              scheduleView === 'calendar'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setScheduleView('list')}
            className={`px-4 py-2 rounded-xl text-sm font-bold ${
              scheduleView === 'list'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md"
          >
            <Plus className="h-4 w-4" />
            New Lesson
          </button>
        </div>
      </div>

      {/* Stats – overall (unfiltered) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Lessons
          </p>
          <p className="text-2xl font-bold text-slate-900">{allLessons.length}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            This Week
          </p>
          <p className="text-2xl font-bold text-indigo-600">
            {allLessons.filter(l => {
              const d = new Date(l.date);
              const ws = startOfWeek(new Date());
              const we = endOfWeek(new Date());
              return d >= ws && d <= we;
            }).length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Upcoming
          </p>
          <p className="text-2xl font-bold text-emerald-600">
            {allLessons.filter(l => new Date(l.date) > new Date()).length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Students
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {allLessons.reduce((s, l) => s + (l.enrolledCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-3xl border">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Filter by:</span>
          </div>
          <select
            value={filterTutor}
            onChange={e => setFilterTutor(e.target.value)}
            className="px-4 py-2 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all text-sm font-medium text-slate-700"
          >
            <option value="all">All Tutors</option>
            {uniqueTutors.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}
            className="px-4 py-2 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all text-sm font-medium text-slate-700"
          >
            <option value="all">All Courses</option>
            {uniqueCourses.map(c => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar or List View */}
      {scheduleView === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl border p-6">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              className="w-full border-none"
            />
          </div>
          <div className="bg-white rounded-3xl border overflow-hidden">
            <div className="p-6 border-b bg-slate-50">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {filteredLessons.length > 0 ? (
                filteredLessons.map(lesson => (
                  <div key={lesson._id} className="p-4 bg-slate-50 rounded-2xl border hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm">
                        <Video className="h-4 w-4" />
                      </div>
                      {getStatusBadge(lesson.date)}
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{lesson.title}</h4>
                    <p className="text-xs text-slate-500 mb-2">{lesson.courseTitle}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(lesson.date)}</span>
                      <span>•</span>
                      <span>{lesson.duration} min</span>
                      <span>•</span>
                      <Users className="h-3 w-3" />
                      <span>{lesson.enrolledCount || 0} students</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {lesson.meetingLink && new Date(lesson.date) > new Date() && (
                        <a
                          href={lesson.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Start Session <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <button
                        onClick={() => window.location.href = `/admin/courses/${lesson.courseId}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600"
                      >
                        View Course
                      </button>
                      <button
                        onClick={() => onEditLesson(lesson)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
                      >
                        <Edit3 className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => onDeleteLesson(lesson._id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p>No lessons scheduled for this day</p>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="mt-4 text-indigo-600 text-sm font-bold hover:underline"
                  >
                    Schedule a lesson
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border overflow-hidden">
          <div className="p-6 border-b bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">All Scheduled Lessons</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {listFilteredLessons.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p>No lessons match the selected filters</p>
                <button
                  onClick={() => {
                    setFilterTutor('all');
                    setFilterCourse('all');
                  }}
                  className="mt-4 text-indigo-600 text-sm font-bold hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              listFilteredLessons.map(lesson => (
                <div key={lesson._id} className="p-6 hover:bg-slate-50 transition-all">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Video className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{lesson.title}</h3>
                        <p className="text-sm text-slate-500">{lesson.courseTitle}</p>
                        <p className="text-sm text-slate-500">Tutor: {lesson.tutorName}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(lesson.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(lesson.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {lesson.enrolledCount || 0} enrolled
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {lesson.meetingLink && new Date(lesson.date) > new Date() && (
                        <a
                          href={lesson.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700"
                        >
                          Join Session
                        </a>
                      )}
                      <button
                        onClick={() => window.location.href = `/admin/courses/${lesson.courseId}`}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50"
                      >
                        View Course
                      </button>
                      <button
                        onClick={() => onEditLesson(lesson)}
                        className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-medium hover:bg-amber-100"
                      >
                        <Edit3 className="h-4 w-4 inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => onDeleteLesson(lesson._id)}
                        className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-medium hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4 inline mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TUTOR MANAGEMENT VIEW (external, to prevent input focus loss)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TutorManagementView = ({
  tutors,
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  tutorsLoading,
  actionLoading,
  handleTutorStatusChange,
  setSelectedTutor,
  setShowDetailsModal,
  getInitials,
  getStatusBadge,
  onBack
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
    {/* Page Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Tutor Approvals</h1>
          <p className="text-slate-500 mt-1">Manage and review all tutor applications</p>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[
        { label: 'Total Tutors', value: tutors.length, color: 'text-slate-900' },
        { label: 'Pending', value: tutors.filter(t => t.status === 'pending').length, color: 'text-amber-600' },
        { label: 'Approved', value: tutors.filter(t => t.status === 'approved').length, color: 'text-emerald-600' },
        { label: 'Suspended', value: tutors.filter(t => t.status === 'suspended').length, color: 'text-rose-600' },
      ].map((s, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">{s.label}</p>
          <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>

    {/* Search & Filter */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email or specialization..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all text-sm font-medium text-slate-700"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
    </div>

    {/* Table */}
    {tutorsLoading ? (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    ) : (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tutor</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Specialization</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Experience</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tutors
                .filter(tutor => {
                  const q = searchTerm.toLowerCase();
                  return (tutor.name?.toLowerCase().includes(q) || tutor.email?.toLowerCase().includes(q) || tutor.specialization?.toLowerCase().includes(q)) &&
                    (filter === 'all' || tutor.status === filter);
                })
                .map((tutor) => (
                  <tr key={tutor._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {getInitials(tutor.name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{tutor.name}</p>
                          <p className="text-[10px] text-slate-400">{tutor.qualifications}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 flex items-center gap-1"><Mail className="h-3 w-3" />{tutor.email}</p>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-1"><Phone className="h-3 w-3" />{tutor.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900 font-medium">{tutor.specialization}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tutor.subjects?.slice(0, 2).map((s, i) => (
                          <span key={i} className="text-[8px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">{s}</span>
                        ))}
                        {tutor.subjects?.length > 2 && <span className="text-[8px] text-slate-400">+{tutor.subjects.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900 font-bold">{tutor.yearsOfExperience ? `${tutor.yearsOfExperience} yrs` : 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(tutor.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {tutor.status === 'pending' && (
                          <>
                            <button onClick={() => handleTutorStatusChange(tutor._id, 'approved')} disabled={actionLoading} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve"><CheckCircle className="h-5 w-5" /></button>
                            <button onClick={() => handleTutorStatusChange(tutor._id, 'suspended')} disabled={actionLoading} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Reject"><XCircle className="h-5 w-5" /></button>
                          </>
                        )}
                        {tutor.status === 'approved' && (
                          <button onClick={() => handleTutorStatusChange(tutor._id, 'suspended')} disabled={actionLoading} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Suspend"><UserX className="h-5 w-5" /></button>
                        )}
                        {tutor.status === 'suspended' && (
                          <button onClick={() => handleTutorStatusChange(tutor._id, 'approved')} disabled={actionLoading} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Reactivate"><UserCheck className="h-5 w-5" /></button>
                        )}
                        <button onClick={() => { setSelectedTutor(tutor); setShowDetailsModal(true); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {tutors.filter(t => {
                const q = searchTerm.toLowerCase();
                return (t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) || t.specialization?.toLowerCase().includes(q)) &&
                  (filter === 'all' || t.status === filter);
              }).length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No tutors found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </motion.div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER MANAGEMENT COMPONENT (copied exactly from the separate file)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const UserManagement = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  
  // Add User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student',
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

  // Edit User Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
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
    subjects: [],
    password: '',
    confirmPassword: ''
  });

  // Edit Resource Modal State
  const [editingResource, setEditingResource] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    fileType: 'other'
  });
  const [editFormError, setEditFormError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null); // track which resource's dropdown is open

  const universities = [
    'Sri Lanka Institute of Information Technology - SLIIT',
    'University of Colombo',
    'University of Peradeniya',
    'University of Kelaniya',
    'University of Sri Jayewardenepura',
    'University of Moratuwa',
    'Open University of Sri Lanka',
    'Other'
  ];

  const faculties = [
    'Faculty of Computing',
    'School of Business',
    'Faculty of Engineering',
    'School of Architecture',
    'Faculty of Humanities & Sciences',
    'Faculty of Graduate Studies',
    'Other'
  ];

  const subjectsList = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'Programming', 'Database Systems',
    'Web Development', 'Networking', 'English',
    'Economics', 'Accounting'
  ];

  const academicYears = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Postgraduate'
  ];

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const passedCount = Object.values(checks).filter(Boolean).length;
    
    let score = 0;
    let text = '';
    let color = '';
    
    if (password.length === 0) {
      text = '';
      score = 0;
    } else if (passedCount <= 2) {
      score = 1;
      text = 'Weak';
      color = 'text-rose-500 bg-rose-50';
    } else if (passedCount === 3) {
      score = 2;
      text = 'Fair';
      color = 'text-amber-500 bg-amber-50';
    } else if (passedCount === 4) {
      score = 3;
      text = 'Good';
      color = 'text-blue-500 bg-blue-50';
    } else {
      score = 4;
      text = 'Strong';
      color = 'text-emerald-500 bg-emerald-50';
    }
    
    return { score, text, color, checks, passedCount };
  };

  const passwordStrength = checkPasswordStrength(newUser.password);
  const passwordsMatch = newUser.password && newUser.confirmPassword && newUser.password === newUser.confirmPassword;
  const editPasswordStrength = checkPasswordStrength(editFormData.password);
  const editPasswordsMatch = editFormData.password && editFormData.confirmPassword && editFormData.password === editFormData.confirmPassword;

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      let url = `${API_BASE_URL}/admin/users?`;
      if (searchTerm) url += `search=${searchTerm}&`;
      if (roleFilter !== 'all') url += `role=${roleFilter}&`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newUser.name.trim()) {
      setFormError('Name is required');
      return;
    }

    if (!newUser.email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!validateEmail(newUser.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    const emailExists = users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (emailExists) {
      setFormError('A user with this email already exists');
      return;
    }

    if (!newUser.password) {
      setFormError('Password is required');
      return;
    }
    if (newUser.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (passwordStrength.passedCount < 3) {
      setFormError('Password is too weak. Please use at least 8 characters with uppercase, lowercase, number, or special character.');
      return;
    }

    if (!newUser.phone.trim()) {
      setFormError('Phone number is required');
      return;
    }
    if (!validatePhone(newUser.phone)) {
      setFormError('Phone number must start with 0 and be exactly 10 digits (e.g., 0712345678)');
      return;
    }

    // Student validation
    if (newUser.role === 'student') {
      if (!newUser.studentId.trim()) {
        setFormError('Student ID is required');
        return;
      }
      if (!newUser.university) {
        setFormError('University is required');
        return;
      }
      if (!newUser.faculty) {
        setFormError('Faculty is required');
        return;
      }
      if (!newUser.academicYear) {
        setFormError('Academic Year is required');
        return;
      }
    }

    // Tutor validation
    if (newUser.role === 'tutor') {
      if (!newUser.qualifications.trim()) {
        setFormError('Qualifications are required');
        return;
      }
      if (!newUser.specialization.trim()) {
        setFormError('Specialization is required');
        return;
      }
      if (!newUser.yearsOfExperience) {
        setFormError('Years of Experience is required');
        return;
      }
      if (!newUser.bio.trim()) {
        setFormError('Bio/Introduction is required');
        return;
      }
    }

    setFormLoading(true);
    const token = localStorage.getItem('token');

    const userToSend = { ...newUser };
    delete userToSend.confirmPassword;

    if (userToSend.role === 'tutor') {
      userToSend.status = 'approved';
    } else if (userToSend.role === 'student') {
      userToSend.status = 'active';
    } else if (userToSend.role === 'admin') {
      userToSend.status = 'active';
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userToSend)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowAddModal(false);
        fetchUsers();
        setNewUser({
          name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'student',
          studentId: '', university: '', faculty: '', department: '', academicYear: '',
          qualifications: '', specialization: '', yearsOfExperience: '', bio: '', linkedin: '', subjects: []
        });
      } else {
        setFormError(data.message || 'Failed to create user');
      }
    } catch (error) {
      setFormError('Network error. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

    const handleEditUser = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate password if changePassword is true
    if (changePassword) {
        if (!editFormData.password) {
        setFormError('New password is required');
        return;
        }
        if (editFormData.password.length < 8) {
        setFormError('Password must be at least 8 characters');
        return;
        }
        if (editPasswordStrength.passedCount < 3) {
        setFormError('Password is too weak. Please use at least 8 characters with uppercase, lowercase, number, or special character.');
        return;
        }
        if (editFormData.password !== editFormData.confirmPassword) {
        setFormError('Passwords do not match');
        return;
        }
    }
    
    setFormLoading(true);
    const token = localStorage.getItem('token');

    // Prepare data for API - only include fields that should be updated
    const userToSend = {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        role: editFormData.role
    };
    
    // Add role-specific fields
    if (editFormData.role === 'student') {
        userToSend.studentId = editFormData.studentId;
        userToSend.university = editFormData.university;
        userToSend.faculty = editFormData.faculty;
        userToSend.department = editFormData.department;
        userToSend.academicYear = editFormData.academicYear;
    }
    
    if (editFormData.role === 'tutor') {
        userToSend.qualifications = editFormData.qualifications;
        userToSend.specialization = editFormData.specialization;
        userToSend.yearsOfExperience = editFormData.yearsOfExperience;
        userToSend.bio = editFormData.bio;
        userToSend.linkedin = editFormData.linkedin;
        userToSend.subjects = editFormData.subjects;
    }
    
    // Add password only if changePassword is true
    if (changePassword) {
        userToSend.password = editFormData.password;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userToSend)
        });

        const data = await response.json();

        if (data.success) {
        setShowEditModal(false);
        fetchUsers();
        setSelectedUser(null);
        setChangePassword(false);
        setEditFormData({
            name: '',
            email: '',
            phone: '',
            role: '',
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
            subjects: [],
            password: '',
            confirmPassword: ''
        });
        } else {
        setFormError(data.message || 'Failed to update user');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        setFormError('Network error. Please try again.');
    } finally {
        setFormLoading(false);
    }
    };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'student',
      studentId: user.studentId || '',
      university: user.university || '',
      faculty: user.faculty || '',
      department: user.department || '',
      academicYear: user.academicYear || '',
      qualifications: user.qualifications || '',
      specialization: user.specialization || '',
      yearsOfExperience: user.yearsOfExperience || '',
      bio: user.bio || '',
      linkedin: user.linkedin || '',
      subjects: user.subjects || [],
      password: '',
      confirmPassword: ''
    });
    setChangePassword(false);
    setShowEditModal(true);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const token = localStorage.getItem('token');
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // ... inside UserManagement component
  const exportToPDF = async () => {
    const dataToExport = filteredUsers;
    if (dataToExport.length === 0) {
      alert('No users to export');
      return;
    }

    // Import jsPDF and autoTable
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF('landscape');

    // Header: SmartKuppi
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229); // Indigo color
    doc.setFont('helvetica', 'bold');
    doc.text('SmartKuppi', 14, 20);

    // Title
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.text('User Management Report', 14, 35);

    // Generation date/time (right aligned)
    const now = new Date();
    const dateStr = now.toLocaleString();
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${dateStr}`, doc.internal.pageSize.width - 14, 20, { align: 'right' });

    // Filters info
    let filterText = `Filters: Role: ${roleFilter === 'all' ? 'All' : roleFilter} | Status: ${statusFilter === 'all' ? 'All' : statusFilter}`;
    if (searchTerm) filterText += ` | Search: "${searchTerm}"`;
    doc.setFontSize(9);
    doc.text(filterText, 14, 45);

    // Prepare table data
    const tableHeaders = [['Name', 'Email', 'Role', 'Status', 'Phone', 'Joined Date']];
    const tableRows = dataToExport.map(user => [
      user.name,
      user.email,
      user.role,
      user.status,
      user.phone || 'N/A',
      new Date(user.createdAt).toLocaleDateString()
    ]);

    // Add table
    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      startY: 55,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 }
      }
    });

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`users_${now.toISOString().slice(0,19)}.pdf`);
  };

  const exportToCSV = () => {
    const dataToExport = filteredUsers;
    if (dataToExport.length === 0) {
      alert('No users to export');
      return;
    }
    const headers = ['Name', 'Email', 'Role', 'Status', 'Phone', 'Joined Date'];
    const rows = dataToExport.map(user => [
      user.name,
      user.email,
      user.role,
      user.status,
      user.phone || 'N/A',
      new Date(user.createdAt).toLocaleDateString()
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().slice(0,19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-rose-500" />;
      case 'tutor': return <GraduationCap className="h-4 w-4 text-brand-500" />;
      default: return <User className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</span>;
      case 'suspended':
        return <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full flex items-center gap-1"><XCircle className="h-3 w-3" /> Suspended</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</span>;
      default:
        return null;
    }
  };

  const filteredUsers = users.filter(user => {
  const matchesSearch = searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
              <p className="text-slate-500 mt-1">View and manage all registered users on the platform.</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={exportToPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" /><span>Export PDF</span>
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileText className="h-4 w-4" /><span>Export CSV</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
            >
              <Plus className="h-4 w-4" /><span>Add New User</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: users.length, color: 'text-slate-900' },
            { label: 'Students', value: users.filter(u => u.role === 'student').length, color: 'text-brand-600' },
            { label: 'Tutors', value: users.filter(u => u.role === 'tutor').length, color: 'text-violet-600' },
            { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, color: 'text-rose-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl focus:outline-none transition-all text-sm"
                />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center bg-slate-50 rounded-2xl px-3 border-2 border-transparent">
                <Filter className="h-4 w-4 text-slate-400 mr-2" />
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent py-3 text-sm font-medium text-slate-700 focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="tutor">Tutors</option>
                  <option value="student">Students</option>
                </select>
              </div>
              <div className="flex items-center bg-slate-50 rounded-2xl px-3 border-2 border-transparent">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent py-3 text-sm font-medium text-slate-700 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <button 
                onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); }}
                className="px-4 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Joined Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Active</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 w-40 bg-slate-100 rounded-lg"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded-md"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded-md"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-100 rounded-lg ml-auto"></div></td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                            {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <span className="text-xs font-semibold text-slate-600 capitalize">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{user.lastActive || 'Recently'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Edit User"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(user._id, user.status)}
                            className={`p-2 rounded-lg transition-colors ${user.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                          >
                            {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="max-w-xs mx-auto">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-bold">No users found</h3>
                        <p className="text-slate-500 text-sm mt-1">We couldn't find any users matching your current search or filters.</p>
                        <button 
                          onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); }}
                          className="mt-4 text-brand-600 font-bold text-sm hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">
              Showing <span className="text-slate-900">{filteredUsers.length}</span> of <span className="text-slate-900">{users.length}</span> users
            </p>
          </div>
        </div>
      </motion.div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Add New User</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-6 space-y-6">
                {formError && (
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">{formError}</p>
                  </div>
                )}

                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Email *</label>
                      <input
                        type="email"
                        required
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {newUser.password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  passwordStrength.score === 1 ? 'w-1/4 bg-rose-500' :
                                  passwordStrength.score === 2 ? 'w-2/4 bg-amber-500' :
                                  passwordStrength.score === 3 ? 'w-3/4 bg-blue-500' :
                                  passwordStrength.score === 4 ? 'w-full bg-emerald-500' : 'w-0'
                                }`}
                              />
                            </div>
                            {passwordStrength.text && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${passwordStrength.color}`}>
                                {passwordStrength.text}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Use 8+ chars with uppercase, lowercase, number, or special character</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={newUser.confirmPassword}
                          onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                          className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all pr-10 ${
                            newUser.confirmPassword && !passwordsMatch
                              ? 'border-rose-300 focus:border-rose-500'
                              : newUser.confirmPassword && passwordsMatch
                              ? 'border-emerald-300 focus:border-emerald-500'
                              : 'border-transparent focus:border-brand-500'
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {newUser.confirmPassword && (
                        <p className={`text-[10px] mt-1 ${passwordsMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={newUser.phone}
                        onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        placeholder="0712345678"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Must start with 0 and be exactly 10 digits</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Role *</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                      >
                        <option value="student">Student</option>
                        <option value="tutor">Tutor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Student Specific Fields */}
                {newUser.role === 'student' && (
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Academic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Student ID</label>
                        <input
                          type="text"
                          value={newUser.studentId}
                          onChange={(e) => setNewUser({...newUser, studentId: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="IT20XXXXXX"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">University</label>
                        <select
                          value={newUser.university}
                          onChange={(e) => setNewUser({...newUser, university: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        >
                          <option value="">Select University</option>
                          {universities.map(uni => <option key={uni} value={uni}>{uni}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Faculty</label>
                        <select
                          value={newUser.faculty}
                          onChange={(e) => setNewUser({...newUser, faculty: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        >
                          <option value="">Select Faculty</option>
                          {faculties.map(fac => <option key={fac} value={fac}>{fac}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Academic Year</label>
                        <select
                          value={newUser.academicYear}
                          onChange={(e) => setNewUser({...newUser, academicYear: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        >
                          <option value="">Select Year</option>
                          {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Department</label>
                        <input
                          type="text"
                          value={newUser.department}
                          onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="Computer Science"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tutor Specific Fields */}
                {newUser.role === 'tutor' && (
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Qualifications</label>
                        <input
                          type="text"
                          value={newUser.qualifications}
                          onChange={(e) => setNewUser({...newUser, qualifications: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="B.Sc. in Computer Science"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Specialization</label>
                        <input
                          type="text"
                          value={newUser.specialization}
                          onChange={(e) => setNewUser({...newUser, specialization: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="Web Development"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Years of Experience</label>
                        <input
                          type="number"
                          value={newUser.yearsOfExperience}
                          onChange={(e) => setNewUser({...newUser, yearsOfExperience: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="3"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Bio / Introduction</label>
                        <textarea
                          rows={3}
                          value={newUser.bio}
                          onChange={(e) => setNewUser({...newUser, bio: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all resize-none"
                          placeholder="Tell us about your teaching style..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">LinkedIn Profile</label>
                        <input
                          type="url"
                          value={newUser.linkedin}
                          onChange={(e) => setNewUser({...newUser, linkedin: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Subjects you can teach</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {subjectsList.map(subject => (
                            <label key={subject} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                              <input
                                type="checkbox"
                                checked={newUser.subjects.includes(subject)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewUser({...newUser, subjects: [...newUser.subjects, subject]});
                                  } else {
                                    setNewUser({...newUser, subjects: newUser.subjects.filter(s => s !== subject)});
                                  }
                                }}
                                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                              />
                              <span className="text-sm text-slate-600">{subject}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {formLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
                    {formLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Edit User</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="p-6 space-y-6">
                {formError && (
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">{formError}</p>
                  </div>
                )}

                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Email *</label>
                      <input
                        type="email"
                        required
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        placeholder="0712345678"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Must start with 0 and be exactly 10 digits</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Role *</label>
                      <select
                        value={editFormData.role}
                        onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                      >
                        <option value="student">Student</option>
                        <option value="tutor">Tutor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Password</h3>
                    <button
                      type="button"
                      onClick={() => setChangePassword(!changePassword)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Key className="h-3 w-3" />
                      {changePassword ? 'Cancel Password Change' : 'Change Password'}
                    </button>
                  </div>
                  
                  {changePassword && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">New Password</label>
                        <div className="relative">
                          <input
                            type={showEditPassword ? "text" : "password"}
                            value={editFormData.password}
                            onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all pr-10"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowEditPassword(!showEditPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {editFormData.password && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${
                                    editPasswordStrength.score === 1 ? 'w-1/4 bg-rose-500' :
                                    editPasswordStrength.score === 2 ? 'w-2/4 bg-amber-500' :
                                    editPasswordStrength.score === 3 ? 'w-3/4 bg-blue-500' :
                                    editPasswordStrength.score === 4 ? 'w-full bg-emerald-500' : 'w-0'
                                  }`}
                                />
                              </div>
                              {editPasswordStrength.text && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${editPasswordStrength.color}`}>
                                  {editPasswordStrength.text}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Use 8+ chars with uppercase, lowercase, number, or special character</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showEditConfirmPassword ? "text" : "password"}
                            value={editFormData.confirmPassword}
                            onChange={(e) => setEditFormData({...editFormData, confirmPassword: e.target.value})}
                            className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all pr-10 ${
                              editFormData.confirmPassword && !editPasswordsMatch
                                ? 'border-rose-300 focus:border-rose-500'
                                : editFormData.confirmPassword && editPasswordsMatch
                                ? 'border-emerald-300 focus:border-emerald-500'
                                : 'border-transparent focus:border-brand-500'
                            }`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowEditConfirmPassword(!showEditConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showEditConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {editFormData.confirmPassword && (
                          <p className={`text-[10px] mt-1 ${editPasswordsMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {editPasswordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Student Specific Fields */}
                {editFormData.role === 'student' && (
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Academic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Student ID</label>
                        <input
                          type="text"
                          value={editFormData.studentId}
                          onChange={(e) => setEditFormData({...editFormData, studentId: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="IT20XXXXXX"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">University</label>
                        <select
                          value={editFormData.university}
                          onChange={(e) => setEditFormData({...editFormData, university: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        >
                          <option value="">Select University</option>
                          {universities.map(uni => <option key={uni} value={uni}>{uni}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Faculty</label>
                        <select
                          value={editFormData.faculty}
                          onChange={(e) => setEditFormData({...editFormData, faculty: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        >
                          <option value="">Select Faculty</option>
                          {faculties.map(fac => <option key={fac} value={fac}>{fac}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Academic Year</label>
                        <select
                          value={editFormData.academicYear}
                          onChange={(e) => setEditFormData({...editFormData, academicYear: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                        >
                          <option value="">Select Year</option>
                          {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Department</label>
                        <input
                          type="text"
                          value={editFormData.department}
                          onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="Computer Science"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tutor Specific Fields */}
                {editFormData.role === 'tutor' && (
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Qualifications</label>
                        <input
                          type="text"
                          value={editFormData.qualifications}
                          onChange={(e) => setEditFormData({...editFormData, qualifications: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="B.Sc. in Computer Science"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Specialization</label>
                        <input
                          type="text"
                          value={editFormData.specialization}
                          onChange={(e) => setEditFormData({...editFormData, specialization: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="Web Development"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Years of Experience</label>
                        <input
                          type="number"
                          value={editFormData.yearsOfExperience}
                          onChange={(e) => setEditFormData({...editFormData, yearsOfExperience: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="3"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Bio / Introduction</label>
                        <textarea
                          rows={3}
                          value={editFormData.bio}
                          onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all resize-none"
                          placeholder="Tell us about your teaching style..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">LinkedIn Profile</label>
                        <input
                          type="url"
                          value={editFormData.linkedin}
                          onChange={(e) => setEditFormData({...editFormData, linkedin: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Subjects you can teach</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {subjectsList.map(subject => (
                            <label key={subject} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                              <input
                                type="checkbox"
                                checked={editFormData.subjects.includes(subject)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditFormData({...editFormData, subjects: [...editFormData.subjects, subject]});
                                  } else {
                                    setEditFormData({...editFormData, subjects: editFormData.subjects.filter(s => s !== subject)});
                                  }
                                }}
                                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                              />
                              <span className="text-sm text-slate-600">{subject}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {formLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
                    {formLoading ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Main Admin Dashboard (real API, no mock data) ────────────────────────
const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalTutors: 0, totalCourses: 0, totalLessons: 0, pendingTutors: 0, totalResources: 0, activeLessons: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [tutorsLoading, setTutorsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allLessons, setAllLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [scheduleView, setScheduleView] = useState('calendar');
  const [filterTutor, setFilterTutor] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

  // INSERT THESE THREE BELOW:
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementCourses, setAnnouncementCourses] = useState([]);

  // Inside AdminDashboard component
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    user: '',
    action: '',
    startDate: '',
    endDate: ''
  });
  const [auditPagination, setAuditPagination] = useState({ page: 1, limit: 50, total: 0 });

  const [showAuditFilters, setShowAuditFilters] = useState(false);
  const [localAuditFilters, setLocalAuditFilters] = useState({
    user: '',
    action: '',
    startDate: '',
    endDate: ''
  });
  
  // Discussions state
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const navigate = useNavigate();

  // Edit Lesson state
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editLessonForm, setEditLessonForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    meetingLink: '',
    meetingPassword: ''
  });
  const [editLessonErrors, setEditLessonErrors] = useState({});
  const [editLessonSubmitting, setEditLessonSubmitting] = useState(false);

  // Data fetching functions (unchanged)
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, activitiesRes, tutorsRes, lessonsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${API_BASE_URL}/admin/recent-activities`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${API_BASE_URL}/admin/tutors`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${API_BASE_URL}/admin/lessons`, { headers: { Authorization: `Bearer ${getToken()}` } })
      ]);
      const statsData = await statsRes.json();
      const activitiesData = await activitiesRes.json();
      const tutorsData = await tutorsRes.json();
      const lessonsData = await lessonsRes.json();
      if (statsData.success) setStats(statsData.data);
      if (activitiesData.success) setRecentActivities(activitiesData.data);
      if (tutorsData.success) setTutors(tutorsData.data);
      if (lessonsData.success) { setAllLessons(lessonsData.data); filterLessonsByDate(lessonsData.data); }
    } catch (error) { console.error('Error fetching dashboard data:', error); }
    setLoading(false);
  }, []);

  // Paste these after fetchDashboardData
  const fetchAnnouncements = useCallback(async () => {
    setAnnouncementsLoading(true);
    try {
    const res = await fetch(`${API_BASE_URL}/announcements`, {
      headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setAnnouncements(data.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setAnnouncementsLoading(false);
    }
  }, []);

  const fetchAnnouncementCourses = useCallback(async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/courses`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (data.success) setAnnouncementCourses(data.data);
      } catch (error) {
        console.error('Error fetching courses for announcements:', error);
      }
    }, []);

  const filterLessonsByDate = (lessonsData = allLessons, date = selectedDate) => {
    let filtered = lessonsData.filter(lesson => isSameDay(parseISO(lesson.date), date));
    if (filterTutor !== 'all') filtered = filtered.filter(l => l.tutorId === filterTutor);
    if (filterCourse !== 'all') filtered = filtered.filter(l => l.courseId === filterCourse);
    setFilteredLessons(filtered);
  };

  useEffect(() => { filterLessonsByDate(); }, [selectedDate, filterTutor, filterCourse, allLessons]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) { navigate('/login'); return; }
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') { navigate('/'); return; }
      setAdmin(parsedUser);
      fetchDashboardData();
    } catch { navigate('/login'); }
  }, [navigate, fetchDashboardData]);

  useEffect(() => {
  if (activeView === 'announcements') {
    fetchAnnouncements();
    fetchAnnouncementCourses();
  }
  }, [activeView, fetchAnnouncements, fetchAnnouncementCourses]);

  useEffect(() => {
  if (activeView === 'auditLogs') {
      fetchAuditLogs();
    }
  }, [activeView, auditFilters, auditPagination.page]);

  const handleTutorStatusChange = async (tutorId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/update-tutor-status/${tutorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setTutors(prev => prev.map(t => t._id === tutorId ? { ...t, status: newStatus } : t));
        setStats(prev => ({ ...prev, pendingTutors: newStatus !== 'pending' ? Math.max(0, prev.pendingTutors - 1) : prev.pendingTutors + 1 }));
      }
    } catch (error) { console.error(error); }
    setActionLoading(false);
  };

  const handleCreateAnnouncement = async (announcementData) => {
  const res = await fetch(`${API_BASE_URL}/announcements`, {
    method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(announcementData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to create');
    return data.data;
  };

  const handleUpdateAnnouncement = async (id, announcementData) => {
    const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(announcementData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update');
    return data.data;
  };

  // Find and replace your handleDeleteAnnouncement with this:
  const handleDeleteAnnouncement = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      const data = await res.json();
      
      if (data.success) {
        // THIS LINE IS THE KEY: It tells the dashboard to get the new list
        fetchAnnouncements(); 
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Network error while deleting');
    }
  };

  const handleScheduleLesson = async (lessonData) => {
    setScheduleLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(lessonData)
      });
      const data = await res.json();
      if (data.success) {
        setScheduleSuccess(true);
        const lessonsRes = await fetch(`${API_BASE_URL}/admin/lessons`, { headers: { Authorization: `Bearer ${getToken()}` } });
        const lessonsData = await lessonsRes.json();
        if (lessonsData.success) { setAllLessons(lessonsData.data); filterLessonsByDate(lessonsData.data); }
        setTimeout(() => { setShowScheduleModal(false); setScheduleSuccess(false); }, 1500);
      } else alert(data.message || 'Failed to schedule lesson');
    } catch (error) { alert('Network error'); }
    setScheduleLoading(false);
  };

  // ========== Lesson Edit/Delete Handlers ==========
  const openEditLessonModal = (lesson) => {
    const lessonDate = new Date(lesson.date);
    const formattedDate = lessonDate.toISOString().split('T')[0];
    const formattedTime = lessonDate.toTimeString().slice(0, 5);
    
    setEditingLesson(lesson);
    setEditLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      date: formattedDate,
      time: formattedTime,
      duration: lesson.duration.toString(),
      meetingLink: lesson.meetingLink || '',
      meetingPassword: lesson.meetingPassword || ''
    });
    setEditLessonErrors({});
    setShowEditLessonModal(true);
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!editLessonForm.title.trim()) errors.title = 'Title is required';
    if (!editLessonForm.description.trim()) errors.description = 'Description is required';
    if (!editLessonForm.date) errors.date = 'Date is required';
    if (!editLessonForm.time) errors.time = 'Time is required';
    if (!editLessonForm.meetingLink) errors.meetingLink = 'Meeting link is required';
    if (editLessonForm.meetingLink && !editLessonForm.meetingLink.startsWith('http')) {
      errors.meetingLink = 'Must start with http:// or https://';
    }
    
    if (Object.keys(errors).length > 0) {
      setEditLessonErrors(errors);
      return;
    }
    
    setEditLessonSubmitting(true);
    const token = getToken();
    const dateTime = new Date(`${editLessonForm.date}T${editLessonForm.time}`);
    
    if (isNaN(dateTime.getTime())) {
      setEditLessonErrors({ ...editLessonErrors, date: 'Invalid date/time' });
      setEditLessonSubmitting(false);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/admin/lessons/${editingLesson._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editLessonForm.title,
          description: editLessonForm.description,
          date: dateTime.toISOString(),
          duration: parseInt(editLessonForm.duration),
          meetingLink: editLessonForm.meetingLink,
          meetingPassword: editLessonForm.meetingPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowEditLessonModal(false);
        // Refresh lessons list
        const lessonsRes = await fetch(`${API_BASE_URL}/admin/lessons`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const lessonsData = await lessonsRes.json();
        if (lessonsData.success) setAllLessons(lessonsData.data);
      } else {
        alert(data.message || 'Failed to update lesson');
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      alert('Network error. Please try again.');
    } finally {
      setEditLessonSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to permanently delete this lesson? This action cannot be undone.')) {
      return;
    }
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Refresh lessons list
        const lessonsRes = await fetch(`${API_BASE_URL}/admin/lessons`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const lessonsData = await lessonsRes.json();
        if (lessonsData.success) setAllLessons(lessonsData.data);
      } else {
        alert(data.message || 'Failed to delete lesson');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Network error. Please try again.');
    }
  };

  // Discussions API functions
  const fetchDiscussions = async () => {
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/discussions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setDiscussions(data.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      alert('Please enter title and content');
      return;
    }
    setSubmitting(true);
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newDiscussion)
      });
      const data = await res.json();
      if (data.success) {
        setDiscussions(prev => [data.data, ...prev]);
        setNewDiscussion({ title: '', content: '' });
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (discussionId) => {
    if (!replyContent.trim()) {
      alert('Please enter a reply');
      return;
    }
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/discussions/${discussionId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: replyContent })
      });
      const data = await res.json();
      if (data.success) {
        setDiscussions(prev => prev.map(d => d._id === discussionId ? data.data : d));
        setReplyingTo(null);
        setReplyContent('');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleLike = async (discussionId) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/discussions/${discussionId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDiscussions(prev => prev.map(d => d._id === discussionId ? data.data : d));
      }
    } catch (error) {
      console.error('Error liking discussion:', error);
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (!window.confirm('Are you sure you want to permanently delete this discussion? This action cannot be undone.')) return;
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/discussions/${discussionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDiscussions(prev => prev.filter(d => d._id !== discussionId));
      } else {
        alert(data.message || 'Failed to delete discussion');
      }
    } catch (error) {
      console.error('Error deleting discussion:', error);
      alert('Network error');
    }
  };

  const goToDiscussions = () => {
  setActiveView('discussions');
  fetchDiscussions();
  };

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    const token = getToken();
    let url = `${API_BASE_URL}/admin/audit-logs?page=${auditPagination.page}&limit=50`;
    if (auditFilters.user) url += `&user=${auditFilters.user}`;
    if (auditFilters.action) url += `&action=${auditFilters.action}`;
    if (auditFilters.startDate) url += `&startDate=${auditFilters.startDate}`;
    if (auditFilters.endDate) url += `&endDate=${auditFilters.endDate}`;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      console.log('Audit logs response:', data); // Debug log
      if (data.success) {
        setAuditLogs(data.data);
        setAuditPagination(prev => ({ ...prev, total: data.pagination.total }));
      } else {
        console.error('Failed to fetch audit logs:', data.message);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setAuditLoading(false);
    }
  };

  const applyAuditFilters = () => {
    setAuditFilters(localAuditFilters);
    setAuditPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetAuditFilters = () => {
    setLocalAuditFilters({ user: '', action: '', startDate: '', endDate: '' });
    setAuditFilters({ user: '', action: '', startDate: '', endDate: '' });
    setAuditPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLogout = () => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); };
  const handleProfileUpdate = (updatedUser) => {
    setAdmin(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };
  const getInitials = (name) => name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'AD';
  const getStatusBadge = (status) => {
    const map = {
      pending: <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-full flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</span>,
      approved: <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</span>,
      suspended: <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full flex items-center gap-1"><XCircle className="h-3 w-3" /> Suspended</span>
    };
    return map[status] || null;
  };
  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const tileContent = ({ date, view }) => { if (view === 'month' && allLessons.some(l => isSameDay(parseISO(l.date), date))) return <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mx-auto mt-1"></div>; return null; };

  const pendingTutors = tutors.filter(t => t.status === 'pending');

  // Dashboard View (real stats)
  const DashboardView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div><div className="flex items-center space-x-2 mb-2"><span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase">Admin Portal</span><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span><span className="text-[10px] font-bold text-emerald-400">Live</span></div><h2 className="text-3xl font-bold">Welcome back, {admin?.name?.split(' ')[0] || 'Admin'}! 👋</h2><p className="text-indigo-100 mt-2">You have {pendingTutors.length} pending tutor approvals and {stats.totalLessons} total lessons scheduled.</p></div>
          <button onClick={() => setActiveView('tutors')} className="flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg"><UserCheck className="h-5 w-5" /><span>Tutor Approvals {pendingTutors.length > 0 && `(${pendingTutors.length})`}</span></button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>
      {/* Stats without revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Users', value: stats.totalUsers, change: '+12.5%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Total Tutors', value: stats.totalTutors, change: '+5 new', icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Total Courses', value: stats.totalCourses, change: '+3', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Total Lessons', value: stats.totalLessons, change: '+28', icon: Video, color: 'text-violet-600', bg: 'bg-violet-50' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (<div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"><div className="flex items-center justify-between mb-4"><div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}><Icon className="h-6 w-6" /></div><div className="flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600"><TrendingUp className="h-3 w-3" /><span>{stat.change}</span></div></div><p className="text-sm font-medium text-slate-500">{stat.title}</p><h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3></div>);
        })}
      </div>
      {/* Quick Actions */}
      <div><h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'User Management', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', action: () => setActiveView('users') },
          { label: 'Course Management', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', action: () => setActiveView('courses') },
          { label: 'Messages', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50', action: () => setActiveView('messages') },
          { label: 'Resources', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50', action: () => setActiveView('resources') }
        ].map((action, i) => {
          const Icon = action.icon;
          return (<button key={i} onClick={action.action} className="group p-6 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-lg transition-all text-center"><div className={`${action.bg} ${action.color} w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}><Icon className="h-6 w-6" /></div><span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{action.label}</span></button>);
        })}
      </div></div>
      {/* Pending Approvals Table (short) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"><div className="p-6 border-b flex justify-between"><div><h2 className="text-lg font-bold">Pending Tutor Approvals</h2><p className="text-sm text-slate-500">Review and approve new tutor applications</p></div><button onClick={() => setActiveView('tutors')} className="text-indigo-600 text-sm font-semibold flex items-center">View All <ArrowUpRight className="h-4 w-4 ml-1" /></button></div><div className="overflow-x-auto">{pendingTutors.length > 0 ? (<table className="w-full"><thead><tr className="bg-slate-50/50"><th className="px-6 py-4 text-[10px] font-bold">Tutor</th><th className="px-6 py-4 text-[10px] font-bold">Specialization</th><th className="px-6 py-4 text-[10px] font-bold text-right">Actions</th></tr></thead><tbody>{pendingTutors.slice(0,4).map(tutor => (<tr key={tutor._id} className="hover:bg-slate-50"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">{getInitials(tutor.name)}</div><div><p className="text-sm font-semibold">{tutor.name}</p><p className="text-[10px] text-slate-400">{tutor.email}</p></div></div></td><td className="px-6 py-4">{tutor.specialization}</td><td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
        <button onClick={() => handleTutorStatusChange(tutor._id, 'approved')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><CheckCircle className="h-5 w-5" /></button><button onClick={() => handleTutorStatusChange(tutor._id, 'suspended')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><XCircle className="h-5 w-5" /></button><button onClick={() => { setSelectedTutor(tutor); setShowDetailsModal(true); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><MoreVertical className="h-5 w-5" /></button></div></td></tr>))}</tbody></table>) : (<div className="p-12 text-center"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><UserCheck className="h-8 w-8 text-slate-400" /></div><p className="text-slate-500">No pending tutor approvals</p></div>)}</div></div>
    </motion.div>
  );

  // Discussions view
  const renderDiscussions = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveView('dashboard')} className="p-2 hover:bg-white border rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Discussion Forum</h1>
            <p className="text-slate-500">Ask questions, share knowledge, and connect.</p>
          </div>
        </div>
      </div>

      {/* Create Discussion Form */}
      <div className="bg-white rounded-3xl border shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Start a Discussion</h2>
        <form onSubmit={handleCreateDiscussion} className="space-y-4">
          <input
            type="text"
            placeholder="Discussion title"
            value={newDiscussion.title}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
          <textarea
            rows={4}
            placeholder="What would you like to discuss?"
            value={newDiscussion.content}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl resize-none focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-70"
          >
            {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="h-5 w-5" />}
            {submitting ? 'Posting...' : 'Post Discussion'}
          </button>
        </form>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="bg-white rounded-3xl border p-12 text-center text-slate-500">
            No discussions yet. Be the first to start one!
          </div>
        ) : (
          discussions.map((discussion) => (
            <div key={discussion._id} className="bg-white rounded-3xl border shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{discussion.title}</h3>
                  <p className="text-slate-600 mb-4">{discussion.content}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><User className="h-4 w-4" /> {discussion.author?.name || 'Unknown'}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {new Date(discussion.createdAt).toLocaleDateString()}</span>
                    <button onClick={() => handleLike(discussion._id)} className="flex items-center gap-1 hover:text-indigo-600">
                      <ThumbsUp className="h-4 w-4" /> {discussion.likes?.length || 0}
                    </button>
                    <button onClick={() => setReplyingTo(replyingTo === discussion._id ? null : discussion._id)} className="flex items-center gap-1 hover:text-indigo-600">
                      <MessageSquare className="h-4 w-4" /> {discussion.replies?.length || 0} replies
                    </button>
                    {admin?.role === 'admin' && (
                      <button onClick={() => handleDeleteDiscussion(discussion._id)} className="flex items-center gap-1 text-rose-500 hover:text-rose-700">
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    )}
                  </div>

                  {/* Replies Section */}
                  {discussion.replies && discussion.replies.length > 0 && (
                    <div className="mt-4 pl-6 border-l-2 border-slate-100 space-y-3">
                      {discussion.replies.map((reply, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-semibold">{reply.author?.name || 'User'}</span>
                          <p className="text-slate-600 mt-1">{reply.content}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === discussion._id && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        className="flex-1 px-4 py-2 bg-slate-50 rounded-xl focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleReply(discussion._id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Main render
  if (loading) return (<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><BookOpen className="h-6 w-6" /></div>
              <div><span className="font-bold text-xl text-white">Smart<span className="text-indigo-400">Kuppi</span></span><span className="text-[10px] uppercase tracking-widest text-slate-500 block">Admin Panel</span></div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X className="h-6 w-6" /></button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <p className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p>
            {[
              { name: 'Dashboard', view: 'dashboard', icon: Layout },
              { name: 'User Management', view: 'users', icon: Shield },
              { name: 'Tutors', view: 'tutors', icon: Users },
              { name: 'Audit Logs', view: 'auditLogs', icon: FileText },
              { name: 'Courses', view: 'courses', icon: BookOpen },
              { name: 'Schedule', view: 'schedule', icon: CalendarIcon },
              { name: 'Announcements', view: 'announcements', icon: Bell },
              { name: 'Resources', view: 'resources', icon: FileText },
              { name: 'Messages', view: 'messages', icon: MessageSquare },
              { name: 'Discussions', view: 'discussions', icon: MessageSquare }
            ].map(link => {
              const isActive = activeView === link.view;
              const Icon = link.icon;
              return (<button key={link.name} 
                onClick={() => {
                  if (link.view === 'discussions') {
                    goToDiscussions();
                  } else {
                    setActiveView(link.view);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'hover:bg-slate-800 hover:text-white'}`}><Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} /><span>{link.name}</span></button>);
            })}
          </nav>
          <div className="p-4 border-t border-slate-800"><div className="bg-slate-800/50 rounded-2xl p-4"><div className="flex items-center space-x-3 mb-3"><div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">{admin ? getInitials(admin.name) : 'A'}</div><div><p className="text-sm font-medium text-white truncate">{admin?.name || 'Admin'}</p><p className="text-xs text-slate-500 truncate">Super Administrator</p></div></div><button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg"><LogOut className="h-4 w-4" /><span>Sign Out</span></button></div></div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          {/* Left side - page title */}
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">
              {activeView === 'dashboard' ? 'Dashboard' : 
              activeView === 'tutors' ? 'Tutor Management' : 
              activeView === 'schedule' ? 'Schedule Management' : 
              activeView === 'courses' ? 'Course Management' : 
              activeView === 'messages' ? 'Messages' : 
              activeView === 'resources' ? 'Resources' : 'User Management'}
            </h1>
          </div>

          {/* Right side - notifications and profile */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            
            {/* Profile button that opens modal */}
            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-3 p-1.5 hover:bg-slate-100 rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {admin ? getInitials(admin.name) : 'AD'}
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-700">
                {admin?.name?.split(' ')[0] || 'Admin'}
              </span>
              <Settings className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && <DashboardView key="dashboard" />}
            {activeView === 'tutors' && (
              <TutorManagementView
                tutors={tutors}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filter={filter}
                setFilter={setFilter}
                tutorsLoading={tutorsLoading}
                actionLoading={actionLoading}
                handleTutorStatusChange={handleTutorStatusChange}
                setSelectedTutor={setSelectedTutor}
                setShowDetailsModal={setShowDetailsModal}
                getInitials={getInitials}
                getStatusBadge={getStatusBadge}
                onBack={() => setActiveView('dashboard')}
              />
            )}
            {activeView === 'schedule' && (
              <ScheduleManagementView
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                allLessons={allLessons}
                scheduleView={scheduleView}
                setScheduleView={setScheduleView}
                filterTutor={filterTutor}
                setFilterTutor={setFilterTutor}
                filterCourse={filterCourse}
                setFilterCourse={setFilterCourse}
                setShowScheduleModal={setShowScheduleModal}
                tileContent={tileContent}
                formatTime={formatTime}
                setActiveView={setActiveView}
                onEditLesson={openEditLessonModal}
                onDeleteLesson={handleDeleteLesson}
              />
            )}
            {activeView === 'courses' && <CourseManagement onBack={() => setActiveView('dashboard')} key="courses" />}
            {activeView === 'messages' && <AdminMessages onBack={() => setActiveView('dashboard')} key="messages" />}
            {activeView === 'resources' && <ResourceManagement onBack={() => setActiveView('dashboard')} key="resources" />}
            {activeView === 'announcements' && (
              <AnnouncementManager
                key="announcements"
                pageTitle="Campus Announcements"
                pageDescription="Post updates for the entire student body or specific courses."
                announcements={announcements}
                loading={announcementsLoading}
                allowCreate={true}
                allowCommon={true}
                courseOptions={announcementCourses}
                currentUserId={admin?.id || admin?._id}
                currentUserRole={admin?.role}
                onBack={() => setActiveView('dashboard')}
                onRefresh={fetchAnnouncements}
                onCreateAnnouncement={handleCreateAnnouncement}
                onUpdateAnnouncement={handleUpdateAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
              />
            )}
            {activeView === 'users' && <UserManagement onBack={() => setActiveView('dashboard')} key="users" />}
            {activeView === 'discussions' && <div key="discussions">{renderDiscussions()}</div>}
            {activeView === 'auditLogs' && (
              <motion.div key="auditLogs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveView('dashboard')} className="p-2 hover:bg-white border rounded-xl">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                      <h1 className="text-2xl font-bold">Audit Logs</h1>
                      <p className="text-slate-500">Track all admin actions and system events</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAuditFilters(!showAuditFilters)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
                    <Filter className="h-4 w-4" /> {showAuditFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>

                {showAuditFilters && (
                  <div className="bg-white p-5 rounded-3xl border shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase">User</label>
                        <select value={localAuditFilters.user} onChange={e => setLocalAuditFilters({...localAuditFilters, user: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl">
                          <option value="">All Users</option>
                          {[...new Map(auditLogs.map(log => [log.user.id, { id: log.user.id, name: log.user.name }])).values()].map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase">Action</label>
                        <select value={localAuditFilters.action} onChange={e => setLocalAuditFilters({...localAuditFilters, action: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl">
                          <option value="">All Actions</option>
                          {[...new Set(auditLogs.map(log => log.action))].map(a => (
                            <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase">Start Date</label>
                        <input type="date" value={localAuditFilters.startDate} onChange={e => setLocalAuditFilters({...localAuditFilters, startDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase">End Date</label>
                        <input type="date" value={localAuditFilters.endDate} onChange={e => setLocalAuditFilters({...localAuditFilters, endDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={applyAuditFilters} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Apply Filters</button>
                      <button onClick={resetAuditFilters} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Reset</button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="px-6 py-4 text-left text-[10px] font-bold">Timestamp</th>
                          <th className="px-6 py-4 text-left text-[10px] font-bold">User</th>
                          <th className="px-6 py-4 text-left text-[10px] font-bold">Action</th>
                          <th className="px-6 py-4 text-left text-[10px] font-bold">Entity</th>
                          <th className="px-6 py-4 text-left text-[10px] font-bold">Details</th>
                          <th className="px-6 py-4 text-left text-[10px] font-bold">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {auditLoading ? (
                          <tr><td colSpan="6" className="px-6 py-12 text-center"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                        ) : auditLogs.length === 0 ? (
                          <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">No audit logs found</td></tr>
                        ) : (
                          auditLogs.map(log => (
                            <tr key={log._id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium">{log.user.name}</p>
                                  <p className="text-[10px] text-slate-500">{log.user.role}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">{log.action.replace(/_/g, ' ')}</span></td>
                              <td className="px-6 py-4">{log.entity}</td>
                              <td className="px-6 py-4 text-sm max-w-xs truncate">{JSON.stringify(log.details)}</td>
                              <td className="px-6 py-4 text-xs">{log.ipAddress || 'N/A'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {auditPagination.total > 0 && (
                    <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
                      <p className="text-xs text-slate-500">Showing {auditLogs.length} of {auditPagination.total} logs</p>
                      <div className="flex gap-2">
                        <button onClick={() => setAuditPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))} disabled={auditPagination.page === 1} className="px-3 py-1 bg-white border rounded-lg text-sm disabled:opacity-50">Previous</button>
                        <span className="px-3 py-1 text-sm">Page {auditPagination.page}</span>
                        <button onClick={() => setAuditPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={auditLogs.length < auditPagination.limit} className="px-3 py-1 bg-white border rounded-lg text-sm disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        <footer className="bg-white border-t border-slate-100 py-6 px-8"><div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center space-x-2"><BookOpen className="h-5 w-5 text-indigo-500" /><span className="font-bold text-slate-900">Smart<span className="text-indigo-500">Kuppi</span></span><span className="text-xs text-slate-400">© 2024 Admin Portal</span></div><div className="flex items-center space-x-6 text-xs font-bold text-slate-400 uppercase"><button className="hover:text-indigo-500">Docs</button><button className="hover:text-indigo-500">Support</button><button className="hover:text-indigo-500">Privacy</button></div></div></footer>
      </div>

      {/* Modals */}
      <ScheduleLessonModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} tutors={tutors} onSchedule={handleScheduleLesson} loading={scheduleLoading} />
      {showDetailsModal && selectedTutor && <TutorDetailModal tutor={selectedTutor} onClose={() => { setShowDetailsModal(false); setSelectedTutor(null); }} onStatusChange={handleTutorStatusChange} actionLoading={actionLoading} />}
      {scheduleSuccess && (<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50"><CheckCircle className="h-5 w-5" />Lesson scheduled successfully!</motion.div>)}

      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={admin}
        onUpdate={handleProfileUpdate}
      />
      {/* Edit Lesson Modal */}
      <AnimatePresence>
        {showEditLessonModal && editingLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => setShowEditLessonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Edit Lesson</h2>
                  <button onClick={() => setShowEditLessonModal(false)} className="p-2 hover:bg-white/10 rounded-xl">
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
                <p className="text-indigo-100 text-sm mt-1">Update lesson details</p>
              </div>

              <form onSubmit={handleUpdateLesson} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Lesson Title *</label>
                  <input
                    type="text"
                    value={editLessonForm.title}
                    onChange={e => setEditLessonForm({ ...editLessonForm, title: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${
                      editLessonErrors.title ? 'border-rose-300' : 'border-transparent focus:border-indigo-500'
                    }`}
                  />
                  {editLessonErrors.title && <p className="text-xs text-rose-500 mt-1">{editLessonErrors.title}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Description *</label>
                  <textarea
                    rows={3}
                    value={editLessonForm.description}
                    onChange={e => setEditLessonForm({ ...editLessonForm, description: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${
                      editLessonErrors.description ? 'border-rose-300' : 'border-transparent focus:border-indigo-500'
                    }`}
                  />
                  {editLessonErrors.description && <p className="text-xs text-rose-500 mt-1">{editLessonErrors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Date *</label>
                    <input
                      type="date"
                      value={editLessonForm.date}
                      onChange={e => setEditLessonForm({ ...editLessonForm, date: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${
                        editLessonErrors.date ? 'border-rose-300' : 'border-transparent focus:border-indigo-500'
                      }`}
                    />
                    {editLessonErrors.date && <p className="text-xs text-rose-500 mt-1">{editLessonErrors.date}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Start Time *</label>
                    <input
                      type="time"
                      value={editLessonForm.time}
                      onChange={e => setEditLessonForm({ ...editLessonForm, time: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${
                        editLessonErrors.time ? 'border-rose-300' : 'border-transparent focus:border-indigo-500'
                      }`}
                    />
                    {editLessonErrors.time && <p className="text-xs text-rose-500 mt-1">{editLessonErrors.time}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Duration (minutes)</label>
                    <select
                      value={editLessonForm.duration}
                      onChange={e => setEditLessonForm({ ...editLessonForm, duration: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Meeting Link *</label>
                    <input
                      type="url"
                      value={editLessonForm.meetingLink}
                      onChange={e => setEditLessonForm({ ...editLessonForm, meetingLink: e.target.value })}
                      placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                      className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${
                        editLessonErrors.meetingLink ? 'border-rose-300' : 'border-transparent focus:border-indigo-500'
                      }`}
                    />
                    {editLessonErrors.meetingLink && <p className="text-xs text-rose-500 mt-1">{editLessonErrors.meetingLink}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Meeting Password (Optional)</label>
                  <input
                    type="text"
                    value={editLessonForm.meetingPassword}
                    onChange={e => setEditLessonForm({ ...editLessonForm, meetingPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditLessonModal(false)}
                    className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLessonSubmitting}
                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {editLessonSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-5 w-5" />}
                    {editLessonSubmitting ? 'Updating...' : 'Update Lesson'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;