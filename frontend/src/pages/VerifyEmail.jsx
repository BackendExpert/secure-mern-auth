import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [msg, setMsg] = useState('Redirecting to verify your email...');

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
            setMsg('Invalid verification link.');
            return;
        }

        // Use full backend URL to avoid React Router catching it
        window.location.href = `http://localhost:5000/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    }, [searchParams]);

    return (
        <div style={{ padding: 20 }}>
            <h2>{msg}</h2>
        </div>
    );
}
