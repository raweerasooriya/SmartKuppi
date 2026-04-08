// src/pages/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { 
  Layout, BookOpen, Calendar as CalendarIcon, Bell, Search, ChevronRight, GraduationCap, 
  Clock, Award, PlayCircle, Download, Heart, MessageCircle, 
  TrendingUp, ArrowUpRight, Users, Compass, ChevronLeft,
  Video, FileText, MessageSquare, User, ThumbsUp, Send,
  Loader, AlertCircle, CheckCircle, Filter, ExternalLink, Star,
  ArrowRight, LogOut, Menu, X, ChevronDown, Settings
} from 'lucide-react';
import CourseCardHeader from '../components/CourseCardHeader';
import MessageThread from '../components/MessageThread';

const API_BASE_URL = 'http://localhost:5000/api';

const StudentDashboard = () => {
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // App State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, myCourses, browse, schedule, discussions, courseDetail
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Dashboard data
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedLessons: 0,
    resources: 0,
    achievementPoints: 0,
    learningStreak: 0
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

  // Course detail data
  const [courseDetail, setCourseDetail] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState('lessons');
  const [conversation, setConversation] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Browse courses data
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [showEnrollSuccess, setShowEnrollSuccess] = useState(null);

  // Schedule data
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lessonsForSchedule, setLessonsForSchedule] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [scheduleView, setScheduleView] = useState('calendar');
  const [filterCourse, setFilterCourse] = useState('all');
  const [coursesForFilter, setCoursesForFilter] = useState([]);

  // Discussions data
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);        // stores discussion id being replied to
  const [replyContent, setReplyContent] = useState('');

  const navigate = useNavigate();

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchDashboardData(parsedUser.id, token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Fetch dashboard data
  const fetchDashboardData = async (userId, token) => {
    setLoading(true);
    try {
      const coursesRes = await fetch(`${API_BASE_URL}/enrollments/students/${userId}/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        setEnrolledCourses(coursesData.data);
        setStats(prev => ({ ...prev, enrolledCourses: coursesData.data.length }));
      }
      setTimeout(() => {
        setStats(prev => ({
          ...prev,
          completedLessons: 18,
          resources: 42,
          achievementPoints: 320,
          learningStreak: 12
        }));
        setUpcomingLessons([
          { id: 1, title: 'React Hooks Workshop', tutor: 'Ms. Nimali Silva', time: 'Today 2:00 PM', duration: '1.5 hours', subject: 'React.js', meetingLink: 'https://meet.google.com/xxx' }
        ]);
        setRecommendedResources([
          { id: 1, title: 'JS Interview Questions', type: 'PDF', author: 'Tech Community', likes: 234, downloads: 1200 }
        ]);
        setActivityFeed([
          { id: 1, type: 'resource', message: 'New resource: "React Hooks Guide"', time: '10m ago', icon: BookOpen, color: 'text-blue-500' }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setMockData();
      setLoading(false);
    }
  };

  const setMockData = () => {
    setStats({
      enrolledCourses: 3,
      completedLessons: 18,
      resources: 42,
      achievementPoints: 320,
      learningStreak: 12
    });
    setEnrolledCourses([
      { _id: '1', title: 'Advanced JavaScript', tutor: { name: 'Dr. Kamal Perera' }, progress: 65, nextLesson: 'Closures & Scope', time: 'Tomorrow 10:00 AM', image: null, description: 'Master modern JavaScript' },
      { _id: '2', title: 'React Masterclass', tutor: { name: 'Ms. Nimali Silva' }, progress: 40, nextLesson: 'Hooks Deep Dive', time: 'Today 2:00 PM', image: null, description: 'Learn React from basics to advanced' }
    ]);
    setUpcomingLessons([
      { id: 1, title: 'React Hooks Workshop', tutor: 'Ms. Nimali Silva', time: 'Today 2:00 PM', duration: '1.5 hours', subject: 'React.js', meetingLink: 'https://meet.google.com/xxx' }
    ]);
    setRecommendedResources([
      { id: 1, title: 'JS Interview Questions', type: 'PDF', author: 'Tech Community', likes: 234, downloads: 1200 }
    ]);
    setActivityFeed([
      { id: 1, type: 'resource', message: 'New resource: "React Hooks Guide"', time: '10m ago', icon: BookOpen, color: 'text-blue-500' }
    ]);
  };

  const getFirstName = () => {
    if (!user || !user.name) return 'Student';
    return user.name.split(' ')[0];
  };

  const getInitials = () => {
    if (!user || !user.name) return 'ST';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatStudentId = () => {
    if (!user) return '#STU001';
    return user.studentId ? `#${user.studentId}` : '#STU001';
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Navigation functions
  const goToDashboard = () => {
    setActiveView('dashboard');
    setSelectedCourseId(null);
  };
  const goToMyCourses = () => {
    setActiveView('myCourses');
  };
  const goToBrowse = () => {
    setActiveView('browse');
    fetchCourses();
    fetchEnrolledCoursesForBrowse();
  };
  const goToSchedule = () => {
    setActiveView('schedule');
    fetchScheduleData();
  };
  const goToDiscussions = () => {
    setActiveView('discussions');
    fetchDiscussions();
  };
  const goToCourseDetail = (courseId) => {
    setSelectedCourseId(courseId);
    setActiveView('courseDetail');
    fetchCourseDetail(courseId);
  };

  // Browse courses functions
  const fetchCourses = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.data);
        setFilteredCourses(data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchEnrolledCoursesForBrowse = async () => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user'));
    try {
      const res = await fetch(`${API_BASE_URL}/enrollments/students/${userData.id}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEnrolledCourseIds(data.data.map(c => c._id));
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/enrollments/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setEnrolledCourseIds([...enrolledCourseIds, courseId]);
        setShowEnrollSuccess(courseId);
        setTimeout(() => setShowEnrollSuccess(null), 3000);
      } else {
        alert(data.message || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Network error. Please try again.');
    } finally {
      setEnrollingId(null);
    }
  };

  useEffect(() => {
    if (activeView === 'browse') {
      let filtered = courses;
      if (searchTerm) {
        filtered = filtered.filter(course =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (subjectFilter !== 'all') {
        filtered = filtered.filter(course => course.subject === subjectFilter);
      }
      setFilteredCourses(filtered);
    }
  }, [searchTerm, subjectFilter, courses, activeView]);

  // Course detail functions
  const fetchCourseDetail = async (courseId) => {
    const token = localStorage.getItem('token');
    try {
      const courseRes = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const courseData = await courseRes.json();
      if (courseData.success) setCourseDetail(courseData.data);
      else throw new Error('Course not found');

      const lessonsRes = await fetch(`${API_BASE_URL}/lessons/courses/${courseId}/lessons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const lessonsData = await lessonsRes.json();
      if (lessonsData.success) setLessons(lessonsData.data);

      const resourcesRes = await fetch(`${API_BASE_URL}/resources/courses/${courseId}/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resourcesData = await resourcesRes.json();
      if (resourcesData.success) setResources(resourcesData.data);
    } catch (error) {
      console.error('Error fetching course detail:', error);
    }
  };

  const fetchConversation = async () => {
    if (!courseDetail) return;
    setLoadingMessages(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/messages?course=${courseDetail._id}&user=${courseDetail.tutor._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConversation({
          otherUser: courseDetail.tutor,
          course: courseDetail,
          messages: data.data
        });
      } else {
        setConversation({
          otherUser: courseDetail.tutor,
          course: courseDetail,
          messages: []
        });
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleMessageSent = () => {
    fetchConversation();
  };

  useEffect(() => {
    if (activeView === 'courseDetail' && courseDetail && activeTab === 'message') {
      fetchConversation();
    }
  }, [courseDetail, activeTab, activeView]);

  // Schedule functions
  const fetchScheduleData = async () => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user'));
    try {
      const coursesRes = await fetch(`${API_BASE_URL}/enrollments/students/${userData.id}/courses`, {
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
              tutor: course.tutor?.name || 'Unknown Tutor'
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
        date: new Date().toISOString(),
        duration: 60,
        meetingLink: 'https://meet.google.com/xxx-xxxx-xxx',
        courseTitle: 'Advanced JavaScript',
        courseId: '1',
        tutor: 'Dr. Kamal Perera'
      }
    ];
    setLessonsForSchedule(mockLessons);
    filterLessonsByDate(mockLessons);
    setCoursesForFilter([{ _id: '1', title: 'Advanced JavaScript' }]);
  };

  useEffect(() => {
    if (activeView === 'schedule') {
      filterLessonsByDate();
    }
  }, [selectedDate, filterCourse, lessonsForSchedule, activeView]);

  const tileContent = ({ date, view }) => {
    if (view === 'month' && lessonsForSchedule) {
      const hasLesson = lessonsForSchedule.some(lesson => isSameDay(parseISO(lesson.date), date));
      if (hasLesson) {
        return <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mx-auto mt-1"></div>;
      }
    }
    return null;
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) return;
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
  if (!replyContent.trim()) return;
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
        // Update the discussion in the local state
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

  // Render functions for each view
  const renderDashboardContent = () => {
    const statCards = [
      { title: 'Enrolled Courses', value: stats.enrolledCourses, change: '+2 this sem', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
      { title: 'Completed Lessons', value: stats.completedLessons, change: `${Math.round((stats.completedLessons / 40) * 100)}% complete`, icon: PlayCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { title: 'Resources', value: stats.resources, change: '+12 new', icon: Download, color: 'text-violet-600', bg: 'bg-violet-50' },
      { title: 'Achievement Points', value: stats.achievementPoints, change: 'Top 15%', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {getFirstName()}! 👋</h1>
            <p className="text-indigo-100 mt-2 max-w-md">You have {upcomingLessons.length} lessons scheduled for today. Your learning streak is {stats.learningStreak} days! Keep it up.</p>
            <div className="flex items-center space-x-4 mt-6">
              <button className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50">Continue Learning</button>
              <button className="px-6 py-2.5 bg-indigo-500/20 text-white border border-white/20 rounded-xl font-bold text-sm hover:bg-indigo-500/30">View Schedule</button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 right-10 opacity-10"><GraduationCap className="w-64 h-64" /></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}><Icon className="h-6 w-6" /></div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.change}</span>
                </div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">My Courses</h2>
              <button onClick={goToMyCourses} className="text-indigo-600 text-sm font-bold flex items-center">View All <ArrowUpRight className="h-4 w-4 ml-1" /></button>
            </div>
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {enrolledCourses.slice(0, 2).map((course) => (
                  <div key={course._id} className="block cursor-pointer" onClick={() => goToCourseDetail(course._id)}>
                    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group border-b-4 border-b-indigo-600">
                      <CourseCardHeader course={course} height="h-40" />
                      <div className="p-6">
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{course.title}</h3>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-400"><span>Progress</span><span>{course.progress || 0}%</span></div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${course.progress || 0}%` }} className="h-full bg-indigo-600 rounded-full"></motion.div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider"><Clock className="h-3 w-3 mr-1 text-indigo-600" /><span>Next: {course.nextLesson || 'No upcoming'}</span></div>
                          <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center">
                <p className="text-slate-500">You haven't enrolled in any courses yet.</p>
                <button onClick={goToBrowse} className="inline-block mt-4 text-indigo-600 font-bold hover:underline">Browse Available Courses</button>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Learning Streak */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-slate-900">Learning Streak 🔥</h2><span className="text-indigo-600 font-bold text-sm">{stats.learningStreak} Days</span></div>
              <div className="flex items-end justify-between h-24 gap-2">
                {[40, 70, 45, 90, 65, 30, 80].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} className={`w-full rounded-t-lg ${i === 6 ? 'bg-indigo-600' : 'bg-slate-100'}`}></motion.div>
                    <span className="text-[10px] font-bold text-slate-400">{['M','T','W','T','F','S','S'][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Today's Schedule</h2>
              {upcomingLessons.length > 0 ? (
                <div className="space-y-4">
                  {upcomingLessons.map((lesson) => (
                    <div key={lesson.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors group">
                      <div className="flex items-start justify-between">
                        <div><span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">{lesson.subject}</span><h3 className="font-bold text-slate-900 mt-1 group-hover:text-indigo-600">{lesson.title}</h3><p className="text-xs text-slate-500 mt-1">with {lesson.tutor}</p></div>
                        <div className="p-2 bg-white text-slate-400 rounded-xl shadow-sm"><CalendarIcon className="h-4 w-4" /></div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center text-xs font-bold text-slate-500"><Clock className="h-3 w-3 mr-1 text-indigo-600" />{lesson.time}</div>
                        <button className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700">Join</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-500 text-center py-4">No lessons scheduled for today</p>}
            </div>

            {/* Recommended Resources */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Recommended</h2>
              {recommendedResources.length > 0 ? (
                <div className="space-y-4">
                  {recommendedResources.map((res) => (
                    <div key={res.id} className="flex items-center justify-between group">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600"><BookOpen className="h-4 w-4" /></div>
                        <div><p className="text-sm font-bold text-slate-900 leading-tight">{res.title}</p><div className="flex items-center space-x-2 mt-1"><span className="text-[10px] font-bold text-slate-400 uppercase">{res.type}</span><span className="text-[10px] text-slate-300">•</span><span className="flex items-center text-[10px] text-slate-400 font-bold"><Heart className="h-2.5 w-2.5 mr-0.5 text-rose-400" /> {res.likes}</span></div></div>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Download className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-500 text-center py-4">No recommendations yet</p>}
              <button className="w-full mt-6 py-2.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 border border-slate-100">Explore Library</button>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
            {activityFeed.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {activityFeed.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div key={act.id} className="flex items-start space-x-4 relative z-10">
                      <div className={`w-10 h-10 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center ${act.color} shadow-sm`}><Icon className="h-5 w-5" /></div>
                      <div className="flex-1 min-w-0"><p className="text-sm text-slate-700 font-medium">{act.message}</p><p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{act.time}</p></div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-slate-500 text-center py-8">No recent activity</p>}
          </div>

          {/* Support Card */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold">Need Help?</h3>
              <p className="text-slate-400 text-sm mt-2">Our support team and tutors are here to help you 24/7.</p>
              <div className="mt-8 space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors text-left"><div className="flex items-center space-x-3"><MessageCircle className="h-4 w-4 text-indigo-400" /><span className="text-sm font-medium">Chat with Support</span></div><ChevronRight className="h-4 w-4 text-slate-500" /></button>
                <button className="w-full flex items-center justify-between p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors text-left"><div className="flex items-center space-x-3"><Users className="h-4 w-4 text-emerald-400" /><span className="text-sm font-medium">Study Groups</span></div><ChevronRight className="h-4 w-4 text-slate-500" /></button>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-10"><TrendingUp className="w-48 h-48" /></div>
          </div>
        </div>
      </div>
    );
  };

  const renderMyCourses = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={goToDashboard} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Courses</h1>
          <p className="text-slate-500 mt-1">Continue your learning journey</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Courses</p>
          <p className="text-2xl font-bold text-slate-900">{enrolledCourses.length}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Progress</p>
          <p className="text-2xl font-bold text-emerald-600">
            {Math.round(enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / (enrolledCourses.length || 1))}%
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Completed Lessons</p>
          <p className="text-2xl font-bold text-blue-600">
            {enrolledCourses.reduce((acc, c) => acc + (c.completedLessons || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Learning Streak</p>
          <p className="text-2xl font-bold text-amber-600">12 days</p>
        </div>
      </div>

      {/* Courses Grid */}
      {enrolledCourses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
          <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
          <p className="text-slate-500">You haven't enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <div key={course._id} className="block cursor-pointer" onClick={() => goToCourseDetail(course._id)}>
              <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                <CourseCardHeader course={course} height="h-48" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs text-slate-600">4.8</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                      <span>Progress</span>
                      <span className="text-indigo-600">{course.progress || 0}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${course.progress || 0}%` }} className="h-full bg-indigo-600 rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{course.completedLessons || 0}/{course.totalLessons || 20} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{course.nextLesson || 'No upcoming'}</span>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 hover:bg-indigo-600 hover:text-white transition-all group/btn">
                    <span>Continue Learning</span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBrowseCourses = () => {
    const subjects = [
      'All', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
      'Computer Science', 'Programming', 'Web Development',
      'Database Systems', 'Networking', 'English Literature',
      'Economics', 'Business Studies', 'Accounting'
    ];
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={goToDashboard} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Browse Courses</h1>
            <p className="text-slate-500 mt-1">Discover and enroll in courses that interest you.</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl focus:outline-none transition-all text-sm"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex items-center bg-slate-50 rounded-2xl px-3 border-2 border-transparent">
                <Filter className="h-4 w-4 text-slate-400 mr-2" />
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="bg-transparent py-3 text-sm font-medium text-slate-700 focus:outline-none"
                >
                  {subjects.map(sub => (
                    <option key={sub} value={sub === 'All' ? 'all' : sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
            <GraduationCap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-500">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const isEnrolled = enrolledCourseIds.includes(course._id);
              const isEnrolling = enrollingId === course._id;
              const showSuccess = showEnrollSuccess === course._id;

              return (
                <div key={course._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  <CourseCardHeader course={course} height="h-48">
                    {course.price > 0 ? (
                      <span className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                        LKR {course.price}
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                        Free
                      </span>
                    )}
                  </CourseCardHeader>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                        {course.subject}
                      </span>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs text-slate-600">4.8</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                      {course.description}
                    </p>
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
                    <div className="flex items-center gap-3">
                      {isEnrolled ? (
                        <button
                          onClick={() => goToCourseDetail(course._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Go to Course
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course._id)}
                          disabled={isEnrolling}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all disabled:opacity-70"
                        >
                          {isEnrolling ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                          {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                        </button>
                      )}
                      {showSuccess && (
                        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
                          <CheckCircle className="h-4 w-4" />
                          Enrolled successfully!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderSchedule = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={goToDashboard} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Schedule</h1>
          <p className="text-slate-500 mt-1">View all your upcoming lessons and classes</p>
        </div>
        <div className="ml-auto flex gap-3">
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
        </div>
      </div>

      {/* Stats */}
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
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Completed</p>
          <p className="text-2xl font-bold text-slate-500">
            {lessonsForSchedule.filter(l => new Date(l.date) < new Date()).length}
          </p>
        </div>
      </div>

      {/* Filter */}
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
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              className="w-full border-none"
            />
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
              {filteredLessons.length > 0 ? (
                filteredLessons.map(lesson => (
                  <div key={lesson._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-1">{lesson.title}</h4>
                    <p className="text-xs text-slate-500 mb-2">{lesson.courseTitle}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(lesson.date)}</span>
                      <span>•</span>
                      <span>{lesson.duration} min</span>
                    </div>
                    {lesson.meetingLink && (
                      <a href={lesson.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
                        Join Session <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No lessons scheduled for this day</p>
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
            {lessonsForSchedule.filter(l => new Date(l.date) >= new Date()).length === 0 ? (
              <div className="p-12 text-center">
                <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No upcoming lessons scheduled</p>
              </div>
            ) : (
              lessonsForSchedule
                .filter(l => new Date(l.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(lesson => (
                  <div key={lesson._id} className="p-6 hover:bg-slate-50 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Video className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{lesson.title}</h3>
                          <p className="text-sm text-slate-500">{lesson.courseTitle}</p>
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
                          </div>
                        </div>
                      </div>
                      {lesson.meetingLink && (
                        <a href={lesson.meetingLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                          Join Session
                        </a>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderDiscussions = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={goToDashboard} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
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
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" /> {discussion.author?.name || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {new Date(discussion.createdAt).toLocaleDateString()}
                    </span>
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
                      <MessageCircle className="h-4 w-4" /> {discussion.replies?.length || 0} replies
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

  const renderCourseDetail = () => {
    if (!courseDetail) return <div>Loading course details...</div>;
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={goToDashboard} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{courseDetail.title}</h1>
            <p className="text-slate-500 mt-1">Instructor: {courseDetail.tutor?.name || 'Unknown'}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <p className="text-slate-600">{courseDetail.description}</p>
          </div>
          <div className="border-b border-slate-100">
            <div className="flex gap-2 p-2">
              {['lessons', 'resources', 'message'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {tab === 'lessons' && <><Video className="h-4 w-4 inline mr-2" />Lessons ({lessons.length})</>}
                  {tab === 'resources' && <><FileText className="h-4 w-4 inline mr-2" />Resources ({resources.length})</>}
                  {tab === 'message' && <><MessageSquare className="h-4 w-4 inline mr-2" />Message Tutor</>}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <div className="space-y-4">
                {lessons.length > 0 ? lessons.map(lesson => (
                  <div key={lesson._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900">{lesson.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {new Date(lesson.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(lesson.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.duration} min</span>
                        </div>
                      </div>
                      {lesson.meetingLink && new Date(lesson.date) > new Date() && (
                        <a href={lesson.meetingLink} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all">Join Session</a>
                      )}
                    </div>
                  </div>
                )) : <p className="text-slate-500 text-center py-4">No lessons scheduled yet.</p>}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-4">
                {resources.length > 0 ? resources.map(res => (
                  <div key={res._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{res.title}</h4>
                      <p className="text-xs text-slate-500">{res.fileType?.toUpperCase() || 'FILE'} • {res.downloads} downloads</p>
                    </div>
                    <a href={`${API_BASE_URL}${res.fileUrl}`} download className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors">
                      <Download className="h-5 w-5" />
                    </a>
                  </div>
                )) : <p className="text-slate-500 text-center py-4">No resources yet.</p>}
              </div>
            )}

            {/* Message Tab */}
            {activeTab === 'message' && (
              <div className="min-h-[500px]">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <MessageThread 
                    conversation={conversation || {
                      otherUser: courseDetail.tutor,
                      course: courseDetail,
                      messages: []
                    }}
                    onMessageSent={handleMessageSent}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Determine main content
  let mainContent;
  switch (activeView) {
    case 'myCourses':
      mainContent = renderMyCourses();
      break;
    case 'browse':
      mainContent = renderBrowseCourses();
      break;
    case 'schedule':
      mainContent = renderSchedule();
      break;
    case 'discussions':
      mainContent = renderDiscussions();
      break;
    case 'courseDetail':
      mainContent = renderCourseDetail();
      break;
    default:
      mainContent = renderDashboardContent();
  }

  // Sidebar navigation links
  const navLinks = [
    { name: 'Dashboard', view: 'dashboard', icon: Layout },
    { name: 'My Courses', view: 'myCourses', icon: BookOpen },
    { name: 'Browse Courses', view: 'browse', icon: Compass },
    { name: 'Schedule', view: 'schedule', icon: CalendarIcon },
    { name: 'Discussions', view: 'discussions', icon: MessageCircle },
  ];

  // Get page title based on active view
  const getPageTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'myCourses': return 'My Courses';
      case 'browse': return 'Browse Courses';
      case 'schedule': return 'Schedule';
      case 'discussions': return 'Discussions';
      case 'courseDetail': return courseDetail?.title || 'Course Details';
      default: return 'Dashboard';
    }
  };

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

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white mr-3">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-white tracking-tight">Smart<span className="text-indigo-400">Kuppi</span></span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Learning Hub</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white ml-auto">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student Menu</p>
            {navLinks.map((link) => {
              const isActive = activeView === link.view;
              const Icon = link.icon;
              return (
                <button
                  key={link.name}
                  onClick={() => {
                    if (link.view === 'dashboard') goToDashboard();
                    else if (link.view === 'myCourses') goToMyCourses();
                    else if (link.view === 'browse') goToBrowse();
                    else if (link.view === 'schedule') goToSchedule();
                    else if (link.view === 'discussions') goToDiscussions();
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-indigo-600/10 text-indigo-400 font-medium' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span>{link.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-2xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold border border-indigo-400">
                  {getInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name || 'Student User'}</p>
                  <p className="text-xs text-slate-500 truncate">Student ID: {formatStudentId()}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 ${isSidebarOpen ? 'hidden' : 'block'}`}>
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl relative transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="relative">
              <button 
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center space-x-3 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  {getInitials()}
                </div>
                <span className="hidden md:block text-sm font-medium text-slate-700">{user.name || 'Student'}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${profileDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-sm font-semibold text-slate-800">{user.name || 'Student User'}</p>
                      <p className="text-xs text-slate-500">{user.email || 'student@example.com'}</p>
                    </div>
                    <div className="p-1">
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                        <Settings className="h-4 w-4" />
                        <span>Account Settings</span>
                      </button>
                    </div>
                    <div className="p-1 border-t border-slate-50">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {mainContent}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-100 py-6 px-8 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              <span className="font-bold text-slate-900">Smart<span className="text-indigo-500">Kuppi</span></span>
              <span className="text-xs text-slate-400 ml-2">© 2024 Student Portal v1.0.5</span>
            </div>
            <div className="flex items-center space-x-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <button className="hover:text-indigo-500 transition-colors">Help Center</button>
              <button className="hover:text-indigo-500 transition-colors">Tutor Support</button>
              <button className="hover:text-indigo-500 transition-colors">Terms</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StudentDashboard;