// src/pages/TutorDashboard.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { 
  Layout, Users, BookOpen, Calendar as CalendarIcon, Bell, Clock, BarChart3,
  Plus, ArrowUpRight, Video, MessageSquare, DollarSign, 
  Settings, LogOut, Menu, X, FileText, Search, Star, AlertCircle,
  ChevronDown, Mail, Phone, Award, CheckCircle, XCircle, GraduationCap,
  FolderOpen, Inbox, Edit3, Upload, ExternalLink, MoreVertical,
  Save, ChevronLeft, Filter, Link as LinkIcon, Play, User, Download, Send, ThumbsUp, Edit2
} from 'lucide-react';
import CourseCardHeader from '../components/CourseCardHeader';
import MessageThread from '../components/MessageThread';
import AnnouncementManager from '../components/AnnouncementManager';
import ProfileEditModal from '../components/ProfileEditModal';

const API_BASE_URL = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

const TutorDashboard = ({ initialView = 'dashboard', initialCourseId = null }) => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const urlCourseId = searchParams.get('course') || params.courseId || initialCourseId;

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeView, setActiveView] = useState(initialView);
  const [selectedCourseId, setSelectedCourseId] = useState(urlCourseId);
  
  // User & auth state
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tutorStatus, setTutorStatus] = useState('approved');
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalResources: 0,
    rating: 0
  });
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  // Course list (for My Courses view)
  const [courses, setCourses] = useState([]);
  
  // Course detail state
  const [courseDetail, setCourseDetail] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [resources, setResources] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseDetailActiveTab, setCourseDetailActiveTab] = useState('lessons');
  
  // Messages state
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const selectedIdRef = useRef(null);
  // New chat with admin
  const [showNewAdminChat, setShowNewAdminChat] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  
  // Schedule state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lessonsForSchedule, setLessonsForSchedule] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [scheduleView, setScheduleView] = useState('calendar');
  const [filterCourse, setFilterCourse] = useState('all');
  const [coursesForFilter, setCoursesForFilter] = useState([]);
  
  // Create course form state
  const [createFormData, setCreateFormData] = useState({
    title: '',
    subject: '',
    description: '',
    price: 0,
    thumbnail: ''
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  
  // Lesson create state
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    meetingLink: '',
    meetingPassword: ''
  });
  const [lessonErrors, setLessonErrors] = useState({});
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
  const [lessonSuccess, setLessonSuccess] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  
  // Edit lesson state
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

  // Resource upload state
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceFileType, setResourceFileType] = useState('other');
  const [resourceSubmitting, setResourceSubmitting] = useState(false);
  const [resourceSuccess, setResourceSuccess] = useState(false);
  
  // Resources view state
  const [tutorResources, setTutorResources] = useState([]);
  const [tutorResourcesLoading, setTutorResourcesLoading] = useState(false);
  const [tutorSearchTerm, setTutorSearchTerm] = useState('');
  const [tutorTypeFilter, setTutorTypeFilter] = useState('all');
  const [tutorDateFilter, setTutorDateFilter] = useState('all');
  const [tutorCourseFilter, setTutorCourseFilter] = useState('all');
  const [tutorCoursesForFilter, setTutorCoursesForFilter] = useState([]);

  // Discussions data
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // Resource edit state
  const [showEditResourceModal, setShowEditResourceModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [editResourceForm, setEditResourceForm] = useState({ title: '', description: '', fileType: 'other' });
  const [editResourceError, setEditResourceError] = useState('');
  const [editResourceSubmitting, setEditResourceSubmitting] = useState(false);

  // ========== Initial auth check ==========
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'tutor') {
        navigate('/');
        return;
      }
      setTutor(parsedUser);
      setTutorStatus(parsedUser.status);
      
      if (parsedUser.status === 'approved') {
        fetchDashboardData(parsedUser.id, token);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      navigate('/login');
    }
  }, [navigate]);

  // ========== Data fetching functions ==========
  const fetchDashboardData = async (tutorId, token) => {
    setLoading(true);
    try {
      const coursesRes = await fetch(`${API_BASE_URL}/courses/tutor/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        const courses = coursesData.data;
        const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
        setStats({
          totalStudents,
          totalCourses: courses.length,
          totalResources: 0,
          rating: 4.9
        });
        setCourses(courses);
      }
      
      const inboxRes = await fetch(`${API_BASE_URL}/messages/inbox`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const inboxData = await inboxRes.json();
      if (inboxData.success) {
        const unread = inboxData.data.filter(m => !m.read).length;
        setUnreadMessages(unread);
      }
      
      const allLessons = [];
      const coursesRes2 = await fetch(`${API_BASE_URL}/courses/tutor/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coursesData2 = await coursesRes2.json();
      if (coursesData2.success) {
        for (const course of coursesData2.data) {
          const lessonsRes = await fetch(`${API_BASE_URL}/lessons/courses/${course._id}/lessons`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const lessonsData = await lessonsRes.json();
          if (lessonsData.success) {
            const today = new Date().toISOString().split('T')[0];
            const todayLessons = lessonsData.data.filter(l => l.date.split('T')[0] === today);
            allLessons.push(...todayLessons.map(l => ({
              id: l._id,
              title: l.title,
              course: course.title,
              date: l.date,
              time: new Date(l.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              students: course.enrolledCount || 0,
              meetingLink: l.meetingLink
            })));
          }
        }
        setUpcomingLessons(allLessons);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback mock data
      setStats({
        totalStudents: 156,
        totalCourses: 5,
        totalResources: 28,
        rating: 4.9
      });
      setCourses([
        { _id: '1', title: 'Advanced JavaScript', subject: 'Programming', enrolledCount: 24, status: 'published' },
        { _id: '2', title: 'React Masterclass', subject: 'Web Development', enrolledCount: 18, status: 'published' }
      ]);
      setUpcomingLessons([
        { id: 1, title: 'Advanced JavaScript', course: 'JavaScript Mastery', date: new Date().toISOString(), time: '10:00 AM', students: 12, meetingLink: 'https://meet.google.com/xxx' },
        { id: 2, title: 'React Hooks Deep Dive', course: 'React Masterclass', date: new Date().toISOString(), time: '02:00 PM', students: 8, meetingLink: 'https://zoom.us/j/123' }
      ]);
      setLoading(false);
    }
  };

  const fetchAnnouncements = useCallback(async () => {
  const token = getToken();
  setAnnouncementsLoading(true);
  try {
      const res = await fetch(`${API_BASE_URL}/announcements?scope=mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAnnouncements(data.data);
    } catch (error) { console.error(error); }
    finally { setAnnouncementsLoading(false); }
  }, []);

  const handleCreateAnnouncement = async (announcementData) => {
    const res = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(announcementData)
    });
    return await res.json();
  };

  const handleUpdateAnnouncement = async (id, announcementData) => {
    const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(announcementData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update');
    return data.data;
  };
  const handleDeleteAnnouncement = async (id) => {
    await fetch(`${API_BASE_URL}/announcements/${id}`, { 
      method: 'DELETE', 
      headers: { Authorization: `Bearer ${getToken()}` } 
    });
    fetchAnnouncements();
  };

  const fetchCourseDetail = async (courseId) => {
    const token = localStorage.getItem('token');
    try {
      const courseRes = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const courseData = await courseRes.json();
      if (courseData.success) setCourseDetail(courseData.data);
      else throw new Error('Course not found');

      const lessonsRes = await fetch(`${API_BASE_URL}/lessons/courses/${courseId}/lessons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const lessonsData = await lessonsRes.json();
      if (lessonsData.success) setLessons(lessonsData.data);

      const resourcesRes = await fetch(`${API_BASE_URL}/resources/courses/${courseId}/resources`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resourcesData = await resourcesRes.json();
      if (resourcesData.success) setResources(resourcesData.data);

      const studentsRes = await fetch(`${API_BASE_URL}/enrollments/courses/${courseId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const studentsData = await studentsRes.json();
      if (studentsData.success) setStudents(studentsData.data);
    } catch (error) {
      console.error('Error fetching course detail:', error);
    }
  };

  const fetchConversation = async (courseId, tutorId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/messages?course=${courseId}&user=${tutorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        return {
          otherUser: { _id: tutorId, name: 'Student' }, // placeholder
          course: { _id: courseId, title: courseDetail?.title || '' },
          messages: data.data
        };
      } else {
        return {
          otherUser: { _id: tutorId, name: 'Student' },
          course: { _id: courseId, title: courseDetail?.title || '' },
          messages: []
        };
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  };

  const fetchMessages = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoadingMessages(true);
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    try {
      const [inboxRes, sentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/messages/inbox`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/messages/sent`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const inboxData = await inboxRes.json();
      const sentData = await sentRes.json();
      
      let allMessages = [];
      if (inboxData.success) allMessages.push(...inboxData.data);
      if (sentData.success) allMessages.push(...sentData.data);
      
      const grouped = {};
      allMessages.forEach(msg => {
        const otherUser = msg.sender._id === currentUser.id ? msg.receiver : msg.sender;
        let courseId = msg.course?._id || msg.course;
        if (!courseId) courseId = 'general';
        const key = `${otherUser._id}-${courseId}`;
        if (!grouped[key]) {
          grouped[key] = {
            id: key,
            otherUser,
            course: msg.course,
            messages: [],
            unreadCount: 0
          };
        }
        grouped[key].messages.push(msg);
        if (!msg.read && msg.receiver._id === currentUser.id) grouped[key].unreadCount++;
      });
      
      const convList = Object.values(grouped).map(conv => ({
        ...conv,
        messages: conv.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
        lastMessage: conv.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[conv.messages.length - 1]
      })).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
      
      setConversations(convList);
      if (selectedIdRef.current) {
        const updated = convList.find(c => c.id === selectedIdRef.current);
        if (updated) setSelectedConversation(updated);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const fetchAdmins = async () => {
  setLoadingAdmins(true);
  const token = localStorage.getItem('token');
  try {
      const res = await fetch(`${API_BASE_URL}/auth/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAdmins(data.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleStartAdminChat = (admin) => {
  // Check if conversation already exists
  const existing = conversations.find(c => c.otherUser._id === admin._id);
  if (existing) {
    setSelectedConversation(existing);
    selectedIdRef.current = existing.id;
  } else {
    // Create a temporary conversation object
    const tempConv = {
        id: `temp-${admin._id}`,
        otherUser: admin,
        course: null,
        messages: [],
        lastMessage: null,
        unreadCount: 0
      };
      setConversations(prev => [tempConv, ...prev]);
      setSelectedConversation(tempConv);
      selectedIdRef.current = tempConv.id;
    }
    setShowNewAdminChat(false);
  };

  const goToResources = () => {
  setActiveView('resources');
  fetchTutorResources();
  };

  const fetchScheduleData = async () => {
    const token = localStorage.getItem('token');
    try {
      const coursesRes = await fetch(`${API_BASE_URL}/courses/tutor/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        setCoursesForFilter(coursesData.data);
        let allLessons = [];
        for (const course of coursesData.data) {
          const lessonsRes = await fetch(`${API_BASE_URL}/lessons/courses/${course._id}/lessons`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const lessonsData = await lessonsRes.json();
          if (lessonsData.success) {
            const lessonsWithCourse = lessonsData.data.map(lesson => ({
              ...lesson,
              courseTitle: course.title,
              courseId: course._id,
              courseSubject: course.subject,
              enrolledCount: course.enrolledCount || 0
            }));
            allLessons = [...allLessons, ...lessonsWithCourse];
          }
        }
        allLessons.sort((a, b) => new Date(a.date) - new Date(b.date));
        setLessonsForSchedule(allLessons);
        filterLessonsByDate(allLessons);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setMockScheduleData();
    }
  };

  const goToDiscussions = () => {
  setActiveView('discussions');
  fetchDiscussions();
  };

  // Discussions functions
  const fetchDiscussions = async () => {
    const token = localStorage.getItem('token');
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
    // Validation
    if (!newDiscussion.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!newDiscussion.content.trim()) {
      alert('Please enter content');
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/discussions/${discussionId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyContent })
      });
      const data = await res.json();
      if (data.success) {
        setDiscussions(prev => prev.map(d =>
          d._id === discussionId ? data.data : d
        ));
        setReplyingTo(null);
        setReplyContent('');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleLike = async (discussionId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/discussions/${discussionId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDiscussions(prev => prev.map(d =>
          d._id === discussionId ? data.data : d
        ));
      }
    } catch (error) {
      console.error('Error liking discussion:', error);
    }
  };

  const fetchTutorResources = async () => {
  setTutorResourcesLoading(true);
  const token = localStorage.getItem('token');
  try {
      // Option 1: If a dedicated endpoint exists
      const res = await fetch(`${API_BASE_URL}/tutor/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTutorResources(data.data);
        // Build course filter list from resources
        const courses = [...new Map(data.data.map(r => [r.course?._id, { _id: r.course?._id, title: r.course?.title }])).values()];
        setTutorCoursesForFilter(courses);
      } else {
        // Option 2: Fallback – fetch all courses and then resources per course
        const coursesRes = await fetch(`${API_BASE_URL}/courses/tutor/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const coursesData = await coursesRes.json();
        if (coursesData.success) {
          const allResources = [];
          for (const course of coursesData.data) {
            const resourcesRes = await fetch(`${API_BASE_URL}/resources/courses/${course._id}/resources`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const resourcesData = await resourcesRes.json();
            if (resourcesData.success) {
              const resourcesWithCourse = resourcesData.data.map(r => ({
                ...r,
                course: { _id: course._id, title: course.title, tutor: course.tutor }
              }));
              allResources.push(...resourcesWithCourse);
            }
          }
          setTutorResources(allResources);
          // Build course filter list
          const courses = [...new Map(allResources.map(r => [r.course?._id, { _id: r.course?._id, title: r.course?.title }])).values()];
          setTutorCoursesForFilter(courses);
        }
      }
    } catch (error) {
      console.error('Error fetching tutor resources:', error);
    } finally {
      setTutorResourcesLoading(false);
    }
  };

  const openEditResourceModal = (resource) => {
  setEditingResource(resource);
  setEditResourceForm({
    title: resource.title,
    description: resource.description || '',
    fileType: resource.fileType
  });
  setShowEditResourceModal(true);
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    if (!editResourceForm.title.trim()) {
      setEditResourceError('Title is required');
      return;
    }
    setEditResourceSubmitting(true);
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/resources/${editingResource._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editResourceForm.title,
          description: editResourceForm.description,
          fileType: editResourceForm.fileType
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowEditResourceModal(false);
        fetchTutorResources(); // refresh list
      } else {
        setEditResourceError(data.message || 'Failed to update resource');
      }
    } catch (error) {
      setEditResourceError('Network error. Please try again.');
    } finally {
      setEditResourceSubmitting(false);
    }
  };

  const filterLessonsByDate = (lessonsData = lessonsForSchedule) => {
    let filtered = lessonsData.filter(lesson => 
      isSameDay(parseISO(lesson.date), selectedDate)
    );
    if (filterCourse !== 'all') {
      filtered = filtered.filter(lesson => lesson.courseId === filterCourse);
    }
    setFilteredLessons(filtered);
  };

  const setMockScheduleData = () => {
    const mockLessons = [
      {
        _id: '1',
        title: 'Advanced JavaScript: Closures & Scope',
        description: 'Deep dive into JavaScript closures and scope chains',
        date: new Date().toISOString(),
        duration: 60,
        meetingLink: 'https://meet.google.com/xxx-xxxx-xxx',
        courseTitle: 'Advanced JavaScript',
        courseId: '1',
        courseSubject: 'Programming',
        enrolledCount: 24
      },
      {
        _id: '2',
        title: 'React Hooks Workshop',
        description: 'Learn useEffect, useState, and custom hooks',
        date: new Date(Date.now() + 86400000).toISOString(),
        duration: 90,
        meetingLink: 'https://zoom.us/j/123456789',
        courseTitle: 'React Masterclass',
        courseId: '2',
        courseSubject: 'Web Development',
        enrolledCount: 18
      }
    ];
    setLessonsForSchedule(mockLessons);
    filterLessonsByDate(mockLessons);
    setCoursesForFilter([
      { _id: '1', title: 'Advanced JavaScript', subject: 'Programming' },
      { _id: '2', title: 'React Masterclass', subject: 'Web Development' }
    ]);
  };

  // ========== Navigation handlers ==========
  const goToDashboard = () => {
    setActiveView('dashboard');
    setSelectedCourseId(null);
  };
  const goToMyCourses = () => {
    setActiveView('courses');
    setSelectedCourseId(null);
  };
  const goToCreateCourse = () => {
    setActiveView('create-course');
  };
  const goToSchedule = () => {
    setActiveView('schedule');
    fetchScheduleData();
  };
  const goToMessages = () => {
    setActiveView('messages');
    fetchMessages();
  };
  // Fixes ESLint error in TutorDashboard
  const goToAnnouncements = () => {
    setActiveView('announcements');
    fetchAnnouncements(); // Triggers the backend call to get your announcements
  };
  const goToCourseDetail = (courseId) => {
    setSelectedCourseId(courseId);
    setActiveView('courseDetail');
    fetchCourseDetail(courseId);
  };
  const goToLessonCreate = (courseId) => {
    setSelectedCourseId(courseId);
    setActiveView('lessonCreate');
    // fetch course title
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setCourseTitle(data.data.title);
      });
  };
  const goToResourceUpload = (courseId) => {
    setSelectedCourseId(courseId);
    setActiveView('resourceUpload');
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setCourseTitle(data.data.title);
      });
  };
  
  // ========== Helper functions ==========
  const getInitials = (name) => {
    if (!name) return 'T';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProfileUpdate = (updatedUser) => {
    setTutor(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };
  
  // ========== Render functions for each view ==========
  
  // Dashboard view (the main landing page)
  const renderDashboard = () => {
    const statCards = [
      { title: 'Total Students', value: stats.totalStudents, change: '+8 this month', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { title: 'Courses', value: stats.totalCourses, change: '+2 new', icon: FolderOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { title: 'Resources', value: stats.totalResources, change: '+5 new', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { title: 'Rating', value: stats.rating.toFixed(1), change: `⭐ ${stats.rating}/5`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">Tutor Premium</span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Good {getTimeOfDay()}, {tutor?.name?.split(' ')[0] || 'Tutor'}! 👋</h2>
              <p className="text-indigo-100 mt-2 max-w-md font-medium opacity-90">
                You have {upcomingLessons.length} lessons today. Your overall rating is {stats.rating.toFixed(1)}/5.0. Keep inspiring!
              </p>
            </div>
            <button 
              onClick={goToCreateCourse}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-500/20 group"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
              <span>Create New Course</span>
            </button>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 right-10 opacity-10 pointer-events-none"><BookOpen className="w-64 h-64" /></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}><Icon className="h-6 w-6" /></div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.change}</span>
                </div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
            );
          })}
        </div>

        {/* Today's Lessons */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Today's Lessons</h3>
            <button onClick={goToSchedule} className="text-indigo-600 text-sm font-bold">View Full Schedule</button>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingLessons.length > 0 ? upcomingLessons.map(lesson => (
              <div key={lesson.id} className="p-6 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600"><Video className="h-6 w-6" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900">{lesson.title}</h4>
                    <p className="text-sm text-slate-500">Course: {lesson.course} • {lesson.students} enrolled</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{lesson.time}</p>
                  {lesson.meetingLink && (
                    <a href={lesson.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">Join</a>
                  )}
                </div>
              </div>
            )) : <div className="p-12 text-center"><p className="text-slate-500">No lessons scheduled for today</p></div>}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Create Course', icon: Plus, color: 'text-blue-600', bg: 'bg-blue-50', action: goToCreateCourse },
              { label: 'Schedule', icon: CalendarIcon, color: 'text-indigo-600', bg: 'bg-indigo-50', action: goToSchedule },
              { label: 'Messages', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50', action: goToMessages },
              { label: 'Settings', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-50', action: () => console.log('Settings') },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <button key={i} onClick={action.action} className="group p-6 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all text-center">
                  <div className={`${action.bg} ${action.color} w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  // My Courses view (formerly TutorCourses)
  const renderMyCourses = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goToDashboard}
              className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Courses</h1>
              <p className="text-slate-500 mt-1">Manage the courses you've created.</p>
            </div>
          </div>
          <button
            onClick={goToCreateCourse}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Course</span>
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
            <FolderOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No courses yet</h3>
            <p className="text-slate-500 mb-6">Create your first course to start teaching.</p>
            <button
              onClick={goToCreateCourse}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
            >
              <Plus className="h-5 w-5" />
              Create New Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <CourseCardHeader course={course} height="h-40">
                  <span className="absolute top-3 right-3 px-2 py-1 bg-white/90 text-[10px] font-bold rounded-full">
                    {course.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </CourseCardHeader>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      {course.subject}
                    </span>
                    <button className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.enrolledCount || 0} students
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.lessonCount || 0} lessons
                    </div>
                  </div>
                  <button
                    onClick={() => goToCourseDetail(course._id)}
                    className="inline-flex items-center text-sm font-bold text-indigo-600 hover:underline"
                  >
                    View Course <ExternalLink className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // Create Course view (formerly TutorCourseCreate)
  const renderCreateCourse = () => {
    const subjects = [
      'Mathematics', 'Physics', 'Chemistry', 'Biology',
      'Computer Science', 'Programming', 'Web Development',
      'Database Systems', 'Networking', 'English Literature',
      'Economics', 'Business Studies', 'Accounting'
    ];
    const validateCreate = () => {
      const newErrors = {};
      if (!createFormData.title.trim()) newErrors.title = 'Title is required';
      if (!createFormData.subject) newErrors.subject = 'Subject is required';
      if (!createFormData.description.trim()) newErrors.description = 'Description is required';
      setCreateErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
    const handleCreateSubmit = async (e) => {
      e.preventDefault();
      if (!validateCreate()) return;
      setCreateSubmitting(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_BASE_URL}/courses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(createFormData)
        });
        const data = await res.json();
        if (data.success) {
          setCreateSuccess(true);
          setTimeout(() => goToMyCourses(), 2000);
        } else {
          alert(data.message || 'Failed to create course');
        }
      } catch (error) {
        console.error('Error creating course:', error);
        alert('Network error. Please try again.');
      } finally {
        setCreateSubmitting(false);
      }
    };
    if (createSuccess) {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="h-10 w-10 text-emerald-600" /></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Created!</h2>
          <p className="text-slate-500">Your course has been published and is now visible to students.</p>
        </motion.div>
      );
    }
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={goToMyCourses} className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Create New Course</h1>
            <p className="text-slate-500 mt-1">Set up a new course – you can add lessons later.</p>
          </div>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Course Title *</label>
              <input
                type="text"
                value={createFormData.title}
                onChange={e => setCreateFormData({...createFormData, title: e.target.value})}
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${createErrors.title ? 'border-rose-300' : 'border-transparent focus:border-brand-500'}`}
                placeholder="e.g. Advanced JavaScript"
              />
              {createErrors.title && <p className="text-xs text-rose-500 mt-1">{createErrors.title}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Subject *</label>
              <select
                value={createFormData.subject}
                onChange={e => setCreateFormData({...createFormData, subject: e.target.value})}
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${createErrors.subject ? 'border-rose-300' : 'border-transparent focus:border-brand-500'}`}
              >
                <option value="">Select a subject</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {createErrors.subject && <p className="text-xs text-rose-500 mt-1">{createErrors.subject}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Description *</label>
              <textarea
                rows={4}
                value={createFormData.description}
                onChange={e => setCreateFormData({...createFormData, description: e.target.value})}
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${createErrors.description ? 'border-rose-300' : 'border-transparent focus:border-brand-500'}`}
                placeholder="What will students learn? What are the prerequisites?"
              />
              {createErrors.description && <p className="text-xs text-rose-500 mt-1">{createErrors.description}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Price (LKR)</label>
              <input
                type="number"
                value={createFormData.price}
                onChange={e => setCreateFormData({...createFormData, price: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                placeholder="0 for free"
              />
              <p className="text-[10px] text-slate-400 mt-1">Set to 0 for free courses.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Thumbnail URL (optional)</label>
              <input
                type="url"
                value={createFormData.thumbnail}
                onChange={e => setCreateFormData({...createFormData, thumbnail: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={goToMyCourses} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={createSubmitting} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 disabled:opacity-70 flex items-center justify-center gap-2">
              {createSubmitting ? <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div> : <Save className="h-5 w-5" />}
              {createSubmitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </motion.div>
    );
  };

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
    const token = localStorage.getItem('token');
    const dateTime = new Date(`${editLessonForm.date}T${editLessonForm.time}`);
    
    if (isNaN(dateTime.getTime())) {
      setEditLessonErrors({ ...editLessonErrors, date: 'Invalid date/time' });
      setEditLessonSubmitting(false);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/lessons/${editingLesson._id}`, {
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
        fetchScheduleData();            // refresh schedule view
        if (activeView === 'courseDetail' && selectedCourseId) {
          fetchCourseDetail(selectedCourseId); // refresh course detail if open
        }
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

  // Schedule view (formerly TutorSchedule)
  const renderSchedule = () => {
    // Filter lessons by selected course (for dots and list view)
    const getFilteredLessons = () => {
      if (filterCourse === 'all') {
        return lessonsForSchedule;
      }
      return lessonsForSchedule.filter(lesson => lesson.courseId === filterCourse);
    };

    const filteredLessonsForDate = getFilteredLessons();
    const filteredLessonsForCalendar = filteredLessonsForDate;

    // Tile content (dots) – only show if a filtered lesson exists on that date
    const tileContent = ({ date, view }) => {
      if (view === 'month') {
        const hasLesson = filteredLessonsForCalendar.some(lesson =>
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

    // For the right panel (selected date) – also apply course filter
    const rightPanelLessons = lessonsForSchedule.filter(lesson => {
      const dateMatch = isSameDay(parseISO(lesson.date), selectedDate);
      const courseMatch = filterCourse === 'all' || lesson.courseId === filterCourse;
      return dateMatch && courseMatch;
    });

    // For list view – apply course filter and show upcoming only
    const listLessons = lessonsForSchedule
      .filter(lesson => {
        const dateMatch = new Date(lesson.date) >= new Date();
        const courseMatch = filterCourse === 'all' || lesson.courseId === filterCourse;
        return dateMatch && courseMatch;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={goToDashboard} className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Teaching Schedule</h1>
              <p className="text-slate-500 mt-1">View all your upcoming lessons and classes</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setScheduleView('calendar')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${scheduleView === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              Calendar
            </button>
            <button
              onClick={() => setScheduleView('list')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${scheduleView === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              List View
            </button>
            <button
              onClick={() => goToLessonCreate(selectedCourseId)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
            >
              <Plus className="h-4 w-4" />
              New Lesson
            </button>
          </div>
        </div>

        {/* Stats (unfiltered – overall) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Lessons</p>
            <p className="text-2xl font-bold text-slate-900">{lessonsForSchedule.length}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">This Week</p>
            <p className="text-2xl font-bold text-indigo-600">
              {lessonsForSchedule.filter(l => {
                const lessonDate = new Date(l.date);
                const weekStart = startOfWeek(new Date());
                const weekEnd = endOfWeek(new Date());
                return lessonDate >= weekStart && lessonDate <= weekEnd;
              }).length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Upcoming</p>
            <p className="text-2xl font-bold text-emerald-600">
              {lessonsForSchedule.filter(l => new Date(l.date) > new Date()).length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
            <p className="text-2xl font-bold text-blue-600">
              {lessonsForSchedule.reduce((sum, l) => sum + (l.enrolledCount || 0), 0)}
            </p>
          </div>
        </div>

        {/* Filter by course */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">Filter by course:</span>
            </div>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-4 py-2 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all text-sm font-medium text-slate-700"
            >
              <option value="all">All Courses</option>
              {coursesForFilter.map(course => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>
        </div>

        {scheduleView === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
              <div className="calendar-container custom-calendar">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileContent={tileContent}
                  className="w-full border-none font-sans"
                  next2Label={null}
                  prev2Label={null}
                />
              </div>
              <style>{`
                .custom-calendar .react-calendar {
                  width: 100%;
                  border: none;
                  font-family: inherit;
                }
                .custom-calendar .react-calendar__navigation {
                  margin-bottom: 2rem;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                }
                .custom-calendar .react-calendar__navigation button {
                  min-width: 44px;
                  background: none;
                  font-size: 1.125rem;
                  font-weight: 700;
                  color: #0f172a;
                  border-radius: 12px;
                  padding: 8px;
                  transition: all 0.2s;
                }
                .custom-calendar .react-calendar__navigation button:hover {
                  background-color: #f8fafc;
                }
                .custom-calendar .react-calendar__month-view__weekdays {
                  text-transform: uppercase;
                  font-weight: 700;
                  font-size: 0.75rem;
                  color: #94a3b8;
                  letter-spacing: 0.05em;
                  margin-bottom: 1rem;
                }
                .custom-calendar .react-calendar__month-view__days__day {
                  padding: 1rem 0;
                  font-weight: 600;
                  color: #475569;
                  border-radius: 16px;
                  transition: all 0.2s;
                }
                .custom-calendar .react-calendar__month-view__days__day:hover {
                  background-color: #f1f5f9;
                }
                .custom-calendar .react-calendar__tile--now {
                  background: #eff6ff;
                  color: #2563eb;
                }
                .custom-calendar .react-calendar__tile--active {
                  background: #2563eb !important;
                  color: white !important;
                  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
                }
              `}</style>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h3>
                </div>
              </div>
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {rightPanelLessons.length > 0 ? (
                  rightPanelLessons.map(lesson => (
                    <div key={lesson._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
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
                        <div className="flex flex-wrap gap-2">
                          {lesson.meetingLink && (
                            <a href={lesson.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
                              Start Session <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <button onClick={() => goToCourseDetail(lesson.courseId)} className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600">
                            View Course
                          </button>
                          <button onClick={() => openEditLessonModal(lesson)} className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700">
                            <Edit3 className="h-3 w-3" /> Edit
                          </button>
                        </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No lessons scheduled for this day</p>
                    <button
                      onClick={() => goToLessonCreate(selectedCourseId)}
                      className="inline-block mt-4 text-indigo-600 text-sm font-bold hover:underline"
                    >
                      Schedule a lesson
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">All Upcoming Lessons</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {listLessons.length === 0 ? (
                <div className="p-12 text-center">
                  <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No upcoming lessons match the selected filter</p>
                  <button
                    onClick={() => setFilterCourse('all')}
                    className="inline-block mt-4 text-indigo-600 text-sm font-bold hover:underline"
                  >
                    Clear filter
                  </button>
                </div>
              ) : (
                listLessons.map(lesson => (
                  <div key={lesson._id} className="p-6 hover:bg-slate-50 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Video className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{lesson.title}</h3>
                          <p className="text-sm text-slate-500">{lesson.courseTitle} • {lesson.courseSubject}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {new Date(lesson.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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
                        <div className="flex gap-3">
                        {lesson.meetingLink && (
                          <a href={lesson.meetingLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">
                            Start Session
                          </a>
                        )}
                        <button onClick={() => goToCourseDetail(lesson.courseId)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50">
                          View Course
                        </button>
                        <button onClick={() => openEditLessonModal(lesson)} className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-medium hover:bg-amber-100">
                          <Edit3 className="h-4 w-4 inline mr-1" /> Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        )}
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
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
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
                      placeholder="e.g., Introduction to React Hooks"
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
                      placeholder="What will students learn?"
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
                        min={new Date().toISOString().split('T')[0]}
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
                      placeholder="Enter password if required"
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
      </motion.div>
    );
  };

  // Messages view (formerly TutorMessages)
  const renderMessages = () => {
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const diff = (new Date() - date) / 1000;
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
      return date.toLocaleDateString();
    };
    const handleSelect = (conv) => {
      selectedIdRef.current = conv.id;
      setSelectedConversation(conv);
    };
    const onMessageSent = () => {
      fetchMessages(true);
    };
    if (loadingMessages && conversations.length === 0) {
      return (
        <div className="flex justify-center p-10">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={goToDashboard} className="p-2 hover:bg-white border rounded-xl transition-all text-slate-500">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Tutor Messages</h1>
          </div>
          <button
            onClick={() => {
              fetchAdmins();
              setShowNewAdminChat(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-indigo-700 transition-all"
          >
            <Plus className="h-4 w-4" /> New Chat
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b bg-slate-50 font-bold text-slate-700">Conversations</div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {conversations.length === 0 ? (
                <div className="p-10 text-center text-slate-400">No messages found.</div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelect(conv)}
                    className={`w-full p-4 text-left hover:bg-slate-50 transition-all ${selectedConversation?.id === conv.id ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <User className="text-slate-500" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-slate-900 truncate">{conv.otherUser.name}</p>
                          <span className="text-[10px] text-slate-400">
                            {conv.lastMessage ? formatDate(conv.lastMessage.createdAt) : 'New'}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-600 truncate flex items-center gap-1">
                          <BookOpen size={12} /> {conv.course?.title || 'Admin Chat'}
                        </p>
                        <p className="text-sm text-slate-500 truncate mt-1">
                          {conv.lastMessage ? conv.lastMessage.content : 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[600px]">
            {selectedConversation ? (
              <MessageThread
                conversation={selectedConversation}
                onMessageSent={onMessageSent}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <MessageSquare size={64} className="opacity-20 mb-4" />
                <p className="text-slate-500 font-medium">Select a student to chat</p>
              </div>
            )}
          </div>
        </div>
        {/* New Chat with Admin Modal */}
          <AnimatePresence>
            {showNewAdminChat && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                onClick={() => setShowNewAdminChat(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-white">Start New Chat</h2>
                      <button onClick={() => setShowNewAdminChat(false)} className="p-2 hover:bg-white/10 rounded-xl">
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                    <p className="text-indigo-100 text-sm mt-1">Select an admin to start a conversation</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {loadingAdmins ? (
                      <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : admins.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">No admins found</div>
                    ) : (
                      <div className="space-y-2">
                        {admins.map(admin => (
                          <button
                            key={admin._id}
                            onClick={() => handleStartAdminChat(admin)}
                            className="w-full p-3 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                              {admin.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{admin.name}</p>
                              <p className="text-xs text-slate-500">{admin.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="border-t p-4 flex justify-end">
                    <button onClick={() => setShowNewAdminChat(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200">Cancel</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
      </motion.div>
    );
  };

  // Resources view
  const renderResources = () => {
    const filteredResources = tutorResources.filter(r => {
      const matchSearch = r.title.toLowerCase().includes(tutorSearchTerm.toLowerCase()) ||
                          (r.description || '').toLowerCase().includes(tutorSearchTerm.toLowerCase());
      const matchType = tutorTypeFilter === 'all' || r.fileType === tutorTypeFilter;
      const matchCourse = tutorCourseFilter === 'all' || r.course?._id === tutorCourseFilter;
      let matchDate = true;
      if (tutorDateFilter === 'week') matchDate = new Date(r.createdAt) > new Date(Date.now() - 7 * 86400000);
      else if (tutorDateFilter === 'month') matchDate = new Date(r.createdAt) > new Date(Date.now() - 30 * 86400000);
      return matchSearch && matchType && matchCourse && matchDate;
    });

    const getFileIcon = (type) => {
      if (type === 'pdf') return <FileText className="h-5 w-5 text-rose-500" />;
      if (type === 'video') return <Video className="h-5 w-5 text-blue-500" />;
      return <FileText className="h-5 w-5 text-slate-500" />;
    };

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={goToDashboard} className="p-2 hover:bg-white border rounded-xl"><ChevronLeft className="h-5 w-5" /></button>
          <div>
            <h1 className="text-2xl font-bold">My Resources</h1>
            <p className="text-slate-500">All learning materials you have uploaded</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border"><p className="text-xs font-bold text-slate-400">Total Resources</p><p className="text-2xl font-bold">{tutorResources.length}</p></div>
          <div className="bg-white p-5 rounded-3xl border"><p className="text-xs font-bold text-slate-400">PDFs</p><p className="text-2xl font-bold text-rose-600">{tutorResources.filter(r => r.fileType === 'pdf').length}</p></div>
          <div className="bg-white p-5 rounded-3xl border"><p className="text-xs font-bold text-slate-400">Videos</p><p className="text-2xl font-bold text-blue-600">{tutorResources.filter(r => r.fileType === 'video').length}</p></div>
          <div className="bg-white p-5 rounded-3xl border"><p className="text-xs font-bold text-slate-400">Total Downloads</p><p className="text-2xl font-bold text-emerald-600">{tutorResources.reduce((s, r) => s + (r.downloads || 0), 0)}</p></div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-3xl border">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search by title or description..." value={tutorSearchTerm} onChange={e => setTutorSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl" />
            </div>
            <select value={tutorTypeFilter} onChange={e => setTutorTypeFilter(e.target.value)} className="px-4 py-3 bg-slate-50 rounded-xl">
              <option value="all">All Types</option><option value="pdf">PDF</option><option value="video">Video</option><option value="image">Image</option><option value="other">Other</option>
            </select>
            <select value={tutorDateFilter} onChange={e => setTutorDateFilter(e.target.value)} className="px-4 py-3 bg-slate-50 rounded-xl">
              <option value="all">All Time</option><option value="week">Last 7 days</option><option value="month">Last 30 days</option>
            </select>
            <select value={tutorCourseFilter} onChange={e => setTutorCourseFilter(e.target.value)} className="px-4 py-3 bg-slate-50 rounded-xl">
              <option value="all">All Courses</option>
              {tutorCoursesForFilter.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        {tutorResourcesLoading ? (
          <div className="flex justify-center py-12"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold">Resource</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold">Course</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold">Type</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold">Uploaded</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredResources.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No resources found</td></tr>
                  ) : (
                    filteredResources.map(r => (
                      <tr key={r._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getFileIcon(r.fileType)}
                            <div>
                              <p className="font-bold text-slate-900">{r.title}</p>
                              <p className="text-xs text-slate-500 line-clamp-1">{r.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium">{r.course?.title}</p>
                        </td>
                        <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full uppercase">{r.fileType}</span></td>
                        <td className="px-6 py-4 text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Download icon */}
                            <a href={`${API_BASE_URL}${r.fileUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                              <Download className="h-4 w-4" />
                            </a>
                            {/* Edit button (three dots) */}
                            <div className="relative">
                              <button
                                onClick={() => setEditingResource(editingResource?._id === r._id ? null : r)}
                                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {editingResource?._id === r._id && (
                                <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-10">
                                  <button
                                    onClick={() => openEditResourceModal(r)}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Edit2 className="h-4 w-4" /> Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Resource Modal */}
        <AnimatePresence>
          {showEditResourceModal && editingResource && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
              onClick={() => setShowEditResourceModal(false)}
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
                    <button onClick={() => setShowEditResourceModal(false)} className="p-2 hover:bg-white/10 rounded-xl">
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
                <form onSubmit={handleUpdateResource} className="p-6 space-y-4">
                  {editResourceError && (
                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-600 text-sm">
                      {editResourceError}
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-bold uppercase mb-1 block">Resource Title *</label>
                    <input
                      type="text"
                      value={editResourceForm.title}
                      onChange={e => setEditResourceForm({ ...editResourceForm, title: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase mb-1 block">Description (optional)</label>
                    <textarea
                      rows={3}
                      value={editResourceForm.description}
                      onChange={e => setEditResourceForm({ ...editResourceForm, description: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase mb-1 block">File Type</label>
                    <select
                      value={editResourceForm.fileType}
                      onChange={e => setEditResourceForm({ ...editResourceForm, fileType: e.target.value })}
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
                      onClick={() => setShowEditResourceModal(false)}
                      className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editResourceSubmitting}
                      className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {editResourceSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
                      {editResourceSubmitting ? 'Updating...' : 'Update Resource'}
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

  // Discussions view
  const renderDiscussions = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={goToDashboard} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Discussion Forum</h1>
          <p className="text-slate-500 mt-1">Ask questions, share knowledge, and connect with fellow tutors and students.</p>
        </div>
      </div>

      {/* Create Discussion Form */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Start a Discussion</h2>
        <form onSubmit={handleCreateDiscussion} className="space-y-4">
          <input
            type="text"
            placeholder="Discussion title"
            value={newDiscussion.title}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all"
          />
          <textarea
            rows={4}
            placeholder="What would you like to discuss?"
            value={newDiscussion.content}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:outline-none transition-all resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-70"
          >
            {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="h-5 w-5" />}
            {submitting ? 'Posting...' : 'Post Discussion'}
          </button>
        </form>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
            <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No discussions yet. Be the first to start one!</p>
          </div>
        ) : (
          discussions.map((discussion) => (
            <div key={discussion._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{discussion.title}</h3>
                  <p className="text-slate-600 mb-4">{discussion.content}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><User className="h-4 w-4" /> {discussion.author?.name || 'Unknown'}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {new Date(discussion.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleLike(discussion._id)}
                      className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" /> {discussion.likes?.length || 0}
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === discussion._id ? null : discussion._id)}
                      className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" /> {discussion.replies?.length || 0} replies
                    </button>
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

  // Course Detail view (formerly TutorCourseDetail)
  const renderCourseDetail = () => {
    if (!courseDetail) {
      return <div className="flex justify-center py-12"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
    }
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={goToMyCourses} className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{courseDetail.title}</h1>
              <p className="text-slate-500 mt-1">{courseDetail.subject} • {courseDetail.enrolledCount || 0} students enrolled</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => goToLessonCreate(courseDetail._id)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              <span>Add Lesson</span>
            </button>
            <button
              onClick={() => goToResourceUpload(courseDetail._id)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Resource</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <p className="text-slate-600">{courseDetail.description}</p>
          </div>
          <div className="border-b border-slate-100">
            <div className="flex gap-2 p-2">
              {['lessons', 'resources', 'students'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setCourseDetailActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${courseDetailActiveTab === tab ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {tab === 'lessons' && <><Video className="h-4 w-4 inline mr-2" />Lessons ({lessons.length})</>}
                  {tab === 'resources' && <><FileText className="h-4 w-4 inline mr-2" />Resources ({resources.length})</>}
                  {tab === 'students' && <><Users className="h-4 w-4 inline mr-2" />Students ({students.length})</>}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {courseDetailActiveTab === 'lessons' && (
              <div className="space-y-4">
                {lessons.length > 0 ? (
                  lessons.map(lesson => (
                    <div key={lesson._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-900">{lesson.title}</h3>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {new Date(lesson.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTime(lesson.date)}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.duration} min</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a href={lesson.meetingLink} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all">
                            Start Session
                          </a>
                          <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {lesson.meetingLink && (
                        <a href={lesson.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-2">
                          <ExternalLink className="h-3 w-3" /> Meeting Link
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No lessons yet. Click "Add Lesson" to create one.</p>
                  </div>
                )}
              </div>
            )}
            {courseDetailActiveTab === 'resources' && (
              <div className="space-y-4">
                {resources.length > 0 ? (
                  resources.map(res => (
                    <div key={res._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{res.title}</h4>
                        <p className="text-xs text-slate-500">{res.fileType?.toUpperCase() || 'FILE'} • {res.downloads} downloads</p>
                      </div>
                      <a href={`${API_BASE_URL}${res.fileUrl}`} download className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors">
                        <Download className="h-5 w-5" />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No resources yet. You can upload materials later.</p>
                  </div>
                )}
              </div>
            )}
            {courseDetailActiveTab === 'students' && (
              <div className="space-y-4">
                {students.length > 0 ? (
                  students.map(enrollment => (
                    <div key={enrollment._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{enrollment.student?.name || 'Unknown'}</h4>
                        <p className="text-xs text-slate-500">{enrollment.student?.email || ''}</p>
                      </div>
                      <button
                        onClick={() => {
                          // For simplicity, we'll just go to messages and maybe pre-select this student's conversation.
                          // But that would require more complex state. We'll just go to messages.
                          goToMessages();
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <MessageSquare className="h-3 w-3 inline mr-1" /> Message
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No students enrolled yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Lesson Create view (formerly TutorLessonCreate)
  const renderLessonCreate = () => {
    const validateLesson = () => {
      const newErrors = {};
      if (!lessonFormData.title.trim()) newErrors.title = 'Lesson title is required';
      if (!lessonFormData.description.trim()) newErrors.description = 'Description is required';
      if (!lessonFormData.date) newErrors.date = 'Date is required';
      if (!lessonFormData.time) newErrors.time = 'Start time is required';
      if (!lessonFormData.meetingLink) newErrors.meetingLink = 'Meeting link is required';
      if (lessonFormData.meetingLink && !lessonFormData.meetingLink.startsWith('http')) {
        newErrors.meetingLink = 'Meeting link must start with http:// or https://';
      }
      setLessonErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
    
    const handleLessonSubmit = async (e) => {
      e.preventDefault();
      if (!validateLesson()) return;
      setLessonSubmitting(true);
      const token = localStorage.getItem('token');
      const dateTime = new Date(`${lessonFormData.date}T${lessonFormData.time}`);
      if (isNaN(dateTime.getTime())) {
        setLessonErrors({ ...lessonErrors, date: 'Invalid date/time' });
        setLessonSubmitting(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/lessons/courses/${selectedCourseId}/lessons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: lessonFormData.title,
            description: lessonFormData.description,
            date: dateTime.toISOString(),
            duration: parseInt(lessonFormData.duration),
            meetingLink: lessonFormData.meetingLink,
            meetingPassword: lessonFormData.meetingPassword
          })
        });
        const data = await res.json();
        if (data.success) {
          setLessonSuccess(true);
          setTimeout(() => goToCourseDetail(selectedCourseId), 2000);
        } else {
          alert(data.message || 'Failed to create lesson');
        }
      } catch (error) {
        console.error('Error creating lesson:', error);
        alert('Network error. Please try again.');
      } finally {
        setLessonSubmitting(false);
      }
    };

    if (lessonSuccess) {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="h-10 w-10 text-emerald-600" /></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Lesson Created!</h2>
          <p className="text-slate-500">Your lesson has been added to the course.</p>
          <button onClick={() => goToCourseDetail(selectedCourseId)} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
            Back to Course
          </button>
        </motion.div>
      );
    }
    
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => goToCourseDetail(selectedCourseId)} className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Add Lesson</h1>
            <p className="text-slate-500 mt-1">to {courseTitle || 'course'}</p>
          </div>
        </div>
        <form onSubmit={handleLessonSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Lesson Title *</label>
              <input
                type="text"
                value={lessonFormData.title}
                onChange={e => setLessonFormData({...lessonFormData, title: e.target.value})}
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${lessonErrors.title ? 'border-rose-300' : 'border-transparent focus:border-brand-500'}`}
                placeholder="e.g. Introduction to JavaScript"
              />
              {lessonErrors.title && <p className="text-xs text-rose-500 mt-1">{lessonErrors.title}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Description *</label>
              <textarea
                rows={3}
                value={lessonFormData.description}
                onChange={e => setLessonFormData({...lessonFormData, description: e.target.value})}
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${lessonErrors.description ? 'border-rose-300' : 'border-transparent focus:border-brand-500'}`}
                placeholder="What will students learn?"
              />
              {lessonErrors.description && <p className="text-xs text-rose-500 mt-1">{lessonErrors.description}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Date *</label>
                <input
                  type="date"
                  value={lessonFormData.date}
                  onChange={e => setLessonFormData({...lessonFormData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${lessonErrors.date ? 'border-rose-300' : 'border-transparent focus:border-brand-500'}`}
                />
                {lessonErrors.date && <p className="text-xs text-rose-500 mt-1">{lessonErrors.date}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Start Time *</label>
                <input
                  type="time"
                  value={lessonFormData.time}
                  onChange={e => setLessonFormData({...lessonFormData, time: e.target.value})}
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${lessonErrors.time ? 'border-rose-300' : 'border-transparent focus:border-brand-500'}`}
                />
                {lessonErrors.time && <p className="text-xs text-rose-500 mt-1">{lessonErrors.time}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Duration (minutes)</label>
                <select
                  value={lessonFormData.duration}
                  onChange={e => setLessonFormData({...lessonFormData, duration: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
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
                  value={lessonFormData.meetingLink}
                  onChange={e => setLessonFormData({...lessonFormData, meetingLink: e.target.value})}
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${lessonErrors.meetingLink ? 'border-rose-300' : 'border-transparent focus:border-brand-500'}`}
                />
                {lessonErrors.meetingLink && <p className="text-xs text-rose-500 mt-1">{lessonErrors.meetingLink}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Meeting Password (Optional)</label>
              <input
                type="text"
                value={lessonFormData.meetingPassword}
                onChange={e => setLessonFormData({...lessonFormData, meetingPassword: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                placeholder="Enter password if required"
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => goToCourseDetail(selectedCourseId)} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={lessonSubmitting} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 disabled:opacity-70 flex items-center justify-center gap-2">
              {lessonSubmitting ? <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div> : <Save className="h-5 w-5" />}
              {lessonSubmitting ? 'Creating...' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </motion.div>
    );
  };

  // Resource Upload view (formerly TutorResourceUpload)
  const renderResourceUpload = () => {
    const handleFileChange = (e) => {
      const selected = e.target.files[0];
      if (selected) {
        setResourceFile(selected);
        const ext = selected.name.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) setResourceFileType('pdf');
        else if (['mp4', 'mov', 'avi'].includes(ext)) setResourceFileType('video');
        else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) setResourceFileType('image');
        else setResourceFileType('other');
      }
    };
    const handleResourceSubmit = async (e) => {
      e.preventDefault();
      if (!resourceTitle.trim()) {
        alert('Please enter a title');
        return;
      }
      if (!resourceFile) {
        alert('Please select a file');
        return;
      }
      setResourceSubmitting(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', resourceFile);
      formData.append('title', resourceTitle);
      formData.append('description', resourceDescription);
      formData.append('fileType', resourceFileType);
      try {
        const res = await fetch(`${API_BASE_URL}/resources/courses/${selectedCourseId}/resources`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          setResourceSuccess(true);
          setTimeout(() => goToCourseDetail(selectedCourseId), 2000);
        } else {
          alert(data.message || 'Failed to upload resource');
        }
      } catch (error) {
        console.error('Error uploading resource:', error);
        alert('Network error. Please try again.');
      } finally {
        setResourceSubmitting(false);
      }
    };
    if (resourceSuccess) {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="h-10 w-10 text-emerald-600" /></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Resource Uploaded!</h2>
          <p className="text-slate-500">The file has been added to the course.</p>
        </motion.div>
      );
    }
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => goToCourseDetail(selectedCourseId)} className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Upload Resource</h1>
            <p className="text-slate-500 mt-1">for {courseTitle || 'course'}</p>
          </div>
        </div>
        <form onSubmit={handleResourceSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Title *</label>
              <input
                type="text"
                value={resourceTitle}
                onChange={e => setResourceTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
                placeholder="e.g. Lecture Slides"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Description (optional)</label>
              <textarea
                rows={3}
                value={resourceDescription}
                onChange={e => setResourceDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all resize-none"
                placeholder="Brief description of the resource"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">File *</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-brand-500 transition-colors cursor-pointer" onClick={() => document.getElementById('fileInput').click()}>
                {resourceFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-brand-500" />
                    <span className="text-slate-700 font-medium">{resourceFile.name}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setResourceFile(null); }} className="p-1 text-slate-400 hover:text-rose-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500">Click to select a file (PDF, video, image, etc.)</p>
                    <p className="text-xs text-slate-400 mt-1">Max 10 MB</p>
                  </>
                )}
                <input id="fileInput" type="file" className="hidden" onChange={handleFileChange} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">File Type</label>
              <select
                value={resourceFileType}
                onChange={e => setResourceFileType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all"
              >
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="link">Link (will be stored as a URL)</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => goToCourseDetail(selectedCourseId)} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={resourceSubmitting} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 disabled:opacity-70 flex items-center justify-center gap-2">
              {resourceSubmitting ? <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div> : <Upload className="h-5 w-5" />}
              {resourceSubmitting ? 'Uploading...' : 'Upload Resource'}
            </button>
          </div>
        </form>
      </motion.div>
    );
  };

  // ========== Pending / Suspended screens ==========
  if (tutorStatus === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Pending</h2>
          <p className="text-slate-600 mb-8">
            Your tutor application is currently under review. You'll receive an email once your account is approved.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8">
            <p className="text-sm text-amber-800 font-medium">
              Estimated review time: 2-3 business days
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }
  if (tutorStatus === 'suspended') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Suspended</h2>
          <p className="text-slate-600 mb-8">
            Your account has been suspended. Please contact the administrator for more information.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="w-full bg-rose-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
          >
            Contact Support
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ========== Main Layout (with sidebar, header, footer) ==========
  const navLinks = [
    { name: 'Dashboard', icon: Layout, view: 'dashboard', isActive: activeView === 'dashboard' },
    { name: 'My Courses', icon: FolderOpen, view: 'courses', isActive: activeView === 'courses' },
    { name: 'Schedule', icon: CalendarIcon, view: 'schedule', isActive: activeView === 'schedule' },
    { name: 'Create Course', icon: Plus, view: 'create-course', isActive: activeView === 'create-course' },
    { name: 'Messages', icon: MessageSquare, view: 'messages', isActive: activeView === 'messages', badge: unreadMessages },
    { name: 'Announcements', icon: Bell, view: 'announcements', isActive: activeView === 'announcements' },
    { name: 'Resources', icon: FileText, view: 'resources', isActive: false },
    { name: 'Discussions', icon: MessageSquare, view: 'discussions', isActive: activeView === 'discussions' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <Link to="/tutor-dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-white tracking-tight">Smart<span className="text-indigo-400">Kuppi</span></span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Tutor Portal</span>
              </div>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X className="h-6 w-6" /></button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <p className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tutor Menu</p>
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  if (link.view === 'dashboard') goToDashboard();
                  else if (link.view === 'courses') goToMyCourses();
                  else if (link.view === 'schedule') goToSchedule();
                  else if (link.view === 'create-course') goToCreateCourse();
                  else if (link.view === 'messages') goToMessages();
                  else if (link.view === 'resources') goToResources();
                  else if (link.view === 'discussions') goToDiscussions();
                  else if (link.view === 'announcements') goToAnnouncements();
                }}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all text-left ${
                  link.isActive ? 'bg-indigo-600/10 text-indigo-600 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </div>
                {link.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">{link.badge}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all">
              <LogOut className="h-5 w-5" /><span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600">
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="relative">
              <button 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-3 p-1.5 hover:bg-slate-100 rounded-xl"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  {tutor ? getInitials(tutor.name) : 'T'}
                </div>
                <span className="hidden md:block text-sm font-medium text-slate-700">{tutor?.name || 'Tutor'}</span>
                <Settings className="h-4 w-4 text-slate-400" />
              </button>
              <AnimatePresence>
                {profileDropdown && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-50"><p className="text-sm font-semibold text-slate-800">{tutor?.name}</p><p className="text-xs text-slate-500">{tutor?.email}</p></div>
                    <div className="p-1"><button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl"><Users className="h-4 w-4" /><span>My Profile</span></button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl"><Settings className="h-4 w-4" /><span>Account Settings</span></button></div>
                    <div className="p-1 border-t border-slate-50"><button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl"><LogOut className="h-4 w-4" /><span>Sign Out</span></button></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && <div key="dashboard">{renderDashboard()}</div>}
            {activeView === 'courses' && <div key="courses">{renderMyCourses()}</div>}
            {activeView === 'create-course' && <div key="create-course">{renderCreateCourse()}</div>}
            {activeView === 'schedule' && <div key="schedule">{renderSchedule()}</div>}
            {activeView === 'messages' && <div key="messages">{renderMessages()}</div>}
            {activeView === 'announcements' && (
            <div key="announcements">
              <AnnouncementManager 
                pageTitle="Module Announcements"
                pageDescription="Post updates to students enrolled in your courses."
                announcements={announcements}
                loading={announcementsLoading}
                allowCreate={true}
                allowCommon={false} 
                courseOptions={courses}
                currentUserId={tutor?.id || tutor?._id}
                currentUserRole={tutor?.role} // ADDED THIS
                onBack={goToDashboard}
                onRefresh={fetchAnnouncements}
                onCreateAnnouncement={handleCreateAnnouncement}
                onUpdateAnnouncement={handleUpdateAnnouncement} // ADDED THIS
                onDeleteAnnouncement={handleDeleteAnnouncement}
              />
            </div>
          )}
            {activeView === 'courseDetail' && <div key="courseDetail">{renderCourseDetail()}</div>}
            {activeView === 'lessonCreate' && <div key="lessonCreate">{renderLessonCreate()}</div>}
            {activeView === 'resourceUpload' && <div key="resourceUpload">{renderResourceUpload()}</div>}
            {activeView === 'resources' && <div key="resources">{renderResources()}</div>}
            {activeView === 'discussions' && <div key="discussions">{renderDiscussions()}</div>}
          </AnimatePresence>
        </main>

        <footer className="bg-white border-t border-slate-100 py-6 px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2"><BookOpen className="h-5 w-5 text-indigo-500" /><span className="font-bold text-slate-900">Smart<span className="text-indigo-500">Kuppi</span></span><span className="text-xs text-slate-400 ml-2">© 2024 Tutor Portal v1.2</span></div>
            <div className="flex items-center space-x-6 text-xs font-bold text-slate-400 uppercase tracking-widest"><button className="hover:text-indigo-500">Tutor Guide</button><button className="hover:text-indigo-500">Support</button><button className="hover:text-indigo-500">Privacy</button></div>
          </div>
        </footer>
      </div>
      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={tutor}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default TutorDashboard;