import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();
    const { loginWithAccess } = useAuth();

    async function submit(e) {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password, device: 'web' });

            if (res.data.mfaRequired) {
                navigate('/mfa/verify', { state: { userId: res.data.userId } });
                setMsg('MFA required - enter code');
                return;
            }

            localStorage.setItem('access_token', res.data.access);
            loginWithAccess(res.data.access, res.data.user);

            navigate('/dashboard');
        } catch (err) {
            setMsg(err.response?.data?.error || err.message);
        }
    }

    return (
        <form onSubmit={submit}>
            <h2>Login</h2>
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} /><br />
            <button type="submit">Login</button>
            <div>{msg}</div>
        </form>
    );
}
