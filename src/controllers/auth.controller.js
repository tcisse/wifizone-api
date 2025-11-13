const { User } = require('../models');
const { jwtService, emailService } = require('../services');
const { ApiError, asyncHandler } = require('../middlewares/errorHandler');
const { ERROR_CODES } = require('../config/constants');
const logger = require('../config/logger');

/**
 * Register new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { email, phone, password, firstname, lastname, country, referralCode } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(ERROR_CODES.EMAIL_ALREADY_EXISTS, 'Email déjà utilisé', 409);
    }
    throw new ApiError(ERROR_CODES.PHONE_ALREADY_EXISTS, 'Téléphone déjà utilisé', 409);
  }

  // Handle referral code
  let referrer = null;
  if (referralCode) {
    referrer = await User.findOne({ referralCode });
    if (!referrer) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Code de parrainage invalide', 404);
    }
  }

  // Create user
  const user = await User.create({
    email,
    phone,
    password,
    firstname,
    lastname,
    country,
    referredBy: referrer ? referrer._id : null,
  });

  // Generate referral code for new user
  user.referralCode = user.generateReferralCode();
  await user.save();

  // Generate email verification token
  const verificationToken = jwtService.generateRandomToken();
  user.emailVerificationToken = jwtService.hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await user.save();

  // Send welcome email
  try {
    await emailService.sendWelcomeEmail(user, verificationToken);
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
  }

  // Generate tokens
  const tokens = jwtService.generateTokens(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès',
    data: {
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        firstname: user.firstname,
        lastname: user.lastname,
        country: user.country,
        kycStatus: user.kycStatus,
        referralCode: user.referralCode,
      },
      tokens,
    },
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  // Find user by email or phone
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(ERROR_CODES.INVALID_CREDENTIALS, 'Identifiants invalides', 401);
  }

  // Check if user is active
  if (!user.isActive || user.deletedAt) {
    throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Compte désactivé', 401);
  }

  // Generate tokens
  const tokens = jwtService.generateTokens(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        firstname: user.firstname,
        lastname: user.lastname,
        kycStatus: user.kycStatus,
        balance: user.balance,
      },
      tokens,
    },
  });
});

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists
    return res.json({
      success: true,
      message: 'Email de réinitialisation envoyé',
    });
  }

  // Generate reset token
  const resetToken = jwtService.generateRandomToken();
  user.passwordResetToken = jwtService.hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // Send email
  try {
    await emailService.sendPasswordResetEmail(user, resetToken);
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    throw new ApiError(ERROR_CODES.INTERNAL_ERROR, 'Erreur lors de l\'envoi de l\'email', 500);
  }

  res.json({
    success: true,
    message: 'Email de réinitialisation envoyé',
  });
});

/**
 * Reset password
 * POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const hashedToken = jwtService.hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken');

  if (!user) {
    throw new ApiError(ERROR_CODES.INVALID_TOKEN, 'Token invalide ou expiré', 400);
  }

  // Update password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Mot de passe réinitialisé avec succès',
  });
});

/**
 * Verify email
 * POST /api/auth/verify-email
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const hashedToken = jwtService.hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken');

  if (!user) {
    throw new ApiError(ERROR_CODES.INVALID_TOKEN, 'Token invalide ou expiré', 400);
  }

  // Verify email
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Email vérifié avec succès',
  });
});

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
