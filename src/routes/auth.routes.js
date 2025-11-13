const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter, passwordResetLimiter } = require('../middlewares');

// Auth routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);

module.exports = router;
