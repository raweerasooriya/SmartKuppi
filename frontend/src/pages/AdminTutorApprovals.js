import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle, XCircle, Clock, 
  Search, Filter, MoreVertical, Mail,
  Phone, GraduationCap, BookOpen, Award,
  Shield, AlertCircle, ChevronRight, LogOut,
  Menu, X, Bell, Settings, UserCheck, UserX,
  ArrowUpRight, Layout, BarChart3, FileText, Activity
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminTutorApprovals = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        navigate('/');
        return;
      }
      setAdmin(parsedUser);
      fetchTutors(token);
    } catch (error) {
      console.error('Error:', error);
      navigate('/login');
    }
  }, [navigate]);

  const fetchTutors = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tutors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setTutors(data.data);
      } else {
        // Mock data for development
        setMockTutors();
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      setMockTutors();
    } finally {
      setLoading(false);
    }
  };

  const setMockTutors = () => {
    setTutors([
      {
        _id: '1',
        name: 'Dr. Kamal Perera',
        email: 'kamal@example.com',
        phone: '+94771234567',
        qualifications: 'PhD in Computer Science',
        specialization: 'Web Development',
        yearsOfExperience: 8,
        bio: 'Experienced web developer with passion for teaching',
        subjects: ['JavaScript', 'React', 'Node.js'],
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Ms. Nimali Silva',
        email: 'nimali@example.com',
        phone: '+94771234568',
        qualifications: 'M.Sc. in Mathematics',
        specialization: 'Applied Mathematics',
        yearsOfExperience: 5,
        bio: 'Mathematics tutor with 5+ years experience',
        subjects: ['Algebra', 'Calculus', 'Statistics'],
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'Mr. Sunil Fernando',
        email: 'sunil@example.com',
        phone: '+94771234569',
        qualifications: 'B.Sc. in Physics',
        specialization: 'Physics',
        yearsOfExperience: 3,
        bio: 'Physics tutor specializing in mechanics',
        subjects: ['Physics', 'Mechanics'],
        status: 'approved',
        createdAt: new Date().toISOString()
      }
    ]);
  };

  const handleStatusChange = async (tutorId, newStatus) => {
    setActionLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/update-tutor-status/${tutorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTutors(tutors.map(tutor => 
          tutor._id === tutorId ? { ...tutor, status: newStatus } : tutor
        ));
        if (selectedTutor) {
          setSelectedTutor({ ...selectedTutor, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating tutor:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit"><Clock className="h-3 w-3" /> Pending</span>;
      case 'approved':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" /> Approved</span>;
      case 'suspended':
        return <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" /> Suspended</span>;
      default:
        return null;
    }
  };

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && tutor.status === filter;
  });

  const navLinks = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: Layout },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { 
      name: 'Tutor Approvals', 
      path: '/admin/tutor-approvals', 
      icon: UserCheck, 
      badge: tutors.filter(t => t.status === 'pending').length 
    },
    { name: 'Resources', path: '/admin/resources', icon: BookOpen },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header - Fixed with brand-500 color like AdminDashboard */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
            <Link to="/admin-dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-white tracking-tight">Smart<span className="text-brand-400">Kuppi</span></span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Admin Panel</span>
              </div>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation - Updated with proper active states */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <p className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
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
                  {link.badge > 0 && link.name === 'Tutor Approvals' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-500 text-white rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer - Updated with brand colors */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header - Updated with profile dropdown like AdminDashboard */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600">
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="text-xl font-bold text-slate-900">Tutor Approval Management</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl relative transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200"></div>
            
            <div className="relative">
              <button 
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center space-x-3 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-xs">
                  {admin ? getInitials(admin.name) : 'A'}
                </div>
                <span className="hidden md:block text-sm font-medium text-slate-700">{admin?.name || 'Admin'}</span>
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
                        <Users className="h-4 w-4" />
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

        {/* Main Content Area - Rest of your code remains the same */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Total Tutors</p>
                <p className="text-3xl font-bold text-slate-900">{tutors.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Pending</p>
                <p className="text-3xl font-bold text-amber-600">{tutors.filter(t => t.status === 'pending').length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Approved</p>
                <p className="text-3xl font-bold text-emerald-600">{tutors.filter(t => t.status === 'approved').length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Suspended</p>
                <p className="text-3xl font-bold text-rose-600">{tutors.filter(t => t.status === 'suspended').length}</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tutors by name, email, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-600 rounded-xl focus:outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-600 rounded-xl focus:outline-none transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tutors Table - Rest of your table code remains the same */}
            {loading ? (
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
                      {filteredTutors.length > 0 ? (
                        filteredTutors.map((tutor) => (
                          <tr key={tutor._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                                  {getInitials(tutor.name)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{tutor.name}</p>
                                  <p className="text-[10px] text-slate-400">{tutor.qualifications}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs text-slate-600 flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {tutor.email}
                              </p>
                              <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" /> {tutor.phone}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-900 font-medium">{tutor.specialization}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tutor.subjects?.slice(0, 2).map((subject, i) => (
                                  <span key={i} className="text-[8px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                                    {subject}
                                  </span>
                                ))}
                                {tutor.subjects?.length > 2 && (
                                  <span className="text-[8px] text-slate-400">+{tutor.subjects.length - 2}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-900 font-bold">{tutor.yearsOfExperience} years</p>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(tutor.status)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {tutor.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusChange(tutor._id, 'approved')}
                                      disabled={actionLoading}
                                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Approve"
                                    >
                                      <CheckCircle className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(tutor._id, 'suspended')}
                                      disabled={actionLoading}
                                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                      title="Reject"
                                    >
                                      <XCircle className="h-5 w-5" />
                                    </button>
                                  </>
                                )}
                                {tutor.status === 'approved' && (
                                  <button
                                    onClick={() => handleStatusChange(tutor._id, 'suspended')}
                                    disabled={actionLoading}
                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Suspend"
                                  >
                                    <UserX className="h-5 w-5" />
                                  </button>
                                )}
                                {tutor.status === 'suspended' && (
                                  <button
                                    onClick={() => handleStatusChange(tutor._id, 'approved')}
                                    disabled={actionLoading}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Reactivate"
                                  >
                                    <UserCheck className="h-5 w-5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedTutor(tutor);
                                    setShowDetailsModal(true);
                                  }}
                                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <MoreVertical className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                            No tutors found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminTutorApprovals;