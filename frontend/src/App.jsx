import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyPage from './pages/VerifyPage';
import AdminDashboard from './pages/AdminDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import Navbar from './components/Navbar';

// Simple Layout Wrapper
const Layout = ({ children }) => (
  <div className="min-h-screen bg-background flex flex-col w-full">
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-6xl w-full mx-auto px-4 md:px-8">
        {children}
      </div>
    </div>
    <Navbar />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<Layout><HospitalDashboard /></Layout>} />
        <Route path="/verify" element={<Layout><VerifyPage /></Layout>} />
        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/hospital" element={<Layout><HospitalDashboard /></Layout>} />
        <Route path="/manufacturer" element={<Layout><ManufacturerDashboard /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
