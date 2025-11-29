import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import MFASetup from './pages/MFASetup';
import MFAVerify from './pages/MFAVerify';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import VerifyEmail from './pages/VerifyEmail';

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <nav>
        <Link to="/register">Register</Link>{" | "}
        <Link to="/login">Login</Link>{" | "}
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/" element={<div>Welcome</div>} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mfa/setup" element={<MFASetup />} />
        <Route path="/mfa/verify" element={<MFAVerify />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
