const logger = require('../config/logger');
const { ERROR_CODES } = require('../config/constants');

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(code, message, statusCode = 500, details = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Ressource non trouvée';
    error = new ApiError(ERROR_CODES.NOT_FOUND, message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} existe déjà`;
    error = new ApiError(ERROR_CODES.CONFLICT, message, 409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    error = new ApiError(
      ERROR_CODES.VALIDATION_ERROR,
      'Erreur de validation',
      400,
      details
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(ERROR_CODES.INVALID_TOKEN, 'Token invalide', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(ERROR_CODES.TOKEN_EXPIRED, 'Token expiré', 401);
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new ApiError(
        ERROR_CODES.VALIDATION_ERROR,
        'Fichier trop volumineux',
        400
      );
    } else {
      error = new ApiError(
        ERROR_CODES.VALIDATION_ERROR,
        'Erreur lors de l\'upload du fichier',
        400
      );
    }
  }

  // Handle operational errors
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    });
  }

  // Handle programming or unknown errors
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: error.message || 'Erreur serveur',
        stack: error.stack,
      },
    });
  }

  // Production - don't leak error details
  return res.status(500).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'Une erreur est survenue',
    },
  });
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new ApiError(
    ERROR_CODES.NOT_FOUND,
    `Route non trouvée - ${req.originalUrl}`,
    404
  );
  next(error);
};

/**
 * Async handler wrapper to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiError,
  errorHandler,
  notFound,
  asyncHandler,
};
