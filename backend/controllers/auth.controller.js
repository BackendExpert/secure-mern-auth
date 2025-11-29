const authService = require('../services/auth.service')

exports.register = async (req, res) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL;
        const { email, password, name } = req.body;
        const user = await authService.register({ email, password, name, frontendUrl });
        res.status(201).json({ message: 'Registered. Check your email.' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token, email } = req.query;
        await authService.verifyEmail({ token, email });
        return res.redirect(`${process.env.FRONTEND_URL}/email-verified`);
    } catch (err) {
        return res.status(400).send(err.message);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, device } = req.body;
        const result = await authService.login({ email, password, device });
        if (result.mfaRequired) return res.json({ mfaRequired: true, userId: result.userId });

        // set refresh cookie
        res.cookie('refresh_token', result.refresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * Number(process.env.JWT_REFRESH_EXP_DAYS || 30),
            domain: process.env.COOKIE_DOMAIN || undefined
        });
        res.json({ access: result.access, user: result.user });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

exports.mfaVerifyLogin = async (req, res) => {
    try {
        const { userId, token, device } = req.body;
        const result = await authService.verifyMfaAndCreateSession({ userId, token, device });
        res.cookie('refresh_token', result.refresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * Number(process.env.JWT_REFRESH_EXP_DAYS || 30),
            domain: process.env.COOKIE_DOMAIN || undefined
        });
        res.json({ access: result.access });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

exports.setupMfa = async (req, res) => {
    try {
        const userId = req.body.userId; // in prod use auth middleware
        const secret = await authService.setupMfa(userId);
        res.json(secret);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.enableMfa = async (req, res) => {
    try {
        const { userId, base32, token } = req.body;
        await authService.enableMfa({ userId, base32, token });
        res.json({ message: 'MFA enabled' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token || req.body.refresh;
        const result = await authService.refresh({ refreshToken });
        res.cookie('refresh_token', result.refresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * Number(process.env.JWT_REFRESH_EXP_DAYS || 30),
            domain: process.env.COOKIE_DOMAIN || undefined
        });
        res.json({ access: result.access });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token || req.body.refresh;
        await authService.logout({ refreshToken });
        res.clearCookie('refresh_token', { domain: process.env.COOKIE_DOMAIN || undefined });
        res.json({ message: 'Logged out' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
