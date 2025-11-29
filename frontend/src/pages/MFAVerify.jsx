import React, { useState } from 'react';
import api from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function MFAVerify() {
    const [code, setCode] = useState('');
    const loc = useLocation();
    const navigate = useNavigate();
    const { loginWithAccess } = useAuth();
    const userId = loc.state?.userId || '';

    async function submit(e) {
        e.preventDefault();
        try {
            const res = await api.post('/auth/mfa/login-verify', { userId, token: code, device: 'web' });
            const access = res.data.access;
            loginWithAccess(access, { id: userId });
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        }
    }

    return (
        <form onSubmit={submit}>
            <h2>MFA Verify</h2>
            <input placeholder="123456" value={code} onChange={e => setCode(e.target.value)} />
            <button type="submit">Verify & Login</button>
        </form>
    );
}
