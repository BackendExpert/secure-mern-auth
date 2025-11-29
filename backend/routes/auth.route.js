const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');

router.post('/register', ctrl.register);
router.get('/verify-email', ctrl.verifyEmail);
router.post('/login', ctrl.login);
router.post('/mfa/login-verify', ctrl.mfaVerifyLogin);
router.post('/mfa/setup', authenticate, ctrl.setupMfa);
router.post('/mfa/enable', ctrl.enableMfa);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);

module.exports = router;
