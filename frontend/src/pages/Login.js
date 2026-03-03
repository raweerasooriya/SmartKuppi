import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, LogIn, Eye, EyeOff, 
  AlertCircle, ChevronRight, GraduationCap,
  ShieldCheck, UserCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/auth'; // Add this line

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showDemoLogins, setShowDemoLogins] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
    setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // Also store remember me preference if needed
        if (formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // Redirect based on role
        switch(data.user.role) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'tutor':
            navigate('/tutor-dashboard');
            break;
          case 'student':
            navigate('/student-dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        // Handle error message from backend
        setLoginError(data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error. Please check if backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: For demo purposes, you can still have quick fill buttons
  const fillDemoCredentials = async (role) => {
    // You can either use mock data or fetch from backend
    const demoCredentials = {
      admin: { email: 'admin@smartkuppi.com', password: 'admin123' },
      tutor: { email: 'tutor@example.com', password: 'tutor123' },
      student: { email: 'student@example.com', password: 'student123' }
    };
    
    setFormData({
      ...formData,
      email: demoCredentials[role].email,
      password: demoCredentials[role].password
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 overflow-hidden flex flex-col md:flex-row relative z-10 border border-white"
      >
        {/* Left Side - Visual/Branding */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-600 to-indigo-800 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <Link to="/" className="flex items-center space-x-3 mb-12">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight">Smart<span className="text-indigo-200">Kuppi</span></span>
            </Link>
            
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Empowering the next generation of learners.
            </h2>
            <p className="text-indigo-100 text-lg opacity-90">
              Access your personalized dashboard, connect with expert tutors, and track your progress in real-time.
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <div className="flex -space-x-3 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-500 flex items-center justify-center text-[10px] font-bold">
                +2k
              </div>
            </div>
            <p className="text-sm font-medium text-indigo-200">Joined by 2,000+ students this month</p>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-7/12 p-8 sm:p-12 bg-white flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10">
              <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome Back</h3>
              <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 ${
                      errors.email ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                    } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400`}
                    placeholder="name@example.com"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs font-bold text-rose-500 ml-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-12 py-4 bg-slate-50 border-2 ${
                      errors.password ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                    } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs font-bold text-rose-500 ml-1"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Remember Me */}
              <div className="flex items-center px-1">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded-md transition-all ${formData.rememberMe ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-400'}`}>
                      {formData.rememberMe && (
                        <svg className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                </label>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {loginError && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center space-x-3 text-rose-600"
                  >
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-bold">{loginError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
              >
                <div className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <LogIn className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-sm font-medium text-slate-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Create an account
                  </Link>
                </p>
              </div>
            </form>

            {/* Demo Credentials Section */}
            <div className="mt-10 pt-8 border-t border-slate-100">
              <button 
                onClick={() => setShowDemoLogins(!showDemoLogins)}
                className="w-full flex items-center justify-between text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="text-xs font-bold uppercase tracking-widest">Demo Credentials</span>
                <ChevronRight className={`h-4 w-4 transition-transform ${showDemoLogins ? 'rotate-90' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showDemoLogins && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-3 mt-4">
                      <button 
                        onClick={() => fillDemoCredentials('admin')}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <ShieldCheck className="h-4 w-4 text-indigo-600" />
                          <span className="text-xs font-bold text-slate-700">Admin Portal</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 uppercase">Quick Fill</span>
                      </button>
                      <button 
                        onClick={() => fillDemoCredentials('tutor')}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <UserCircle className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-700">Tutor Portal</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 uppercase">Quick Fill</span>
                      </button>
                      <button 
                        onClick={() => fillDemoCredentials('student')}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-bold text-slate-700">Student Portal</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 uppercase">Quick Fill</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;