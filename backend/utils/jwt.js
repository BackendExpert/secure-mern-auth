const jwt = require('jsonwebtoken');

function signAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXP || '15m' });
}
function signRefreshToken(payload) {
    const days = process.env.JWT_REFRESH_EXP_DAYS || 30;
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: `${days}d` });
}
function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}
function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken, verifyAccessToken };
