// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
// import ForgotPassword from './pages/ForgotPassword';  // <-- DELETE this line
import AdminDashboard from './pages/AdminDashboard';
import TutorDashboard from './pages/TutorDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Create a wrapper component to use useNavigate
const AppRoutes = () => {
  const navigate = useNavigate();
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}  {/* <-- DELETE this line */}

      {/* Admin Routes */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      {/* Tutor Routes – all handled by TutorDashboard */}
      <Route path="/tutor-dashboard" element={<TutorDashboard initialView="dashboard" />} />
      <Route path="/tutor/courses" element={<TutorDashboard initialView="courses" />} />
      <Route path="/tutor/create-course" element={<TutorDashboard initialView="create-course" />} />
      <Route path="/tutor/courses/:courseId" element={<TutorDashboard initialView="courseDetail" />} />
      <Route path="/tutor/messages" element={<TutorDashboard initialView="messages" />} />
      <Route path="/tutor/create-lesson" element={<TutorDashboard initialView="lessonCreate" />} />
      <Route path="/tutor/upload-resource" element={<TutorDashboard initialView="resourceUpload" />} />
      <Route path="/tutor/schedule" element={<TutorDashboard initialView="schedule" />} />

      {/* Student Routes – all consolidated into StudentDashboard */}
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/courses" element={<StudentDashboard />} />
      <Route path="/browse-courses" element={<StudentDashboard />} />
      <Route path="/discussions" element={<StudentDashboard />} />
      <Route path="/schedule" element={<StudentDashboard />} />
      <Route path="/student/courses/:courseId" element={<StudentDashboard />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;