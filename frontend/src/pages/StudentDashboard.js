import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';  // Removed AnimatePresence
import { 
  Layout, BookOpen, Calendar, Bell, 
  Search, ChevronRight, GraduationCap, 
  Clock, Award, Book, PlayCircle, 
  LogOut, Menu, X,
  Download, Heart, MessageCircle, TrendingUp,
  ArrowUpRight, Users
} from 'lucide-react';  // Removed unused: CheckCircle2, Settings, Filter, MoreVertical

// Rest of your StudentDashboard component...
const StudentDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const stats = [
    { title: 'Enrolled Courses', value: '6', change: '+2 this sem', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Completed Lessons', value: '24', change: '68% complete', icon: PlayCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Resources', value: '156', change: '+12 new', icon: Download, color: 'text-violet-600', bg: 'bg-violet-50' },
    { title: 'Achievement Points', value: '450', change: 'Top 15%', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const enrolledCourses = [
    { id: 1, title: 'Advanced JavaScript', tutor: 'Dr. Kamal Perera', progress: 75, nextLesson: 'Closures & Scope', time: 'Tomorrow 10:00 AM', image: 'https://picsum.photos/seed/js/400/200' },
    { id: 2, title: 'React.js Masterclass', tutor: 'Ms. Nimali Silva', progress: 45, nextLesson: 'Hooks Deep Dive', time: 'Today 2:00 PM', image: 'https://picsum.photos/seed/react/400/200' },
    { id: 3, title: 'Python for Data Science', tutor: 'Mr. Sunil Fernando', progress: 30, nextLesson: 'Pandas Library', time: 'Wed 11:00 AM', image: 'https://picsum.photos/seed/python/400/200' },
    { id: 4, title: 'Database Management', tutor: 'Dr. Priyantha', progress: 90, nextLesson: 'Normalization', time: 'Thu 3:00 PM', image: 'https://picsum.photos/seed/db/400/200' },
  ];

  const recommendedResources = [
    { id: 1, title: 'JS Interview Questions', type: 'PDF', author: 'Tech Community', likes: 234, downloads: 1200 },
    { id: 2, title: 'React Project Structure', type: 'Article', author: 'Advanced Devs', likes: 156, downloads: 890 },
    { id: 3, title: 'Python Cheat Sheet', type: 'PDF', author: 'Code Masters', likes: 445, downloads: 2100 },
  ];

  const upcomingLessons = [
    { id: 1, title: 'React Hooks Workshop', tutor: 'Ms. Nimali Silva', time: 'Today 2:00 PM', duration: '1.5 hours', subject: 'React.js' },
    { id: 2, title: 'JS Advanced Concepts', tutor: 'Dr. Kamal Perera', time: 'Tomorrow 10:00 AM', duration: '2 hours', subject: 'JavaScript' },
  ];

  const activityFeed = [
    { id: 1, type: 'resource', message: 'New resource: "React Hooks Guide"', time: '10m ago', icon: BookOpen, color: 'text-blue-500' },
    { id: 2, type: 'lesson', message: 'Class reminder: JavaScript in 30m', time: '25m ago', icon: Calendar, color: 'text-emerald-500' },
    { id: 3, type: 'achievement', message: 'Earned "Quick Learner" badge!', time: '1h ago', icon: Award, color: 'text-amber-500' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <Link to="/student-dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-white tracking-tight">Smart<span className="text-brand-400">Kuppi</span></span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Learning Hub</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student Menu</p>
            <Link to="/student-dashboard" className="flex items-center space-x-3 px-3 py-2.5 bg-brand-500/10 text-brand-400 rounded-xl font-medium">
              <Layout className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/courses" className="flex items-center space-x-3 px-3 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
              <Book className="h-5 w-5" />
              <span>My Courses</span>
            </Link>
            <Link to="/schedule" className="flex items-center space-x-3 px-3 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
              <Calendar className="h-5 w-5" />
              <span>Schedule</span>
            </Link>
            <Link to="/resources" className="flex items-center space-x-3 px-3 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
              <BookOpen className="h-5 w-5" />
              <span>Resources</span>
            </Link>
            <Link to="/discussions" className="flex items-center space-x-3 px-3 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span>Discussions</span>
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

      {/* Main Content - Fixed Layout */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header - Fixed at top */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600">
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-4 py-2 w-64 lg:w-96">
              <Search className="h-4 w-4 text-slate-400 mr-2" />
              <input type="text" placeholder="Search courses, resources..." className="bg-transparent border-none focus:ring-0 text-sm w-full" />
            </div>
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
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">Amal Perera</p>
                <p className="text-xs text-slate-500">Student ID: #12345</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold">
                AP
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="flex flex-col min-h-full">
            {/* Main Content */}
            <div className="flex-1 p-4 sm:p-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto space-y-8"
              >
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
                  <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, Amal! 👋</h1>
                    <p className="text-indigo-100 mt-2 max-w-md">You have 2 lessons scheduled for today. Your learning streak is 15 days! Keep it up.</p>
                    <div className="flex items-center space-x-4 mt-6">
                      <button className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors cursor-pointer">
                        Continue Learning
                      </button>
                      <button className="px-6 py-2.5 bg-indigo-500/20 text-white border border-white/20 rounded-xl font-bold text-sm hover:bg-indigo-500/30 transition-colors cursor-pointer">
                        View Schedule
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="absolute bottom-0 right-10 opacity-10">
                    <GraduationCap className="w-64 h-64" />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
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
                  {/* My Courses */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-slate-900">My Courses</h2>
                      <Link to="/courses" className="text-brand-600 text-sm font-bold flex items-center">
                        View All <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {enrolledCourses.map((course) => (
                        <motion.div 
                          key={course.id}
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group border-b-4 border-b-brand-500"
                        >
                          <div className="relative h-40 overflow-hidden">
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-4 left-4">
                              <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-brand-500 px-2 py-1 rounded">
                                {course.tutor}
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-tight">{course.title}</h3>
                            <div className="mt-4 space-y-2">
                              <div className="flex justify-between text-xs font-bold text-slate-400">
                                <span>Progress</span>
                                <span>{course.progress}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${course.progress}%` }}
                                  className="h-full bg-brand-500 rounded-full"
                                ></motion.div>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                              <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                <Clock className="h-3 w-3 mr-1 text-brand-500" />
                                <span>Next: {course.time}</span>
                              </div>
                              <button className="p-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors">
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    {/* Learning Streak Widget */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Learning Streak 🔥</h2>
                        <span className="text-brand-600 font-bold text-sm">15 Days</span>
                      </div>
                      <div className="flex items-end justify-between h-24 gap-2">
                        {[40, 70, 45, 90, 65, 30, 80].map((height, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              className={`w-full rounded-t-lg ${i === 6 ? 'bg-brand-500' : 'bg-slate-100'}`}
                            ></motion.div>
                            <span className="text-[10px] font-bold text-slate-400">
                              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upcoming Lessons */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <h2 className="text-lg font-bold text-slate-900 mb-6">Today's Schedule</h2>
                      <div className="space-y-4">
                        {upcomingLessons.map((lesson) => (
                          <div key={lesson.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-200 transition-colors group">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                                  {lesson.subject}
                                </span>
                                <h3 className="font-bold text-slate-900 mt-1 group-hover:text-brand-600 transition-colors">{lesson.title}</h3>
                                <p className="text-xs text-slate-500 mt-1">with {lesson.tutor}</p>
                              </div>
                              <div className="p-2 bg-white text-slate-400 rounded-xl shadow-sm">
                                <Calendar className="h-4 w-4" />
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center text-xs font-bold text-slate-500">
                                <Clock className="h-3 w-3 mr-1 text-brand-500" />
                                {lesson.time}
                              </div>
                              <button className="px-3 py-1.5 bg-brand-600 text-white text-[10px] font-bold rounded-lg hover:bg-brand-700 transition-colors">
                                Join
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Resources */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <h2 className="text-lg font-bold text-slate-900 mb-6">Recommended</h2>
                      <div className="space-y-4">
                        {recommendedResources.map((resource) => (
                          <div key={resource.id} className="flex items-center justify-between group">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                <BookOpen className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 leading-tight">{resource.title}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">{resource.type}</span>
                                  <span className="text-[10px] text-slate-300">•</span>
                                  <span className="flex items-center text-[10px] text-slate-400 font-bold">
                                    <Heart className="h-2.5 w-2.5 mr-0.5 text-rose-400" /> {resource.likes}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-6 py-2.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                        Explore Library
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activity Feed Bento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
                    <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                      {activityFeed.map((activity) => {
                        const Icon = activity.icon;
                        return (
                          <div key={activity.id} className="flex items-start space-x-4 relative z-10">
                            <div className={`w-10 h-10 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center ${activity.color} shadow-sm`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-700 font-medium">{activity.message}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{activity.time}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Support Card */}
                  <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold">Need Help?</h3>
                      <p className="text-slate-400 text-sm mt-2">Our support team and tutors are here to help you 24/7.</p>
                      <div className="mt-8 space-y-3">
                        <button className="w-full flex items-center justify-between p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors text-left">
                          <div className="flex items-center space-x-3">
                            <MessageCircle className="h-4 w-4 text-brand-400" />
                            <span className="text-sm font-medium">Chat with Support</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors text-left">
                          <div className="flex items-center space-x-3">
                            <Users className="h-4 w-4 text-emerald-400" />
                            <span className="text-sm font-medium">Study Groups</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        </button>
                      </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 opacity-10">
                      <TrendingUp className="w-48 h-48" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer - Now properly positioned at the bottom */}
            <footer className="bg-white border-t border-slate-100 py-6 px-8 flex-shrink-0">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-brand-500" />
                  <span className="font-bold text-slate-900">Smart<span className="text-brand-500">Kuppi</span></span>
                  <span className="text-xs text-slate-400 ml-2">© 2024 Student Portal v1.0.5</span>
                </div>
                <div className="flex items-center space-x-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <button className="hover:text-brand-500 transition-colors">Help Center</button>
                  <button className="hover:text-brand-500 transition-colors">Tutor Support</button>
                  <button className="hover:text-brand-500 transition-colors">Terms</button>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;