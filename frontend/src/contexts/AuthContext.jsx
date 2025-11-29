import React, { createContext, useEffect, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // try to fetch profile or validate token on mount
        const token = localStorage.getItem('access_token');
        if (token) {
            // optionally fetch user profile
            setUser({}); // placeholder
        }
    }, []);

    const loginWithAccess = (access, userObj) => {
        localStorage.setItem('access_token', access);
        setUser(userObj || {});
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) { }
        localStorage.removeItem('access_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loginWithAccess, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
