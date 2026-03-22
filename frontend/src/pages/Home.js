import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Calendar, MessageCircle, Users, Star, TrendingUp, 
  Menu, X, ChevronDown, User, LogOut, Settings, Layout,
  Mail, Phone, Facebook, Twitter, Linkedin, Instagram,
  ArrowRight, Sparkles, ShieldCheck, Zap, PlayCircle, Download,
  GraduationCap
} from 'lucide-react';

// Import your images
import yourLogo from '../assets/images/logo2.png';
import heroImage from '../assets/images/hero-image.png';

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Simulate logged in state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('student');
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setUserRole(user.role);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    switch(userRole) {
      case 'admin': return '/admin-dashboard';
      case 'tutor': return '/tutor-dashboard';
      case 'student': return '/student-dashboard';
      default: return '/';
    }
  };

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Learning Resources",
      description: "Access a curated library of study materials, PDFs, and peer-shared links.",
      module: "Module 2",
      developedBy: "Oditha",
      color: "bg-blue-500"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Lesson Scheduling",
      description: "Seamlessly schedule and join live sessions with integrated video tools.",
      module: "Module 3",
      developedBy: "Subashanth",
      color: "bg-indigo-500"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Discussions",
      description: "Engage in meaningful academic dialogue and stay updated with announcements.",
      module: "Module 4",
      developedBy: "Dilhani",
      color: "bg-emerald-500"
    }
  ];

  const stats = [
    { icon: <Users className="h-5 w-5" />, value: "500+", label: "Active Students" },
    { icon: <BookOpen className="h-5 w-5" />, value: "1.2k+", label: "Resources" },
    { icon: <Zap className="h-5 w-5" />, value: "50+", label: "Weekly Classes" },
    { icon: <Star className="h-5 w-5" />, value: "4.9/5", label: "Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar - Simplified with no navigation links */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <img 
                  src={yourLogo} 
                  alt="SmartKuppi Logo" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="font-bold text-2xl text-gray-800">Smart<span className="text-blue-600">Kuppi</span></span>
                </div>
                <span className="text-xs text-gray-500 -mt-1">Learn • Share • Grow</span>
              </div>
            </Link>

            {/* Desktop Nav - Removed navigation links, only auth buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="flex items-center space-x-3 p-1.5 pr-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all group"
                  >
                    <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {userRole.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-slate-700">Account</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${profileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl shadow-indigo-200/50 py-3 border border-slate-100 overflow-hidden"
                      >
                        <div className="px-5 py-4 border-b border-slate-50 mb-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                          <p className="font-bold text-slate-900 truncate">User Account</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            {userRole}
                          </span>
                        </div>
                        
                        <Link to={getDashboardLink()} className="flex items-center space-x-3 px-5 py-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors font-medium">
                          <Layout className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link to="/profile" className="flex items-center space-x-3 px-5 py-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors font-medium">
                          <User className="h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                        <Link to="/settings" className="flex items-center space-x-3 px-5 py-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors font-medium">
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                        
                        <div className="mt-2 pt-2 border-t border-slate-50">
                          <button onClick={handleLogout} className="flex items-center space-x-3 px-5 py-2.5 text-rose-500 hover:bg-rose-50 w-full text-left transition-colors font-bold">
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 transition-all active:scale-95">
                    Join Now
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center space-x-4">
              {isLoggedIn && (
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  {userRole.charAt(0).toUpperCase()}
                </div>
              )}
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Menu - Simplified */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {isLoggedIn ? (
                  <div className="space-y-4">
                    <Link to={getDashboardLink()} className="block text-lg font-bold text-slate-700" onClick={() => setIsOpen(false)}>Dashboard</Link>
                    <button onClick={handleLogout} className="block text-lg font-bold text-rose-500">Sign Out</button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link to="/login" className="w-full py-3 text-center font-bold text-slate-700 bg-slate-100 rounded-2xl" onClick={() => setIsOpen(false)}>Sign In</Link>
                    <Link to="/register" className="w-full py-3 text-center font-bold text-white bg-indigo-600 rounded-2xl" onClick={() => setIsOpen(false)}>Join Now</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full mb-6">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">The Future of Peer Learning</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-8">
                  Master your studies with <span className="text-indigo-600">SmartKuppi</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-xl">
                  The central hub for university students to share resources, schedule classes, and grow together. Bridging the gap between peer learning and academic excellence.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 transition-all active:scale-95 flex items-center group">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                <div className="mt-12 flex items-center space-x-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <img key={i} src={`https://picsum.photos/seed/avatar${i}/100/100`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" referrerPolicy="no-referrer" />
                    ))}
                  </div>
                  <p className="text-sm font-bold text-slate-400">
                    Joined by <span className="text-slate-900">2,000+</span> students this month
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-white">
                  <img 
                    src={heroImage} 
                    alt="Student studying with laptop" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-indigo-900/10"></div>
                  
                  {/* Floating Card */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                          <PlayCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Now</p>
                          <h4 className="font-bold text-slate-900">Advanced JS Masterclass</h4>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-widest animate-pulse">
                        Live
                      </span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Background Blobs */}
                <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-indigo-100 rounded-full blur-3xl -z-10 opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-100 rounded-full blur-3xl -z-10 opacity-60"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-slate-50/50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-6">Everything you need to excel</h2>
              <p className="text-lg text-slate-500 font-medium">Built by students, for students. Our platform is divided into specialized modules to ensure the best learning experience.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  whileHover={{ y: -5 }}
                  className="group bg-slate-50 p-8 rounded-[2.5rem] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-200/30 transition-all duration-500"
                >
                  <div className="flex items-start space-x-6">
                    <div className={`${feature.color} p-4 rounded-2xl text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{feature.module}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">By {feature.developedBy}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{feature.title}</h3>
                      <p className="text-slate-500 font-medium leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 lg:py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30">
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to Start Learning?</h2>
                <p className="text-xl text-indigo-100 font-medium mb-10">Join thousands of students and tutors on SmartKuppi today.</p>
                <Link to="/register" className="inline-flex items-center px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg shadow-xl hover:bg-indigo-50 transition-all active:scale-95 group">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              {/* Decorative Circles */}
              <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-8">
              <Link to="/" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <span className="font-bold text-xl">Smart<span className="text-blue-400">Kuppi</span></span>
              </Link>
              <p className="text-slate-400 font-medium leading-relaxed">
                Bridging the gap between peer resource sharing and online class scheduling for university students.
              </p>
              <div className="flex space-x-4">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <a key={i} href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Quick Links</h3>
              <ul className="space-y-4 font-medium">
                <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Support</h3>
              <ul className="space-y-4 font-medium">
                <li><Link to="/faq" className="hover:text-indigo-400 transition-colors">FAQ</Link></li>
                <li><Link to="/help" className="hover:text-indigo-400 transition-colors">Help Center</Link></li>
                <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Contact Us</h3>
              <ul className="space-y-6 font-medium">
                <li className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-slate-300">support@smartkuppi.com</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-slate-300">+94 11 234 5678</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm font-medium text-slate-500">
              &copy; {new Date().getFullYear()} SmartKuppi. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
              <span>Presented by</span>
              <span className="text-slate-400">WD_81_3.2</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;