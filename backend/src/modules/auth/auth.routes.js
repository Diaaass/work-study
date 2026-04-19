const router = require('express').Router();
const {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} = require('./auth.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendVerificationCode);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
