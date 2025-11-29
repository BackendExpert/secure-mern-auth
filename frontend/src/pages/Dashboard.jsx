import React from 'react';
import useAuth from '../hooks/useAuth';

export default function Dashboard() {
    const { logout } = useAuth();
    return (
        <div>
            <h2>Protected Dashboard</h2>
            <button onClick={logout}>Logout</button>
        </div>
    );
}
