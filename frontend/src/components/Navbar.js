import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, Settings, Layout } from 'lucide-react';
// Import your logo
import yourLogo from '../assets/images/logo2.png';  // Adjust path as needed

const Navbar = () => {
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
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo with your image */}
          <Link to="/" className="flex items-center space-x-3 group">
            {/* Your Logo Image */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <img 
                src={yourLogo} 
                alt="SmartKuppi Logo" 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Text Logo - Optional: Remove if your logo already has text */}
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="font-bold text-2xl text-gray-800">Smart<span className="text-blue-600">Kuppi</span></span>
              </div>
              <span className="text-xs text-gray-500 -mt-1">Learn • Share • Grow</span>
            </div>
          </Link>

          {/* Rest of your navbar code remains exactly the same... */}
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
  );
};

export default Navbar;