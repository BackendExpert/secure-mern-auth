const argon2 = require('argon2');
const { v4: uuidv4 } = require('uuid');
const speakeasy = require('speakeasy');
const User = require('../models/user.model');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');
const { sendMail } = require('../utils/mailer');

const REFRESH_DAYS = Number(process.env.JWT_REFRESH_EXP_DAYS || 30);

function createRefreshRecord(device = '') {
    const tokenId = uuidv4();
    const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
    return { tokenId, issuedAt: new Date(), expiresAt, device };
}

module.exports = {
    async register({ email, password, name, frontendUrl }) {
        const existing = await User.findOne({ email });
        if (existing) throw new Error('Email in use');

        const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

        const verificationToken = uuidv4();
        const user = new User({
            email,
            passwordHash,
            name,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        await user.save();

        const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
        await sendMail({
            to: email,
            subject: 'Verify your account',
            text: `Verify: ${verifyUrl}`,
            html: `<p>Verify your account: <a href="${verifyUrl}">${verifyUrl}</a></p>`
        });

        return { id: user._id, email: user.email };
    },

    async verifyEmail({ token, email }) {
        const user = await User.findOne({ email, emailVerificationToken: token });
        if (!user) throw new Error('Invalid token');
        if (user.emailVerificationExpires < new Date()) throw new Error('Token expired');
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        return true;
    },

    async login({ email, password, device }) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('Invalid credentials');

        if (user.lockUntil && user.lockUntil > Date.now()) throw new Error('Account locked');

        const ok = await argon2.verify(user.passwordHash, password);
        if (!ok) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= 5) user.lockUntil = Date.now() + 15 * 60 * 1000;
            await user.save();
            throw new Error('Invalid credentials');
        }

        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        // If MFA enabled: signal frontend to ask for TOTP (no tokens now)
        if (user.mfa?.enabled) {
            return { mfaRequired: true, userId: user._id };
        }

        // Issue tokens
        const access = signAccessToken({ sub: user._id, email: user.email });
        const record = createRefreshRecord(device);
        user.refreshTokens.push(record);
        await user.save();
        const refresh = signRefreshToken({ sub: user._id, tokenId: record.tokenId });
        return { access, refresh, user: { id: user._id, email: user.email } };
    },

    async verifyMfaAndCreateSession({ userId, token, device }) {
        const user = await User.findById(userId);
        if (!user || !user.mfa?.enabled) throw new Error('Invalid user/mfa');

        const ok = speakeasy.totp.verify({ secret: user.mfa.totpSecret, encoding: 'base32', token, window: 1 });
        if (!ok) throw new Error('Invalid MFA');

        const access = signAccessToken({ sub: user._id, email: user.email });
        const record = createRefreshRecord(device);
        user.refreshTokens.push(record);
        await user.save();
        const refresh = signRefreshToken({ sub: user._id, tokenId: record.tokenId });
        return { access, refresh };
    },

    async setupMfa(userId) {
        const secret = speakeasy.generateSecret({ length: 20, name: `SecureApp (${userId})` });
        // Only return values to be shown on frontend; do not commit to DB until user verifies
        return { otpauth_url: secret.otpauth_url, base32: secret.base32 };
    },

    async enableMfa({ userId, base32, token }) {
        const ok = speakeasy.totp.verify({ secret: base32, encoding: 'base32', token, window: 1 });
        if (!ok) throw new Error('Invalid code');
        const user = await User.findById(userId);
        user.mfa = { enabled: true, totpSecret: base32 };
        await user.save();
        return true;
    },

    async refresh({ refreshToken }) {
        // verify and rotate
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const { sub: userId, tokenId } = payload;
        const user = await User.findById(userId);
        if (!user) throw new Error('Invalid refresh');

        const rec = user.refreshTokens.find(r => r.tokenId === tokenId);
        if (!rec || rec.revoked) throw new Error('Invalid refresh');

        // revoke old & create new
        rec.revoked = true;
        const newRec = createRefreshRecord(rec.device);
        rec.replacedBy = newRec.tokenId;
        user.refreshTokens.push(newRec);
        // prune
        user.refreshTokens = user.refreshTokens.filter(r => new Date(r.expiresAt) > new Date() && !r.revoked).slice(-10);
        await user.save();

        const access = signAccessToken({ sub: user._id, email: user.email });
        const refresh = signRefreshToken({ sub: user._id, tokenId: newRec.tokenId });
        return { access, refresh };
    },

    async logout({ refreshToken }) {
        try {
            const jwt = require('jsonwebtoken');
            const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const { sub: userId, tokenId } = payload;
            const user = await User.findById(userId);
            if (user) {
                const rec = user.refreshTokens.find(r => r.tokenId === tokenId);
                if (rec) rec.revoked = true;
                await user.save();
            }
        } catch (e) { }
        return true;
    }
};
