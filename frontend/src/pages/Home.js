import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Calendar, MessageCircle, Users, Star, TrendingUp, 
  Menu, X, ChevronDown, User, LogOut, Settings, Layout,
  Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram 
} from 'lucide-react';

// Import your images
import yourLogo from '../assets/images/logo2.png';
import heroImage from '../assets/images/hero-image.png';

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  
  // Simulate logged in state (replace with actual auth later)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userRole = 'student';
  
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Resources', path: '/resources' },
    { name: 'Lessons', path: '/lessons' },
    { name: 'Announcements', path: '/announcements' },
  ];

  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: "Learning Resources",
      description: "Access study materials, PDFs, and external links shared by tutors and peers.",
      module: "Module 2",
      developedBy: "Oditha"
    },
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: "Lesson Scheduling",
      description: "Schedule and join online classes with Zoom/Google Meet integration.",
      module: "Module 3",
      developedBy: "Subashanth"
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-blue-600" />,
      title: "Announcements & Discussions",
      description: "Stay updated with announcements and engage in lesson discussions.",
      module: "Module 4",
      developedBy: "Dilhani"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "User Management",
      description: "Secure role-based access for Students, Tutors, and Admins.",
      module: "Module 1",
      developedBy: "Rashaan"
    }
  ];

  const stats = [
    { icon: <Users />, value: "500+", label: "Active Students" },
    { icon: <BookOpen />, value: "1000+", label: "Learning Resources" },
    { icon: <Calendar />, value: "50+", label: "Weekly Lessons" },
    { icon: <Star />, value: "4.8/5", label: "Student Rating" }
  ];

  const trendingResources = [
    { title: "Advanced JavaScript Guide", type: "PDF", author: "Dr. Smith", rating: 4.9, likes: 234 },
    { title: "React Basics Tutorial", type: "Video", author: "Prof. Johnson", rating: 4.8, likes: 189 },
    { title: "Data Structures Notes", type: "PDF", author: "Dr. Williams", rating: 4.7, likes: 156 }
  ];

  const handleLogout = () => {
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo with your image */}
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
              
              {/* Conditional Rendering based on Login State */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full pl-3 pr-2 py-1 transition duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-semibold">
                      {userRole === 'admin' ? 'A' : userRole === 'tutor' ? 'T' : 'S'}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform duration-300 ${profileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="font-semibold text-gray-800">John Doe</p>
                        <p className="text-xs text-blue-600 mt-1 capitalize">{userRole}</p>
                      </div>
                      
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 transition"
                        onClick={() => setProfileDropdown(false)}
                      >
                        <Layout className="h-4 w-4 text-blue-600" />
                        <span>Dashboard</span>
                      </Link>
                      
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 transition"
                        onClick={() => setProfileDropdown(false)}
                      >
                        <User className="h-4 w-4 text-blue-600" />
                        <span>Profile</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 transition"
                        onClick={() => setProfileDropdown(false)}
                      >
                        <Settings className="h-4 w-4 text-blue-600" />
                        <span>Settings</span>
                      </Link>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 w-full text-left transition"
                        >
                          <LogOut className="h-4 w-4 text-red-600" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition duration-300 font-medium shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              {isLoggedIn && (
                <div className="mr-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-semibold">
                    {userRole === 'admin' ? 'A' : userRole === 'tutor' ? 'T' : 'S'}
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden pb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block py-2 text-gray-600 hover:text-blue-600 transition duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {isLoggedIn ? (
                <div className="mt-4 space-y-2">
                  <Link
                    to={getDashboardLink()}
                    className="block py-2 text-gray-600 hover:text-blue-600 transition duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block py-2 text-gray-600 hover:text-blue-600 transition duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block py-2 text-gray-600 hover:text-blue-600 transition duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-red-600 hover:text-red-700 transition duration-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 mt-4">
                  <Link
                    to="/login"
                    className="text-center text-gray-600 hover:text-blue-600 transition duration-300 font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section with Image */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Welcome to <span className="text-yellow-300">SmartKuppi</span>
                </h1>
                <p className="text-xl mb-8 text-blue-100">
                  Your centralized hub for resource sharing and online classes. 
                  Bridging the gap between peer learning and academic success.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl">
                    Get Started
                  </Link>
                  <Link to="/resources" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                    Explore Resources
                  </Link>
                </div>
              </div>
              
              {/* Hero Image */}
              <div className="hidden lg:block relative">
                <div className="relative rounded-lg overflow-hidden shadow-2xl">
                  <img 
                    src={heroImage} 
                    alt="SmartKuppi Platform"
                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400 rounded-full opacity-20"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center text-blue-600 mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Modules</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Built with four independent modules for efficient full-stack development
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-3">{feature.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-600 font-medium">{feature.module}</span>
                        <span className="text-gray-500">Developed by: {feature.developedBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Resources Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Trending Now 🔥</h2>
              <Link to="/resources" className="text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingResources.map((resource, index) => (
                <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full">
                      {resource.type}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-gray-600">{resource.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">by {resource.author}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                      <span>{resource.likes} likes</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students and tutors on SmartKuppi today.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
            >
              Sign Up Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <span className="font-bold text-xl">Smart<span className="text-blue-400">Kuppi</span></span>
              </Link>
              <p className="text-gray-400 text-sm">
                Bridging the gap between peer resource sharing and online class scheduling for university students.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/resources" className="text-gray-400 hover:text-blue-400 transition">Resources</Link></li>
                <li><Link to="/lessons" className="text-gray-400 hover:text-blue-400 transition">Lessons</Link></li>
                <li><Link to="/announcements" className="text-gray-400 hover:text-blue-400 transition">Announcements</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-blue-400 transition">About Us</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-gray-400 hover:text-blue-400 transition">FAQ</Link></li>
                <li><Link to="/help" className="text-gray-400 hover:text-blue-400 transition">Help Center</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-blue-400 transition">Contact Us</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-blue-400 transition">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">support@smartkuppi.com</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">+94 11 234 5678</span>
                </li>
                <li className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">Colombo, Sri Lanka</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} SmartKuppi. All rights reserved. | Presented by WD_81_3.2
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;