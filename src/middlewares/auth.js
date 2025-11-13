const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ERROR_CODES } = require('../config/constants');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Token non fourni',
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive || user.deletedAt) {
        return res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.UNAUTHORIZED,
            message: 'Utilisateur non trouvé ou désactivé',
          },
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.TOKEN_EXPIRED,
            message: 'Token expiré',
          },
        });
      }

      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'Token invalide',
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Non authentifié',
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: 'Accès interdit',
        },
      });
    }

    next();
  };
};

/**
 * Check if user KYC is verified
 */
const requireKYC = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Non authentifié',
      },
    });
  }

  if (req.user.kycStatus !== 'verified') {
    return res.status(403).json({
      success: false,
      error: {
        code: ERROR_CODES.KYC_REQUIRED,
        message: 'Vérification KYC requise',
      },
    });
  }

  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive && !user.deletedAt) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  authorize,
  requireKYC,
  optionalAuth,
};
