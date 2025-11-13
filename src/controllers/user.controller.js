const { User } = require('../models');
const { ApiError, asyncHandler } = require('../middlewares/errorHandler');
const { ERROR_CODES } = require('../config/constants');

/**
 * Get current user profile
 * GET /api/users/me
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      phone: user.phone,
      firstname: user.firstname,
      lastname: user.lastname,
      country: user.country,
      kycStatus: user.kycStatus,
      balance: user.balance,
      referralCode: user.referralCode,
      notificationPreferences: user.notificationPreferences,
      createdAt: user.createdAt,
    },
  });
});

/**
 * Update user profile
 * PUT /api/users/me
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { firstname, lastname, phone, country } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(ERROR_CODES.NOT_FOUND, 'Utilisateur non trouvé', 404);
  }

  // Check if phone is already taken by another user
  if (phone && phone !== user.phone) {
    const existingUser = await User.findOne({ phone, _id: { $ne: user._id } });
    if (existingUser) {
      throw new ApiError(ERROR_CODES.PHONE_ALREADY_EXISTS, 'Téléphone déjà utilisé', 409);
    }
  }

  // Update fields
  if (firstname) user.firstname = firstname;
  if (lastname) user.lastname = lastname;
  if (phone) user.phone = phone;
  if (country) user.country = country;

  await user.save();

  res.json({
    success: true,
    message: 'Profil mis à jour avec succès',
    data: user,
  });
});

/**
 * Change password
 * PUT /api/users/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    throw new ApiError(ERROR_CODES.NOT_FOUND, 'Utilisateur non trouvé', 404);
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(ERROR_CODES.INVALID_CREDENTIALS, 'Mot de passe actuel incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Mot de passe modifié avec succès',
  });
});

/**
 * Delete user account
 * DELETE /api/users/me
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(ERROR_CODES.NOT_FOUND, 'Utilisateur non trouvé', 404);
  }

  // Soft delete
  user.deletedAt = new Date();
  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: 'Compte supprimé avec succès',
  });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};
