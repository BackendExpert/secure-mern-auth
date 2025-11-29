import React, { useState } from 'react';
import api from '../services/api';
import { QRCodeCanvas } from 'qrcode.react';
import useAuth from '../hooks/useAuth';

export default function MFASetup() {
    const { user } = useAuth(); // get current logged-in user
    const [secret, setSecret] = useState(null);
    const [code, setCode] = useState('');
    const [msg, setMsg] = useState('');

    async function start() {
        if (!user || !user._id) {
            setMsg('User not logged in.');
            return;
        }

        try {
            const res = await api.post('/auth/mfa/setup', {}); // user ID comes from backend via token
            setSecret(res.data);
            setMsg('Scan the QR code or use the secret.');
        } catch (err) {
            setMsg(err.response?.data?.error || err.message);
        }
    }

    async function enable() {
        if (!user || !user._id) {
            setMsg('User not logged in.');
            return;
        }

        try {
            await api.post('/auth/mfa/enable', {
                base32: secret.base32,
                token: code
            });
            setMsg('MFA enabled successfully.');
        } catch (err) {
            setMsg(err.response?.data?.error || err.message);
        }
    }

    return (
        <div>
            <h2>MFA Setup</h2>
            {!secret && <button onClick={start}>Start MFA setup</button>}
            {secret && (
                <div>
                    <p>Scan this QR code with Authenticator app</p>
                    <QRCodeCanvas value={secret.otpauth_url} />
                    <p>Or use secret: {secret.base32}</p>
                    <input
                        placeholder="123456"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                    />
                    <button onClick={enable}>Enable MFA</button>
                </div>
            )}
            <div>{msg}</div>
        </div>
    );
}
