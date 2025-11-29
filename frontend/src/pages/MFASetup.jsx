import React, { useState } from 'react';
import api from '../services/api';
import QRCode from 'qrcode.react';

export default function MFASetup() {
    const [secret, setSecret] = useState(null);
    const [code, setCode] = useState('');
    const [msg, setMsg] = useState('');

    async function start() {
        // in production pass authenticated userId; here simplified
        const res = await api.post('/auth/mfa/setup', { userId: 'me' });
        setSecret(res.data);
    }

    async function enable() {
        try {
            await api.post('/auth/mfa/enable', { userId: 'me', base32: secret.base32, token: code });
            setMsg('MFA enabled');
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
                    <QRCode value={secret.otpauth_url} />
                    <p>Or use secret: {secret.base32}</p>
                    <input placeholder="123456" value={code} onChange={e => setCode(e.target.value)} />
                    <button onClick={enable}>Enable MFA</button>
                </div>
            )}
            <div>{msg}</div>
        </div>
    );
}
