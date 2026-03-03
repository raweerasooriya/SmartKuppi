import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminTutorApprovals from './pages/AdminTutorApprovals';
import TutorDashboard from './pages/TutorDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/tutor-approvals" element={<AdminTutorApprovals />} />
        
        {/* Other Dashboards */}
        <Route path="/tutor-dashboard" element={<TutorDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;