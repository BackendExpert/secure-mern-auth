import React, { useState } from 'react';
import api from '../services/api';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [msg, setMsg] = useState('');

    async function submit(e) {
        e.preventDefault();
        try {
            await api.post('/auth/register', { email, password, name });
            setMsg('Registered! Check your email for verification.');
        } catch (err) {
            setMsg(err.response?.data?.error || err.message);
        }
    }

    return (
        <form onSubmit={submit}>
            <h2>Register</h2>
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} /><br />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} /><br />
            <button type="submit">Register</button>
            <div>{msg}</div>
        </form>
    );
}
