const QRCode = require('qrcode');
const { PAGINATION } = require('../config/constants');

/**
 * Generate QR code as base64
 * @param {string} data - Data to encode
 * @returns {Promise<string>} Base64 QR code
 */
const generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(data);
  } catch (error) {
    throw new Error('Error generating QR code');
  }
};

/**
 * Calculate pagination metadata
 * @param {number} total - Total items
 * @param {number} page - Current page
 * @param {number} perPage - Items per page
 * @returns {Object} Pagination metadata
 */
const getPaginationMetadata = (total, page, perPage) => {
  const totalPages = Math.ceil(total / perPage);

  return {
    total,
    page,
    perPage,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Parse pagination query params
 * @param {Object} query - Request query params
 * @returns {Object} Parsed pagination params
 */
const parsePaginationParams = (query) => {
  const page = parseInt(query.page) || PAGINATION.DEFAULT_PAGE;
  const perPage = Math.min(
    parseInt(query.perPage) || PAGINATION.DEFAULT_PER_PAGE,
    PAGINATION.MAX_PER_PAGE
  );
  const skip = (page - 1) * perPage;

  return { page, perPage, skip };
};

/**
 * Parse sort params
 * @param {Object} query - Request query params
 * @returns {Object} Mongoose sort object
 */
const parseSortParams = (query) => {
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  return { [sortBy]: sortOrder };
};

/**
 * Parse date range params
 * @param {Object} query - Request query params
 * @returns {Object} Date range filter
 */
const parseDateRange = (query) => {
  const filter = {};

  if (query.startDate) {
    filter.$gte = new Date(query.startDate);
  }

  if (query.endDate) {
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999); // End of day
    filter.$lte = endDate;
  }

  return Object.keys(filter).length > 0 ? filter : null;
};

/**
 * Get date range from period
 * @param {string} period - Period ('today', '7d', '30d', '90d')
 * @returns {Object} Date range
 */
const getDateRangeFromPeriod = (period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case '7d':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case '30d':
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case '90d':
      startDate = new Date(now.setDate(now.getDate() - 90));
      break;
    default:
      return null;
  }

  return {
    $gte: startDate,
    $lte: new Date(),
  };
};

/**
 * Generate unique code
 * @param {string} prefix - Code prefix
 * @param {number} length - Code length (excluding prefix)
 * @returns {string} Unique code
 */
const generateUniqueCode = (prefix = '', length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix;

  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};

/**
 * Format currency (FCFA)
 * @param {number} amount - Amount
 * @returns {string} Formatted amount
 */
const formatCurrency = (amount) => {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};

/**
 * Calculate commission
 * @param {number} amount - Base amount
 * @param {number} rate - Commission rate (e.g., 0.05 for 5%)
 * @returns {number} Commission amount
 */
const calculateCommission = (amount, rate) => {
  return Math.round(amount * rate);
};

/**
 * Calculate withdrawal fees
 * @param {number} amount - Withdrawal amount
 * @returns {Object} Fees breakdown
 */
const calculateWithdrawalFees = (amount) => {
  const percentageFee = calculateCommission(amount, parseFloat(process.env.WITHDRAWAL_FEE || 0.02));
  const fixedFee = parseInt(process.env.WITHDRAWAL_FEE_FIXED || 0);
  const totalFees = percentageFee + fixedFee;
  const netAmount = amount + totalFees;

  return {
    amount,
    percentageFee,
    fixedFee,
    totalFees,
    netAmount,
  };
};

/**
 * Sanitize search query
 * @param {string} search - Search query
 * @returns {string} Sanitized query
 */
const sanitizeSearchQuery = (search) => {
  if (!search) return '';
  return search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
};

/**
 * Generate random password
 * @param {number} length - Password length
 * @returns {string} Random password
 */
const generateRandomPassword = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
};

/**
 * Check if date is expired
 * @param {Date} date - Date to check
 * @returns {boolean} True if expired
 */
const isExpired = (date) => {
  return new Date() > new Date(date);
};

/**
 * Format duration in seconds to human readable
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  }

  return `${minutes}min`;
};

/**
 * Format bytes to human readable
 * @param {number} bytes - Bytes
 * @returns {string} Formatted size
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

module.exports = {
  generateQRCode,
  getPaginationMetadata,
  parsePaginationParams,
  parseSortParams,
  parseDateRange,
  getDateRangeFromPeriod,
  generateUniqueCode,
  formatCurrency,
  calculateCommission,
  calculateWithdrawalFees,
  sanitizeSearchQuery,
  generateRandomPassword,
  isExpired,
  formatDuration,
  formatBytes,
};
