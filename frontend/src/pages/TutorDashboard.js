import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Layout, Users, BookOpen, Calendar, 
  Bell, Clock, BarChart3, 
  Plus, ArrowUpRight, 
  Video, MessageSquare, DollarSign, 
  Settings, LogOut, Menu, X, FileText,
  Search, Star, AlertCircle
} from 'lucide-react';

const TutorDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Mock tutor status (approved, pending, suspended)
  const [tutorStatus] = useState('approved'); // Simplified type

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const stats = [
    { title: 'Total Students', value: '156', change: '+12 this month', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Lessons', value: '8', change: 'This week', icon: Video, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Resources', value: '45', change: '+5 new', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Rating', value: '4.8', change: '⭐ 4.8/5', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const upcomingLessons = [
    { id: 1, title: 'Advanced JavaScript', student: 'John Doe', date: '2024-01-20', time: '10:00 AM', students: 12, status: 'confirmed' },
    { id: 2, title: 'React Hooks Workshop', student: 'Sarah Smith', date: '2024-01-21', time: '2:00 PM', students: 8, status: 'confirmed' },
    { id: 3, title: 'Database Design', student: 'Mike Johnson', date: '2024-01-22', time: '11:00 AM', students: 15, status: 'pending' },
  ];

  const recentResources = [
    { id: 1, title: 'JavaScript Cheat Sheet.pdf', type: 'PDF', downloads: 45, uploaded: '2 days ago' },
    { id: 2, title: 'React Component Patterns', type: 'Video', downloads: 32, uploaded: '3 days ago' },
    { id: 3, title: 'Database Normalization Notes', type: 'PDF', downloads: 28, uploaded: '5 days ago' },
  ];

  const studentFeedback = [
    { id: 1, student: 'Amal Perera', rating: 5, comment: 'Great explanation! Very helpful.', date: 'Yesterday' },
    { id: 2, student: 'Nimali Silva', rating: 4, comment: 'Good session, but could be more interactive.', date: '2 days ago' },
    { id: 3, student: 'Kasun Fernando', rating: 5, comment: 'Best tutor I\'ve had!', date: '3 days ago' },
  ];

  // If tutor status is pending
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

  // If tutor status is suspended
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

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <Link to="/tutor-dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl text-white">Smart<span className="text-brand-400">Kuppi</span></span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <Link to="/tutor-dashboard" className="flex items-center space-x-3 px-4 py-3 bg-brand-500/10 text-brand-400 rounded-xl font-medium">
              <Layout className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/tutor/lessons" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
              <Video className="h-5 w-5" />
              <span>My Lessons</span>
            </Link>
            <Link to="/tutor/students" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
              <Users className="h-5 w-5" />
              <span>My Students</span>
            </Link>
            <Link to="/tutor/resources" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
              <FileText className="h-5 w-5" />
              <span>Resources</span>
            </Link>
            <Link to="/tutor/earnings" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
              <DollarSign className="h-5 w-5" />
              <span>Earnings</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all">
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600">
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-4 py-2 w-64 lg:w-96">
              <Search className="h-4 w-4 text-slate-400 mr-2" />
              <input type="text" placeholder="Search students, lessons..." className="bg-transparent border-none focus:ring-0 text-sm w-full" />
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded-md">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl relative transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">Dr. Kamal Perera</p>
                <p className="text-xs text-slate-500">Verified Tutor</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold">
                KP
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col">
            <div className="flex-1 p-4 sm:p-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto space-y-8"
              >
                {/* Header Section - FIXED: Using standard Tailwind gradient classes */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                          Tutor Premium
                        </span>
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live Status: Active</span>
                      </div>
                      <h2 className="text-3xl font-bold tracking-tight">Good Morning, Kamal! 👋</h2>
                      <p className="text-indigo-100 mt-2 max-w-md font-medium opacity-90">You have 2 lessons scheduled for today. Your average rating is 4.9/5.0. Keep up the great work!</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-500/20 group">
                        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                        <span>Schedule Lesson</span>
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="absolute bottom-0 right-10 opacity-10 pointer-events-none">
                    <BookOpen className="w-64 h-64" />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            {stat.change}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Upcoming Lessons */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        <h3 className="font-bold text-slate-900">Upcoming Lessons</h3>
                      </div>
                      <button className="text-indigo-600 text-sm font-bold hover:underline">View Full Schedule</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {upcomingLessons.map((lesson) => (
                        <div key={lesson.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              {lesson.student.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-bold text-slate-900 text-lg">{lesson.title}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                  lesson.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                  {lesson.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 mt-0.5">
                                Student: <span className="font-medium text-slate-700">{lesson.student}</span> • {lesson.students} enrolled
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">{lesson.time}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{lesson.date}</p>
                            <button className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10">
                              Join Session
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student Feedback */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center space-x-2 mb-6">
                      <Star className="h-5 w-5 text-amber-400 fill-current" />
                      <h3 className="font-bold text-slate-900">Student Feedback</h3>
                    </div>
                    <div className="space-y-6">
                      {studentFeedback.map((feedback) => (
                        <div key={feedback.id} className="space-y-2 group">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{feedback.student}</span>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < feedback.rating ? 'fill-current' : 'text-slate-200'}`} />
                              ))}
                            </div>
                          </div>
                          <div className="relative">
                            <p className="text-sm text-slate-600 italic leading-relaxed pl-4 border-l-2 border-slate-100 group-hover:border-indigo-200 transition-colors">
                              "{feedback.comment}"
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-1">{feedback.date}</p>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-6 py-3 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                      View All Feedback
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Resources */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Recent Resources</h3>
                      <button className="text-indigo-600 text-sm font-bold">View All</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {recentResources.map((resource) => (
                        <div key={resource.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{resource.title}</p>
                              <p className="text-[10px] text-slate-500">{resource.downloads} downloads • {resource.uploaded}</p>
                            </div>
                          </div>
                          <button className="text-xs font-bold text-indigo-600">View</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 p-6 rounded-3xl text-white flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                          <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold">Messages</h4>
                          <p className="text-xs text-slate-400">3 unread messages</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                          <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Analytics</h4>
                          <p className="text-xs text-slate-500">View performance</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl group-hover:scale-110 transition-transform">
                          <Settings className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Settings</h4>
                          <p className="text-xs text-slate-500">Manage profile</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="bg-indigo-600 p-6 rounded-3xl text-white flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/10 rounded-2xl text-white group-hover:scale-110 transition-transform">
                          <Plus className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold">New Resource</h4>
                          <p className="text-xs text-indigo-100">Upload materials</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-indigo-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-6 px-8 mt-8 flex-shrink-0">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-brand-500" />
                  <span className="font-bold text-slate-900">Smart<span className="text-brand-500">Kuppi</span></span>
                  <span className="text-xs text-slate-400 ml-2">© 2024 Tutor Portal v1.0.2</span>
                </div>
                <div className="flex items-center space-x-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <button className="hover:text-brand-500 transition-colors cursor-pointer">Tutor Guide</button>
                  <button className="hover:text-brand-500 transition-colors cursor-pointer">Support</button>
                  <button className="hover:text-brand-500 transition-colors cursor-pointer">Privacy</button>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TutorDashboard;