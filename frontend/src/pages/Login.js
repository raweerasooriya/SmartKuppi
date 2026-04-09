import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, LogIn, Eye, EyeOff, 
  AlertCircle, ChevronRight, GraduationCap, BookOpen,
  ShieldCheck, UserCircle, ArrowLeft, Key, CheckCircle, RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const Login = () => {
  const navigate = useNavigate();
  
  // UI Mode: 'login' or 'forgot'
  const [mode, setMode] = useState('login');
  // Forgot password sub-steps: 'email', 'otp', 'reset', 'success'
  const [forgotStep, setForgotStep] = useState('email');
  
  // Login Form State
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
  
  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  const [forgotError, setForgotError] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const passedCount = Object.values(checks).filter(Boolean).length;
    
    let score = 0;
    let text = '';
    let color = '';
    
    if (password.length === 0) {
      text = '';
      score = 0;
    } else if (passedCount <= 2) {
      score = 1;
      text = 'Weak';
      color = 'text-rose-500 bg-rose-50';
    } else if (passedCount === 3) {
      score = 2;
      text = 'Fair';
      color = 'text-amber-500 bg-amber-50';
    } else if (passedCount === 4) {
      score = 3;
      text = 'Good';
      color = 'text-blue-500 bg-blue-50';
    } else {
      score = 4;
      text = 'Strong';
      color = 'text-emerald-500 bg-emerald-50';
    }
    
    return { score, text, color, checks, passedCount };
  };
  
  const otpInputRefs = useRef([]);
  
  // Timer effect for OTP resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);
  
  // Auto-focus first OTP input when OTP step becomes active
  useEffect(() => {
    if (mode === 'forgot' && forgotStep === 'otp' && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [mode, forgotStep]);
  
  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Allow only digits
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(0, 1); // Take only first character
    setOtpDigits(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };
  
  const handleOtpKeyDown = (index, e) => {
    // Handle backspace: clear current and focus previous
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1].focus();
      }
    }
  };
  
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      // Focus last input
      otpInputRefs.current[5].focus();
    }
  };
  
  const getOtpCode = () => otpDigits.join('');
  
  const resetForgotState = () => {
    setForgotStep('email');
    setForgotEmail('');
    setOtpDigits(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setTimer(0);
  };
  
  // Forgot Password: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError('Please enter a valid email address');
      return;
    }
    
    setIsForgotLoading(true);
    setForgotError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await response.json();
      
      if (data.success) {
        setForgotStep('otp');
        setTimer(60);
      } else {
        setForgotError(data.message || 'Failed to send reset code');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setForgotError('Network error. Please try again.');
    } finally {
      setIsForgotLoading(false);
    }
  };
  
  // Forgot Password: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = getOtpCode();
    if (otpCode.length !== 6) {
      setForgotError('Please enter the complete 6-digit code');
      return;
    }
    
    setIsForgotLoading(true);
    setForgotError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: otpCode })
      });
      const data = await response.json();
      
      if (data.success) {
        setForgotStep('reset');
      } else {
        setForgotError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setForgotError('Failed to verify code. Please try again.');
    } finally {
      setIsForgotLoading(false);
    }
  };
  
  // Forgot Password: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Use the password strength checker
    const strength = checkPasswordStrength(newPassword);
    if (strength.passedCount < 3) {
      setForgotError('Password must be at least "Fair" strength (min 8 characters, include uppercase, lowercase, number, or special character)');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }
    
    setIsForgotLoading(true);
    setForgotError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: getOtpCode(), newPassword })
      });
      const data = await response.json();
      
      if (data.success) {
        setForgotStep('success');
      } else {
        setForgotError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setForgotError('Failed to reset password. Please try again.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setIsForgotLoading(true);
    setForgotError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await response.json();
      if (data.success) {
        setTimer(60);
      } else {
        setForgotError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
    } finally {
      setIsForgotLoading(false);
    }
  };
  
  // Switch back to login mode
  const handleBackToLogin = () => {
    setMode('login');
    resetForgotState();
  };
  
  // Login logic
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
      setErrors({ ...errors, [name]: null });
    }
    setLoginError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        if (formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
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
        setLoginError(data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error. Please check if backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fillDemoCredentials = (role) => {
    const demoCredentials = {
      admin: { email: 'admin@smartkuppi.com', password: 'Admin@123' },
      tutor: { email: 'tutor@example.com', password: 'tutor123' },
      student: { email: 'student@example.com', password: 'student123' }
    };
    setFormData({
      ...formData,
      email: demoCredentials[role].email,
      password: demoCredentials[role].password
    });
  };
  
  // Animation variants for step transitions
  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };
  
  // Right side content based on mode and forgotStep
  const renderRightContent = () => {
    // LOGIN MODE
    if (mode === 'login') {
      return (
        <>
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome Back</h3>
            <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest ml-1">Email Address</label>
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
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Password</label>
                <button 
                  type="button"
                  onClick={() => { setMode('forgot'); resetForgotState(); }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot Password?
                </button>
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
                    <button onClick={() => fillDemoCredentials('admin')} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group">
                      <div className="flex items-center space-x-3"><ShieldCheck className="h-4 w-4 text-indigo-600" /><span className="text-xs font-bold text-slate-700">Admin Portal</span></div>
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 uppercase">Quick Fill</span>
                    </button>
                    <button onClick={() => fillDemoCredentials('tutor')} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group">
                      <div className="flex items-center space-x-3"><UserCircle className="h-4 w-4 text-emerald-600" /><span className="text-xs font-bold text-slate-700">Tutor Portal</span></div>
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 uppercase">Quick Fill</span>
                    </button>
                    <button onClick={() => fillDemoCredentials('student')} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group">
                      <div className="flex items-center space-x-3"><GraduationCap className="h-4 w-4 text-blue-600" /><span className="text-xs font-bold text-slate-700">Student Portal</span></div>
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 uppercase">Quick Fill</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      );
    }
    
    // FORGOT PASSWORD MODE - Email Step
    if (forgotStep === 'email') {
      return (
        <>
          <div className="mb-8 text-center">
            <button onClick={handleBackToLogin} className="inline-flex items-center space-x-2 text-slate-400 hover:text-indigo-600 transition-colors mb-6 group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Login</span>
            </button>
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6">
              <Key className="h-8 w-8" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Forgot Password?</h3>
            <p className="text-slate-500 font-medium">No worries, we'll send you reset instructions.</p>
          </div>
          
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            {forgotError && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center space-x-3 text-rose-600">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-xs font-bold">{forgotError}</p>
              </div>
            )}
            <button type="submit" disabled={isForgotLoading} className="w-full relative py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70 group">
              <div className="flex items-center justify-center">
                {isForgotLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <>Send Reset Code <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" /></>}
              </div>
            </button>
          </form>
        </>
      );
    }
    
    // FORGOT PASSWORD MODE - OTP Step with 6-box input
    if (forgotStep === 'otp') {
      return (
        <>
          <div className="mb-8 text-center">
            <button onClick={handleBackToLogin} className="inline-flex items-center space-x-2 text-slate-400 hover:text-indigo-600 transition-colors mb-6 group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Login</span>
            </button>
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Verify Email</h3>
            <p className="text-slate-500 font-medium">We've sent a 6-digit code to {forgotEmail}</p>
          </div>
          
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest block text-center">Verification Code</label>
              {/* 6-box OTP Input */}
              <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 rounded-xl focus:outline-none transition-all text-slate-900"
                  />
                ))}
              </div>
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">Enter the 6-digit code sent to your email</p>
            </div>
            
            {forgotError && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center space-x-3 text-rose-600">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-xs font-bold">{forgotError}</p>
              </div>
            )}
            
            <button type="submit" disabled={isForgotLoading} className="w-full py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70">
              {isForgotLoading ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : "Verify Code"}
            </button>
            
            <div className="text-center">
              <button type="button" disabled={timer > 0} onClick={handleResendOtp} className={`text-sm font-bold transition-colors ${timer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-700'}`}>
                {timer > 0 ? `Resend code in ${timer}s` : "Didn't receive code? Resend"}
              </button>
            </div>
          </form>
        </>
      );
    }
    
    // FORGOT PASSWORD MODE - Reset Password Step
    if (forgotStep === 'reset') {
      return (
        <>
          <div className="mb-8 text-center">
            <button onClick={handleBackToLogin} className="inline-flex items-center space-x-2 text-slate-400 hover:text-indigo-600 transition-colors mb-6 group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Login</span>
            </button>
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6">
              <Lock className="h-8 w-8" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">New Password</h3>
            <p className="text-slate-500 font-medium">Please enter a strong new password.</p>
          </div>
          
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl focus:outline-none transition-all text-slate-900 font-medium"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600">
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* === INSERT PASSWORD STRENGTH INDICATOR HERE === */}
              {newPassword && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Password strength:</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${(() => {
                      const { text, color } = checkPasswordStrength(newPassword);
                      return color;
                    })()}`}>
                      {checkPasswordStrength(newPassword).text}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        checkPasswordStrength(newPassword).score === 1 ? 'w-1/4 bg-rose-500' :
                        checkPasswordStrength(newPassword).score === 2 ? 'w-2/4 bg-amber-500' :
                        checkPasswordStrength(newPassword).score === 3 ? 'w-3/4 bg-blue-500' :
                        checkPasswordStrength(newPassword).score === 4 ? 'w-full bg-emerald-500' : 'w-0'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-medium">
                    <div className={`flex items-center space-x-1 ${checkPasswordStrength(newPassword).checks.length ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <span>{checkPasswordStrength(newPassword).checks.length ? '✓' : '○'}</span>
                      <span>Min 8 characters</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${checkPasswordStrength(newPassword).checks.uppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <span>{checkPasswordStrength(newPassword).checks.uppercase ? '✓' : '○'}</span>
                      <span>Uppercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${checkPasswordStrength(newPassword).checks.lowercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <span>{checkPasswordStrength(newPassword).checks.lowercase ? '✓' : '○'}</span>
                      <span>Lowercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${checkPasswordStrength(newPassword).checks.number ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <span>{checkPasswordStrength(newPassword).checks.number ? '✓' : '○'}</span>
                      <span>Number</span>
                    </div>
                    <div className={`flex items-center space-x-1 col-span-2 ${checkPasswordStrength(newPassword).checks.special ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <span>{checkPasswordStrength(newPassword).checks.special ? '✓' : '○'}</span>
                      <span>Special character (!@#$%...)</span>
                    </div>
                  </div>
                </div>
              )}
              {/* === END INSERTION === */}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Confirm New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl focus:outline-none transition-all text-slate-900 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
            
            {forgotError && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center space-x-3 text-rose-600">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-xs font-bold">{forgotError}</p>
              </div>
            )}
            
            <button type="submit" disabled={isForgotLoading} className="w-full py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70">
              {isForgotLoading ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : "Reset Password"}
            </button>
          </form>
        </>
      );
    }
    
    // FORGOT PASSWORD MODE - Success Step
    if (forgotStep === 'success') {
      return (
        <div className="text-center space-y-8">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-100/50">
            <CheckCircle className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">All Set!</h3>
            <p className="text-slate-500 font-medium">Your password has been successfully reset.</p>
          </div>
          <button onClick={handleBackToLogin} className="w-full py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]">
            Continue to Login
          </button>
        </div>
      );
    }
    
    return null;
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
        {/* Left Side - Visual/Branding (unchanged) */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-600 to-indigo-800 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <Link to="/" className="flex items-center space-x-3 mb-12">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight">Smart<span className="text-indigo-200">Kuppi</span></span>
            </Link>
            <h2 className="text-4xl font-bold leading-tight mb-6">Empowering the next generation of learners.</h2>
            <p className="text-indigo-100 text-lg opacity-90">Access your personalized dashboard, connect with expert tutors, and track your progress in real-time.</p>
          </div>
          <div className="relative z-10 mt-12">
            <div className="flex -space-x-3 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-500 flex items-center justify-center text-[10px] font-bold">+2k</div>
            </div>
            <p className="text-sm font-medium text-indigo-200">Joined by 2,000+ students this month</p>
          </div>
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>
        </div>
        
        {/* Right Side - Dynamic Form (Login or Forgot Flow) */}
        <div className="md:w-7/12 p-8 sm:p-12 bg-white flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${mode}-${forgotStep}`}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                {renderRightContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;