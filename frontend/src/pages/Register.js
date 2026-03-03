import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Phone, BookOpen, GraduationCap, 
  Eye, EyeOff, AlertCircle, CheckCircle, 
  Briefcase, ChevronRight, ArrowLeft,
  Building2, School, Calendar, Globe,
  Award, Sparkles
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/auth'; // Your backend URL

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState('student'); // Removed TypeScript type
  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Student specific
    studentId: '',
    university: '',
    faculty: '',
    department: '',
    academicYear: '',
    
    // Tutor specific
    qualifications: '',
    specialization: '',
    yearsOfExperience: '',
    bio: '',
    linkedin: '',
    subjects: [] // Removed TypeScript annotation
  });
  
  const [errors, setErrors] = useState({}); // Removed TypeScript type
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const universities = [
    'Sri Lanka Institute of Information Technology - SLIIT',
    'University of Colombo',
    'University of Peradeniya',
    'University of Kelaniya',
    'University of Sri Jayewardenepura',
    'University of Moratuwa',
    'Open University of Sri Lanka',
    'Other'
  ];

  const faculties = [
    'Faculty of Computing',
    'School of Business',
    'Faculty of Engineering',
    'School of Architecture',
    'Faculty of Humanities & Sciences',
    'Faculty of Graduate Studies',
    'Other'
  ];

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'Programming', 'Database Systems',
    'Web Development', 'Networking', 'English',
    'Economics', 'Accounting'
  ];

  const validateForm = () => {
    const newErrors = {}; // Removed TypeScript type

    if (!formData.name) newErrors.name = 'Full name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }

    if (userType === 'student') {
      if (!formData.studentId) newErrors.studentId = 'Student ID is required';
      if (!formData.university) newErrors.university = 'University is required';
      if (!formData.faculty) newErrors.faculty = 'Faculty is required';
      if (!formData.academicYear) newErrors.academicYear = 'Academic year is required';
    }

    if (userType === 'tutor') {
      if (!formData.qualifications) newErrors.qualifications = 'Qualifications are required';
      if (!formData.specialization) newErrors.specialization = 'Specialization is required';
      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required';
      if (!formData.bio) newErrors.bio = 'Bio is required';
      if (formData.subjects.length === 0) newErrors.subjects = 'Select at least one subject';
    }

    if (!agreeTerms) newErrors.terms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => { // Removed TypeScript type
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleSubjectToggle = (subject) => { // Removed TypeScript type
    let updatedSubjects = [...formData.subjects];
    if (updatedSubjects.includes(subject)) {
      updatedSubjects = updatedSubjects.filter(s => s !== subject);
    } else {
      updatedSubjects.push(subject);
    }
    setFormData({
      ...formData,
      subjects: updatedSubjects
    });
    if (errors.subjects) {
      setErrors({ ...errors, subjects: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Determine which endpoint to use based on user type
      const endpoint = userType === 'student' 
        ? `${API_BASE_URL}/register/student`
        : `${API_BASE_URL}/register/tutor`;
      
      // Prepare the data based on user type
      let userData;
      
      if (userType === 'student') {
        userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          studentId: formData.studentId,
          university: formData.university,
          faculty: formData.faculty,
          department: formData.department,
          academicYear: formData.academicYear
        };
      } else {
        // Make sure yearsOfExperience is a number
        const yearsExp = parseInt(formData.yearsOfExperience) || 0;
        
        userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          qualifications: formData.qualifications,
          specialization: formData.specialization,
          yearsOfExperience: yearsExp,
          bio: formData.bio,
          linkedin: formData.linkedin || '',
          subjects: formData.subjects
        };
      }
      
      console.log('Sending data:', userData); // For debugging
      
      // Make the API call
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Registration successful
        setRegistrationSuccess(true);
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // Redirect based on user type
        if (userType === 'student') {
          setTimeout(() => navigate('/student-dashboard'), 2000);
        } else {
          setTimeout(() => navigate('/login', { 
            state: { message: 'Application submitted! Awaiting admin approval.' }
          }), 3000);
        }
      } else {
        // Handle validation errors from backend
        if (data.errors) {
          // Format validation errors
          const apiErrors = {};
          data.errors.forEach(err => {
            apiErrors[err.param] = err.msg;
          });
          setErrors(apiErrors);
        } else {
          // Show general error message
          alert(data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Network error. Please check if backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-white"
        >
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-100/50">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
            {userType === 'student' ? 'Welcome Aboard!' : 'Application Received!'}
          </h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            {userType === 'student' 
              ? 'Your student account has been created. Redirecting you to your learning dashboard...'
              : 'Your tutor application has been submitted for review. We will notify you via email once approved.'}
          </p>
          <div className="flex items-center justify-center space-x-2 text-indigo-600 font-bold">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            <span className="ml-2">Redirecting...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 overflow-hidden flex flex-col lg:flex-row relative z-10 border border-white"
      >
        {/* Left Side - Branding & Info */}
        {/* FIXED: Changed bg-linear-to-br to bg-gradient-to-br */}
        <div className="lg:w-4/12 bg-gradient-to-br from-indigo-600 to-indigo-800 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <Link to="/login" className="flex items-center space-x-2 text-indigo-200 hover:text-white transition-colors mb-12 group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-widest">Back to Login</span>
            </Link>
            
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight">Smart<span className="text-indigo-200">Kuppi</span></span>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Start your learning journey today.
            </h2>
            
            <div className="space-y-6 mt-12">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-indigo-200" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Expert Tutors</h4>
                  <p className="text-indigo-100/70 text-sm">Learn from the best in the field with personalized guidance.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-indigo-200" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Rich Resources</h4>
                  <p className="text-indigo-100/70 text-sm">Access a vast library of study materials and recorded sessions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>
        </div>

        {/* Right Side - Form */}
        <div className="lg:w-8/12 p-8 sm:p-12 bg-white overflow-y-auto max-h-[90vh] lg:max-h-none">
          <div className="max-w-2xl mx-auto w-full">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Create Account</h3>
                <p className="text-slate-500 font-medium">Join our community of learners and educators.</p>
              </div>
              
              {/* User Type Switcher */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => setUserType('student')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    userType === 'student' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => setUserType('tutor')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    userType === 'tutor' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Tutor
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section: Basic Info */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-slate-400">
                  <User className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Basic Information</span>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 ${
                          errors.name ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                        } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400`}
                        placeholder="Kamal Perera"
                      />
                    </div>
                    {errors.name && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 ${
                          errors.email ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                        } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400`}
                        placeholder="kamal@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`block w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 ${
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
                    {errors.password && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`block w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 ${
                          errors.confirmPassword ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                        } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.confirmPassword}</p>}
                  </div>

                  {/* Phone */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 ${
                          errors.phone ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                        } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400`}
                        placeholder="+94 7X XXX XXXX"
                      />
                    </div>
                    {errors.phone && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Section: Role Specific Info */}
              <AnimatePresence mode="wait">
                {userType === 'student' ? (
                  <motion.div 
                    key="student-fields"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center space-x-2 text-slate-400">
                      <GraduationCap className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Academic Information</span>
                      <div className="flex-1 h-px bg-slate-100"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Student ID</label>
                        <input
                          type="text"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleChange}
                          className={`block w-full px-4 py-3.5 bg-slate-50 border-2 ${
                            errors.studentId ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                          } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400`}
                          placeholder="IT20XXXXXX"
                        />
                        {errors.studentId && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.studentId}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">University</label>
                        <select
                          name="university"
                          value={formData.university}
                          onChange={handleChange}
                          className={`block w-full px-4 py-3.5 bg-slate-50 border-2 ${
                            errors.university ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                          } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium appearance-none cursor-pointer`}
                        >
                          <option value="">Select University</option>
                          {universities.map(uni => <option key={uni} value={uni}>{uni}</option>)}
                        </select>
                        {errors.university && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.university}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Faculty</label>
                        <select
                          name="faculty"
                          value={formData.faculty}
                          onChange={handleChange}
                          className={`block w-full px-4 py-3.5 bg-slate-50 border-2 ${
                            errors.faculty ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                          } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium appearance-none cursor-pointer`}
                        >
                          <option value="">Select Faculty</option>
                          {faculties.map(fac => <option key={fac} value={fac}>{fac}</option>)}
                        </select>
                        {errors.faculty && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.faculty}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Academic Year</label>
                        <select
                          name="academicYear"
                          value={formData.academicYear}
                          onChange={handleChange}
                          className={`block w-full px-4 py-3.5 bg-slate-50 border-2 ${
                            errors.academicYear ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                          } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium appearance-none cursor-pointer`}
                        >
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Postgraduate">Postgraduate</option>
                        </select>
                        {errors.academicYear && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.academicYear}</p>}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="tutor-fields"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Professional Information</span>
                      <div className="flex-1 h-px bg-slate-100"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Qualifications</label>
                        <input
                          type="text"
                          name="qualifications"
                          value={formData.qualifications}
                          onChange={handleChange}
                          className={`block w-full px-4 py-3.5 bg-slate-50 border-2 ${
                            errors.qualifications ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                          } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400`}
                          placeholder="B.Sc. in Computer Science"
                        />
                        {errors.qualifications && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.qualifications}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Specialization</label>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          className={`block w-full px-4 py-3.5 bg-slate-50 border-2 ${
                            errors.specialization ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                          } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400`}
                          placeholder="Web Development"
                        />
                        {errors.specialization && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.specialization}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Years of Experience</label>
                        <input
                          type="number"
                          name="yearsOfExperience"
                          value={formData.yearsOfExperience}
                          onChange={handleChange}
                          className={`block w-full px-4 py-3.5 bg-slate-50 border-2 ${
                            errors.yearsOfExperience ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                          } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400`}
                          placeholder="3"
                        />
                        {errors.yearsOfExperience && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.yearsOfExperience}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">LinkedIn Profile</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Globe className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                          </div>
                          <input
                            type="url"
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleChange}
                            className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400"
                            placeholder="https://linkedin.com/in/..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Bio / Introduction</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={3}
                        className={`block w-full px-4 py-3.5 bg-slate-50 border-2 ${
                          errors.bio ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-indigo-600'
                        } rounded-2xl focus:outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 resize-none`}
                        placeholder="Tell us about your teaching style..."
                      />
                      {errors.bio && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.bio}</p>}
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Subjects you can teach</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {subjects.map(subject => (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => handleSubjectToggle(subject)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                              formData.subjects.includes(subject)
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                              : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                            }`}
                          >
                            {subject}
                          </button>
                        ))}
                      </div>
                      {errors.subjects && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.subjects}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Terms */}
              <div className="space-y-4 pt-4">
                <label className="flex items-start cursor-pointer group">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded-md transition-all ${agreeTerms ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-400'}`}>
                      {agreeTerms && (
                        <svg className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-slate-500 leading-relaxed">
                    I agree to the <Link to="/terms" className="text-indigo-600 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-indigo-600 font-bold hover:underline">Privacy Policy</Link>. I understand my data will be processed securely.
                  </span>
                </label>
                {errors.terms && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.terms}</p>}
              </div>

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
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <span>{userType === 'student' ? 'Create Student Account' : 'Submit Tutor Application'}</span>
                      <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;