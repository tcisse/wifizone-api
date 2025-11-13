const rateLimit = require('express-rate-limit');
const { ERROR_CODES } = require('../config/constants');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: {
    success: false,
    error: {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Trop de requêtes, veuillez réessayer plus tard.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || 5),
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Trop de tentatives, veuillez réessayer dans 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Trop de demandes de réinitialisation, veuillez réessayer dans 1 heure.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Trop d\'uploads, veuillez réessayer dans 1 minute.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
};
