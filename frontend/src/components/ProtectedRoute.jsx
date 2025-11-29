import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const token = localStorage.getItem('access_token');
    if (!token) return <Navigate to="/login" replace />;
    return children;
}
