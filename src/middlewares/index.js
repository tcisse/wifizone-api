const { authenticate, authorize, requireKYC, optionalAuth } = require('./auth');
const { ApiError, errorHandler, notFound, asyncHandler } = require('./errorHandler');
const { validate } = require('./validation');
const {
  uploadKycDocuments,
  uploadSingleImage,
  uploadSingleCsv,
  uploadImage,
  uploadCsv,
} = require('./upload');
const {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
} = require('./rateLimit');

module.exports = {
  // Auth
  authenticate,
  authorize,
  requireKYC,
  optionalAuth,

  // Error handling
  ApiError,
  errorHandler,
  notFound,
  asyncHandler,

  // Validation
  validate,

  // Upload
  uploadKycDocuments,
  uploadSingleImage,
  uploadSingleCsv,
  uploadImage,
  uploadCsv,

  // Rate limiting
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
};
