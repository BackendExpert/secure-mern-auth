import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // Optionally fetch user profile here from backend if available
            // For now, user info must come from login response
            setUser(JSON.parse(localStorage.getItem('user')) || null);
        }
    }, []);

    const loginWithAccess = (access, userObj) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('user', JSON.stringify(userObj)); // save user for refresh
        setUser(userObj);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) { }
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loginWithAccess, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
