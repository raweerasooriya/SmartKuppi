import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import TutorDashboard from './pages/TutorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ForgotPassword from './pages/ForgotPassword'; // This is now used in routes
// import FourthDashboard from './pages/FourthDashboard'; // Placeholder for your 4th dashboard

function App() {
  return (
    <Router>
      {/* Remove Navbar and Footer - they are now inside Home.js */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Added this route */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/tutor-dashboard" element={<TutorDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        {/* <Route path="/fourth-dashboard" element={<FourthDashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;