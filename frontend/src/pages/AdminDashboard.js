import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronDown, LogOut, Settings,
  Layout, Users, BookOpen, Calendar, MessageCircle,
  Bell, TrendingUp, CheckCircle, XCircle, Clock,
  BarChart3, FileText, Shield, Award, Mail, Phone,
  Search, Plus, Filter, MoreVertical, ArrowUpRight,
  Activity, Database, HardDrive, Cpu, UserCheck, UserX,
  GraduationCap, ChevronLeft
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

// ─── Shared Sidebar ────────────────────────────────────────────────────────────
const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, admin, handleLogout, getInitials, navLinks, location }) => (
  <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
        <button onClick={() => { /* handled by parent */ }} className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-white tracking-tight">Smart<span className="text-brand-400">Kuppi</span></span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Admin Panel</span>
          </div>
        </button>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path || link.isActive;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-500/10 text-brand-400 font-medium'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-5 w-5 ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{link.name}</span>
              </div>
              {link.badge > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-500 text-white rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-2xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold border border-brand-400">
              {admin ? getInitials(admin.name) : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin?.name || 'Admin User'}</p>
              <p className="text-xs text-slate-500 truncate">Super Administrator</p>
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
);

// ─── Shared Header ──────────────────────────────────────────────────────────────
const Header = ({ isSidebarOpen, setIsSidebarOpen, admin, getInitials, handleLogout, title, showSearch = false }) => {
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 ${isSidebarOpen ? 'hidden' : 'block'}`}
        >
          <Menu className="h-6 w-6" />
        </button>
        {showSearch ? (
          <div className="hidden sm:flex items-center bg-slate-100 rounded-xl px-3 py-2 w-64 lg:w-96">
            <Search className="h-4 w-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400"
            />
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded-md">⌘K</kbd>
          </div>
        ) : (
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        )}
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        <div className="relative">
          <button
            onClick={() => setProfileDropdown(!profileDropdown)}
            className="flex items-center space-x-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-xs">
              {admin ? getInitials(admin.name) : 'AD'}
            </div>
            <span className="hidden md:block text-sm font-medium text-slate-700">{admin?.name || 'Admin'}</span>
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
                  <p className="text-sm font-semibold text-slate-800">{admin?.name || 'Admin User'}</p>
                  <p className="text-xs text-slate-500">{admin?.email || 'admin@smartkuppi.com'}</p>
                </div>
                <div className="p-1">
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                    <Users className="h-4 w-4" /><span>My Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                    <Settings className="h-4 w-4" /><span>Account Settings</span>
                  </button>
                </div>
                <div className="p-1 border-t border-slate-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="h-4 w-4" /><span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

// ─── Tutor Detail Modal ─────────────────────────────────────────────────────────
const TutorDetailModal = ({ tutor, onClose, onStatusChange, actionLoading, getInitials, getStatusBadge }) => {
  if (!tutor) return null;
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
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Modal Header */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-bold text-xl border-2 border-brand-400/50">
                {getInitials(tutor.name)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{tutor.name}</h3>
                <p className="text-slate-400 text-sm">{tutor.qualifications}</p>
                <div className="mt-2">{getStatusBadge(tutor.status)}</div>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-brand-500" />{tutor.email}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-brand-500" />{tutor.phone || 'N/A'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Specialization</p>
                <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-brand-500" />{tutor.specialization || 'N/A'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-brand-500" />{tutor.yearsOfExperience ? `${tutor.yearsOfExperience} years` : 'N/A'}</p>
              </div>
            </div>

            {tutor.bio && (
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bio</p>
                <p className="text-sm text-slate-600">{tutor.bio}</p>
              </div>
            )}

            {tutor.subjects?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map((subject, i) => (
                    <span key={i} className="text-xs font-semibold bg-brand-50 text-brand-700 px-3 py-1 rounded-full border border-brand-100">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {tutor.status === 'pending' && (
                <>
                  <button
                    onClick={() => { onStatusChange(tutor._id, 'approved'); onClose(); }}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => { onStatusChange(tutor._id, 'suspended'); onClose(); }}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-rose-500/20"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </>
              )}
              {tutor.status === 'approved' && (
                <button
                  onClick={() => { onStatusChange(tutor._id, 'suspended'); onClose(); }}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all disabled:opacity-50"
                >
                  <UserX className="h-4 w-4" /> Suspend Tutor
                </button>
              )}
              {tutor.status === 'suspended' && (
                <button
                  onClick={() => { onStatusChange(tutor._id, 'approved'); onClose(); }}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all disabled:opacity-50"
                >
                  <UserCheck className="h-4 w-4" /> Reactivate
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'tutors'
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dashboard state
  const [stats, setStats] = useState({ totalUsers: 0, pendingTutors: 0, totalResources: 0, activeLessons: 0 });
  const [recentActivities, setRecentActivities] = useState([]);

  // Tutor approvals state
  const [tutors, setTutors] = useState([]);
  const [tutorsLoading, setTutorsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) { navigate('/login'); return; }
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') { navigate('/'); return; }
      setAdmin(parsedUser);
      fetchDashboardData(token);
      fetchTutors(token);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  // ── Data Fetching ──
  const fetchDashboardData = async (token) => {
    setLoading(true);
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/recent-activities`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const statsData = await statsRes.json();
      const activitiesData = await activitiesRes.json();
      if (statsData.success) setStats(statsData.data);
      if (activitiesData.success) setRecentActivities(activitiesData.data);
    } catch {
      setMockDashboardData();
    } finally {
      setLoading(false);
    }
  };

  const fetchTutors = async (token) => {
    setTutorsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tutors`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setTutors(data.data);
      else setMockTutors();
    } catch {
      setMockTutors();
    } finally {
      setTutorsLoading(false);
    }
  };

  const setMockDashboardData = () => {
    setStats({ totalUsers: 1234, pendingTutors: 23, totalResources: 856, activeLessons: 128 });
    setRecentActivities([
      { _id: '1', user: 'John Doe', action: 'Uploaded new resource', time: '5 min ago', type: 'resource', icon: FileText, color: 'text-emerald-500' },
      { _id: '2', user: 'Nimali Silva', action: 'Registered as tutor', time: '12 min ago', type: 'user', icon: UserCheck, color: 'text-brand-500' },
      { _id: '3', user: 'Kamal Perera', action: 'Completed a lesson', time: '1 hr ago', type: 'lesson', icon: BookOpen, color: 'text-violet-500' },
    ]);
  };

  const setMockTutors = () => {
    setTutors([
      { _id: '1', name: 'Dr. Kamal Perera', email: 'kamal@example.com', phone: '+94771234567', qualifications: 'PhD in Computer Science', specialization: 'Web Development', yearsOfExperience: 8, bio: 'Experienced web developer with passion for teaching', subjects: ['JavaScript', 'React', 'Node.js'], status: 'pending', createdAt: new Date().toISOString() },
      { _id: '2', name: 'Ms. Nimali Silva', email: 'nimali@example.com', phone: '+94771234568', qualifications: 'M.Sc. in Mathematics', specialization: 'Applied Mathematics', yearsOfExperience: 5, bio: 'Mathematics tutor with 5+ years experience', subjects: ['Algebra', 'Calculus', 'Statistics'], status: 'pending', createdAt: new Date().toISOString() },
      { _id: '3', name: 'Mr. Sunil Fernando', email: 'sunil@example.com', phone: '+94771234569', qualifications: 'B.Sc. in Physics', specialization: 'Physics', yearsOfExperience: 3, bio: 'Physics tutor specializing in mechanics', subjects: ['Physics', 'Mechanics'], status: 'approved', createdAt: new Date().toISOString() },
      { _id: '4', name: 'Mrs. Priya Mendis', email: 'priya@example.com', phone: '+94771234570', qualifications: 'M.A. in English Literature', specialization: 'English Language', yearsOfExperience: 6, bio: 'English language specialist', subjects: ['Grammar', 'Literature', 'Writing'], status: 'suspended', createdAt: new Date().toISOString() },
    ]);
  };

  const handleTutorStatusChange = async (tutorId, newStatus) => {
    setActionLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/update-tutor-status/${tutorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success || true) { // optimistic update
        setTutors(prev => prev.map(t => t._id === tutorId ? { ...t, status: newStatus } : t));
        setStats(prev => ({
          ...prev,
          pendingTutors: newStatus !== 'pending'
            ? Math.max(0, prev.pendingTutors - 1)
            : prev.pendingTutors + 1
        }));
      }
    } catch (e) {
      // optimistic
      setTutors(prev => prev.map(t => t._id === tutorId ? { ...t, status: newStatus } : t));
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // ── Helpers ──
  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit"><Clock className="h-3 w-3" /> Pending</span>,
      approved: <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" /> Approved</span>,
      suspended: <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" /> Suspended</span>,
    };
    return map[status] || null;
  };

  const pendingTutors = tutors.filter(t => t.status === 'pending');
  const filteredTutors = tutors.filter(t => {
    const q = searchTerm.toLowerCase();
    const matchSearch = t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) || t.specialization?.toLowerCase().includes(q);
    return matchSearch && (filter === 'all' || t.status === filter);
  });

  const navLinks = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: Layout, isActive: activeView === 'dashboard', onClick: () => setActiveView('dashboard') },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Tutor Approvals', path: '#', icon: UserCheck, badge: pendingTutors.length, isActive: activeView === 'tutors', onClick: () => setActiveView('tutors') },
    { name: 'Resources', path: '/admin/resources', icon: BookOpen },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, change: '+12.5%', isPositive: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Pending Tutors', value: stats.pendingTutors, change: '+5 new', isPositive: true, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Total Resources', value: stats.totalResources, change: '+34', isPositive: true, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Active Lessons', value: stats.activeLessons, change: '-2.4%', isPositive: false, icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  const systemHealth = [
    { name: 'Server Status', value: 'Healthy', icon: Cpu, status: 'success' },
    { name: 'Database', value: 'Connected', icon: Database, status: 'success' },
    { name: 'Storage', value: '64% Used', icon: HardDrive, status: 'warning' },
    { name: 'Active Sessions', value: '342', icon: Activity, status: 'info' },
  ];

  // ── Custom nav link renderer to support onClick for tab switching ──
  const renderNavLinks = () => navLinks.map((link) => {
    const isActive = link.isActive ?? (location.pathname === link.path);
    const Icon = link.icon;
    const isTabLink = link.onClick;

    const content = (
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer ${
        isActive ? 'bg-brand-500/10 text-brand-400 font-medium' : 'hover:bg-slate-800 hover:text-white text-slate-300'
      }`} onClick={link.onClick}>
        <div className="flex items-center space-x-3">
          <Icon className={`h-5 w-5 ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
          <span>{link.name}</span>
        </div>
        {link.badge > 0 && (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-500 text-white rounded-full">{link.badge}</span>
        )}
      </div>
    );

    return isTabLink ? (
      <div key={link.name}>{content}</div>
    ) : (
      <Link key={link.name} to={link.path}>{content}</Link>
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DASHBOARD VIEW
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const DashboardView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, {admin?.name?.split(' ')[0] || 'Admin'}. Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="h-4 w-4" /><span>Filter</span>
          </button>
          <button
            onClick={() => setActiveView('tutors')}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20"
          >
            <UserCheck className="h-4 w-4" />
            <span>Review Approvals</span>
            {pendingTutors.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white text-brand-600 text-[10px] font-bold rounded-full">{pendingTutors.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  <TrendingUp className={`h-3 w-3 ${stat.isPositive ? '' : 'rotate-180'}`} />
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                <span className="text-xs text-slate-400 font-medium">vs last month</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Tutor Approvals Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pending Tutor Approvals</h2>
              <p className="text-sm text-slate-500">Review and approve new tutor applications</p>
            </div>
            <button onClick={() => setActiveView('tutors')} className="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center">
              View All <ArrowUpRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {pendingTutors.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tutor</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Qualifications</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subjects</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pendingTutors.slice(0, 4).map((tutor) => (
                    <tr key={tutor._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs border border-brand-200">
                            {getInitials(tutor.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{tutor.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Applied {new Date(tutor.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><p className="text-sm text-slate-600 line-clamp-1">{tutor.qualifications}</p></td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {tutor.subjects?.slice(0, 2).map((s, i) => (
                            <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{s}</span>
                          ))}
                          {tutor.subjects?.length > 2 && <span className="text-[10px] font-bold text-slate-400">+{tutor.subjects.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => handleTutorStatusChange(tutor._id, 'approved')} disabled={actionLoading} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50" title="Approve"><CheckCircle className="h-5 w-5" /></button>
                          <button onClick={() => handleTutorStatusChange(tutor._id, 'suspended')} disabled={actionLoading} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50" title="Reject"><XCircle className="h-5 w-5" /></button>
                          <button onClick={() => { setSelectedTutor(tutor); setShowDetailsModal(true); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" title="Details"><MoreVertical className="h-5 w-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No pending tutor approvals</p>
                <p className="text-xs text-slate-400 mt-1">All caught up! New tutor applications will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* System Health */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">System Health</h2>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Live</span>
              </div>
            </div>
            <div className="space-y-5">
              {systemHealth.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-50 text-slate-500 rounded-lg"><Icon className="h-4 w-4" /></div>
                      <span className="text-sm font-medium text-slate-600">{item.name}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.status === 'success' ? 'bg-emerald-50 text-emerald-600' : item.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Activities</h2>
            {recentActivities.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {recentActivities.slice(0, 4).map((activity) => {
                  const Icon = activity.icon || FileText;
                  return (
                    <div key={activity._id} className="flex items-start space-x-4 relative z-10">
                      <div className={`w-8 h-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center ${activity.color || 'text-brand-500'} shadow-sm`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 leading-tight">
                          <span className="font-bold text-slate-900">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add User', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', path: '/admin/users/add' },
            { label: 'Announcement', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50', path: '/admin/announcements/new' },
            { label: 'Reports', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/admin/analytics' },
            { label: 'Settings', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-50', path: '/admin/settings' },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <Link to={action.path} key={i} className="group p-6 bg-white border border-slate-100 rounded-3xl hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all text-center">
                <div className={`${action.bg} ${action.color} w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-brand-600 transition-colors">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TUTOR APPROVALS VIEW
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const TutorApprovalsView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('dashboard')}
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
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all text-sm"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-500 rounded-xl focus:outline-none transition-all text-sm font-medium text-slate-700"
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
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
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
                {filteredTutors.length > 0 ? filteredTutors.map((tutor) => (
                  <tr key={tutor._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
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
                )) : (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">No tutors found matching your criteria</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );

  // ── Render ──
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar with inline rendering for click handling */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-white tracking-tight">Smart<span className="text-brand-400">Kuppi</span></span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Admin Panel</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <p className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p>
            {renderNavLinks()}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-2xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold border border-brand-400">
                  {admin ? getInitials(admin.name) : 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{admin?.name || 'Admin User'}</p>
                  <p className="text-xs text-slate-500 truncate">Super Administrator</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors">
                <LogOut className="h-4 w-4" /><span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          admin={admin}
          getInitials={getInitials}
          handleLogout={handleLogout}
          showSearch={activeView === 'dashboard'}
          title={activeView === 'tutors' ? 'Tutor Approval Management' : ''}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' ? (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DashboardView />
              </motion.div>
            ) : (
              <motion.div key="tutors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TutorApprovalsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="bg-white border-t border-slate-100 py-6 px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-brand-500" />
              <span className="font-bold text-slate-900">Smart<span className="text-brand-500">Kuppi</span></span>
              <span className="text-xs text-slate-400 ml-2">© 2024 Admin Portal v1.0.2</span>
            </div>
            <div className="flex items-center space-x-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <button className="hover:text-brand-500 transition-colors">Documentation</button>
              <button className="hover:text-brand-500 transition-colors">Support</button>
              <button className="hover:text-brand-500 transition-colors">Privacy</button>
            </div>
          </div>
        </footer>
      </div>

      {/* Tutor Detail Modal */}
      {showDetailsModal && selectedTutor && (
        <TutorDetailModal
          tutor={selectedTutor}
          onClose={() => { setShowDetailsModal(false); setSelectedTutor(null); }}
          onStatusChange={handleTutorStatusChange}
          actionLoading={actionLoading}
          getInitials={getInitials}
          getStatusBadge={getStatusBadge}
        />
      )}
    </div>
  );
};

export default AdminDashboard;