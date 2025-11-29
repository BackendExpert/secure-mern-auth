const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
    tokenId: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    replacedBy: { type: String, default: null },
    revoked: { type: Boolean, default: false },
    device: String
});

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    name: String,
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    mfa: {
        enabled: { type: Boolean, default: false },
        totpSecret: String
    },
    refreshTokens: [RefreshTokenSchema],
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
